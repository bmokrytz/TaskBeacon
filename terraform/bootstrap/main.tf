terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 6.0"
        }
        tls = {
            source = "hashicorp/tls"
            version = "~> 4.0"
        }
    }
}

provider "aws" {
    region = "us-east-1"

    default_tags {
        tags = {
            Project     = "TaskBeacon"
            ManagedBy   = "Terraform"
            Owner       = "bmokrytz"
        }
    }
}

resource "aws_s3_bucket" "terraform_state" {
    bucket = "taskbeacon-tfstate-oyrheu8l2ka5yqor5e-01"

    lifecycle {
        prevent_destroy = true
    }

    tags = {
        Name        = "taskbeacon-remote-tfstate-bucket"
        Description = "Remote terraform state storage for TaskBeacon application."
    }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
    bucket = aws_s3_bucket.terraform_state.id
    versioning_configuration {
      status = "Enabled"
    }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
