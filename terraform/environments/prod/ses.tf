resource "aws_sesv2_email_identity" "domain" {
  email_identity = "taskbeacon.ca"
}

resource "aws_sesv2_email_identity_mail_from_attributes" "domain" {
  email_identity         = aws_sesv2_email_identity.domain.email_identity
  mail_from_domain       = "mail.${aws_sesv2_email_identity.domain.email_identity}"
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

resource "aws_iam_role_policy" "ecs_task_send_email" {
  name = "taskbeacon-production-send-email"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = [
          aws_sesv2_email_identity.domain.arn
        ]
      }
    ]
  })
}

output "ses_dkim_records" {
  value = [
    for token in aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens : {
      name  = "${token}._domainkey.${aws_sesv2_email_identity.domain.email_identity}"
      type  = "CNAME"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}