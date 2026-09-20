# 1. ECR Repository to store FastAPI Docker images
resource "aws_ecr_repository" "api" {
  name                 = "taskbeacon-staging-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "taskbeacon-staging-api-ecr"
  }
}

# 2. Lifecycle policy to only keep 5 images at a time to keep costs low
resource "aws_ecr_lifecycle_policy" "api_cleanup" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep only the last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}