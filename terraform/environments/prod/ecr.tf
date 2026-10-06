resource "aws_ecr_repository" "api" {
    name                    = "taskbeacon-production-api-ecr"
    image_tag_mutability    = "MUTABLE"

    image_scanning_configuration {
        scan_on_push = true
    }

    tags = {
        Name = "taskbeacon-production-api-ecr"
    }
}

resource "aws_ecr_lifecycle_policy" "api_cleanup" {
    repository = aws_ecr_repository.api.name

    policy = jsonencode({
        rules = [
            {
                rulePriority    = 1,
                description     = "Keep only the last 5 images"
                selection = {
                    tagStatus   = "any"
                    countType   = "imageCountMoreThan"
                    countNumber = 5
                },
                action = {
                    type = "expire"
                }
            }
        ]
    })

}