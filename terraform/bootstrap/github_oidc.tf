# Fetch GitHub's OpenID Connect SSL certificate
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

# Register GitHub as a trusted Identity Provider (IdP) in AWS
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
}

# Create IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = "taskbeacon-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            # Only workflows running on the deploy branches of the TaskBeacon repository
            "token.actions.githubusercontent.com:sub" = [
              "repo:bmokrytz/TaskBeacon:ref:refs/heads/staging",
              "repo:bmokrytz/TaskBeacon:ref:refs/heads/production",
            ]
          }
        }
      }
    ]
  })
}

# Attach state file permissions to the IAM role
resource "aws_iam_role_policy" "github_actions_state_access" {
  name = "taskbeacon-state-access"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.terraform_state.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/*"
      }
    ]
  })
}

# Current AWS account ID, used to build ARNs for resources owned by the environment stacks
data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
}

# Attach deploy permissions to the IAM role (push images, redeploy ECS, publish frontend)
# Resources are matched by name pattern because they live in the environment stacks, not here
resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "taskbeacon-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # ECR login token is account-wide, so it cannot be scoped to a repository
        Sid      = "EcrLogin"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "EcrPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
        ]
        Resource = "arn:aws:ecr:us-east-1:${local.account_id}:repository/taskbeacon-*"
      },
      {
        Sid      = "EcsRedeploy"
        Effect   = "Allow"
        Action   = ["ecs:UpdateService", "ecs:DescribeServices"]
        Resource = "arn:aws:ecs:us-east-1:${local.account_id}:service/taskbeacon-*/*"
      },
      {
        Sid      = "FrontendBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::taskbeacon-*-frontend-*"
      },
      {
        Sid      = "FrontendBucketWrite"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "arn:aws:s3:::taskbeacon-*-frontend-*/*"
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
        Resource = "arn:aws:cloudfront::${local.account_id}:distribution/*"
      }
    ]
  })
}

# Output the Role ARN so you can copy it to GitHub later
output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "The ARN of the IAM role for GitHub Actions to assume."
}