terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Remote state in the bucket created by terraform/bootstrap
  backend "s3" {
    bucket          = "taskbeacon-tfstate-oyrheu8l2ka5yqor5e-01"
    key             = "production/terraform.tfstate"
    region          = "us-east-1"
    encrypt         = true
    use_lockfile    = true # S3-native state locking (prevents two applies at once)
  }
}

# Configure the AWS provider
provider "aws" {
    region = "us-east-1"

    default_tags {
      tags = {
        Project     = "TaskBeacon"
        ManagedBy   = "Terraform"
        Owner       = "bmokrytz"
        Environment = "production"
      }
    }
}

locals {
    api_domain      = "api.taskbeacon.ca"
    frontend_domain = "taskbeacon.ca"
}

variable "disabled" {
  type    = bool
  default = false
}
