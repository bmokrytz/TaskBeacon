output "alb_dns_name" {
  description = "The public DNS name of the Application Load Balancer (Cloudflare CNAME target for the API domain)"
  value       = aws_lb.main.dns_name
}

output "api_cert_validation_records" {
  description = "CNAME records to add in Cloudflare (DNS only) so ACM can issue the API certificate"
  value = {
    for o in aws_acm_certificate.api.domain_validation_options : o.domain_name => {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  }
}

output "frontend_cert_validation_records" {
  description = "CNAME records to add in Cloudflare (DNS only) so ACM can issue the frontend certificate"
  value = {
    for o in aws_acm_certificate.frontend.domain_validation_options : o.domain_name => {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  }
}

output "cloudfront_domain_name" {
  description = "CloudFront domain (Cloudflare CNAME target for the frontend domain)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "Used by the pipeline to invalidate the CDN cache after deploying"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_bucket_name" {
  description = "Used by the pipeline to upload the built frontend"
  value       = aws_s3_bucket.frontend.bucket
}
