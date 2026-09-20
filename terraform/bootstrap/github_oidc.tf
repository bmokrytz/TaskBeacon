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
          }
          StringLike = {
            # Strictly limits access to TaskBeacon repository
            "token.actions.githubusercontent.com:sub" = "repo:bmokrytz/TaskBeacon:*"
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

# Output the Role ARN so you can copy it to GitHub later
output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "The ARN of the IAM role for GitHub Actions to assume."
}