# 1. CloudWatch Log Group for container logs
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/taskbeacon-staging-api"
  retention_in_days = 7

  tags = {
    Name = "taskbeacon-staging-ecs-logs"
  }
}

# 2. ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "taskbeacon-staging-cluster"
}

# 3. IAM Execution Role (Allows ECS agent to pull ECR images and write CloudWatch logs)
resource "aws_iam_role" "ecs_execution_role" {
  name = "taskbeacon-staging-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach standard AWS policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Secrets are created manually in SSM Parameter Store (never stored in Terraform state).
# Terraform only references them by ARN so ECS can inject them at container start.
data "aws_caller_identity" "current" {}

locals {
  ssm_prefix_arn = "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/taskbeacon/staging"
}

# Allow the execution role to read this environment's secrets
# (alias/aws/ssm is an AWS-managed key, so no extra kms:Decrypt permission is needed)
resource "aws_iam_role_policy" "ecs_execution_read_secrets" {
  name = "taskbeacon-staging-read-secrets"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameters"]
        Resource = "${local.ssm_prefix_arn}/*"
      }
    ]
  })
}

# 4. IAM Task Role (Permissions for the running app itself)
resource "aws_iam_role" "ecs_task_role" {
  name = "taskbeacon-staging-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# 5. ECS Task Definition (Fargate configuration)
resource "aws_ecs_task_definition" "api" {
  family                   = "taskbeacon-staging-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # 0.25 vCPU (minimal size)
  memory                   = "512" # 512 MB RAM (minimal size)
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.api.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      # Non-secret config, read by app/core/settings.py
      environment = [
        { name = "ENV", value = "PROD" },
        { name = "LOG_LEVEL", value = "INFO" },
        { name = "CORS_ORIGINS", value = jsonencode(["https://${local.frontend_domain}"]) },
        # Host filtering is done by the ALB listener rule; ALB health checks use the task IP as Host
        { name = "ALLOWED_HOSTS", value = "*" },
        # Trust X-Forwarded-For from the ALB so rate limiting sees real client IPs
        # (safe because the ECS security group only accepts traffic from the ALB)
        { name = "FORWARDED_ALLOW_IPS", value = "*" },
      ]

      # Secrets pulled from SSM Parameter Store at container start
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${local.ssm_prefix_arn}/DATABASE_URL" },
        { name = "JWT_SECRET", valueFrom = "${local.ssm_prefix_arn}/JWT_SECRET" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "api"
        }
      }
    }
  ])
}

# 6. ECS Service (Runs and maintains the Fargate tasks)
resource "aws_ecs_service" "api" {
  name            = "taskbeacon-staging-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8000
  }

  lifecycle {
    ignore_changes = [ desired_count ]
  }

  # Give the container time to wait for the DB and run migrations before health checks count
  health_check_grace_period_seconds = 60

  depends_on = [aws_lb_listener_rule.api]
}

# 7. Auto Scaling Target (Registers ECS service and defines limits)
resource "aws_appautoscaling_target" "ecs_target" {
    max_capacity        = 4
    min_capacity        = 1
    resource_id         = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
    scalable_dimension  = "ecs:service:DesiredCount"
    service_namespace   = "ecs"
}

# 8. Target Tracking Scaling Policy (Triggers on 70% CPU threshold)
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
    name                = "taskbeacon-staging-cpu-autoscaling"
    policy_type         = "TargetTrackingScaling"
    resource_id         = aws_appautoscaling_target.ecs_target.resource_id
    scalable_dimension  = aws_appautoscaling_target.ecs_target.scalable_dimension
    service_namespace   = aws_appautoscaling_target.ecs_target.service_namespace

    target_tracking_scaling_policy_configuration {
      target_value          = 70.0 # Maintain 70% average CPU utilization
      scale_in_cooldown     = 300 # Wait 5 mins before removing tasks
      scale_out_cooldown    = 60 # Wait 1 min before adding tasks

      predefined_metric_specification {
        predefined_metric_type = "ECSServiceAverageCPUUtilization"
      }
    }
}
