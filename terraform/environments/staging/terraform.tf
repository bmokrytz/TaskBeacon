terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Remote state in the bucket created by terraform/bootstrap
  # (backend blocks can't use variables or locals, so values are hardcoded)
  backend "s3" {
    bucket       = "taskbeacon-tfstate-oyrheu8l2ka5yqor5e-01"
    key          = "staging/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true # S3-native state locking (prevents two applies at once)
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "TaskBeacon"
      ManagedBy   = "Terraform"
      Owner       = "bmokrytz"
      Environment = "staging"
    }
  }
}

# Public domain names for this environment (DNS records live in Cloudflare, not Route 53)
locals {
  api_domain      = "api-staging.taskbeacon.ca"
  frontend_domain = "staging.taskbeacon.ca"
}
