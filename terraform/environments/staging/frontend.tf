# 1. Private S3 bucket holding the compiled React app (frontend/dist)
# Name must match the taskbeacon-*-frontend-* pattern allowed for the GitHub Actions role
resource "aws_s3_bucket" "frontend" {
  bucket        = "taskbeacon-staging-frontend-${data.aws_caller_identity.current.account_id}"
  force_destroy = true # Contents are build output, safe to delete with the stack

  tags = {
    Name = "taskbeacon-staging-frontend"
  }
}

# Nobody reads the bucket directly; only CloudFront can (see bucket policy below)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. Origin Access Control (lets CloudFront sign its requests to the private bucket)
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "taskbeacon-staging-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 3. TLS certificate for the frontend domain
# CloudFront only accepts ACM certificates from us-east-1 (this stack's region)
resource "aws_acm_certificate" "frontend" {
  domain_name       = local.frontend_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "taskbeacon-staging-frontend-cert"
  }
}

resource "aws_acm_certificate_validation" "frontend" {
  certificate_arn = aws_acm_certificate.frontend.arn
}

# AWS-managed cache policy: long caching, gzip/brotli, ignores cookies and query strings
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

# 4. CloudFront distribution (CDN serving the bucket over HTTPS on the custom domain)
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "TaskBeacon staging frontend"
  default_root_object = "index.html"
  aliases             = [local.frontend_domain]
  price_class         = "PriceClass_100" # Cheapest tier: North America + Europe edge locations

  origin {
    origin_id                = "s3-frontend"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  # React Router (BrowserRouter) handles paths like /dashboard in the browser.
  # Those files don't exist in S3, so serve index.html instead of an error.
  # S3 returns 403 (not 404) for missing keys when the caller can't list the bucket.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.frontend.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "taskbeacon-staging-frontend-cdn"
  }
}

# 5. Bucket policy: only this CloudFront distribution may read objects
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}
