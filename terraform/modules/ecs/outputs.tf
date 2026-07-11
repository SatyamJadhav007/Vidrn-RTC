output "alb_dns_name" {
  description = "Public DNS name of the ALB — this is your app URL"
  value       = aws_lb.main.dns_name
}

output "backend_sg_id" {
  description = "Backend security group ID (used by ElastiCache for ingress)"
  value       = var.backend_sg_id
}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "backend_service_name" {
  value = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  value = aws_ecs_service.frontend.name
}

output "alb_arn" {
  value = aws_lb.main.arn
}
