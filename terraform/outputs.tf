output "app_url" {
  description = "Public URL to access the application"
  value       = "http://${module.ecs.alb_dns_name}"
}

output "alb_dns_name" {
  description = "ALB DNS name (use for CORS_ORIGINS and frontend build)"
  value       = module.ecs.alb_dns_name
}

output "elasticache_endpoint" {
  description = "ElastiCache Redis endpoint (used by backend REDIS_URL)"
  value       = module.elasticache.redis_endpoint
}

output "coturn_public_ip" {
  description = "Elastic IP of the coturn TURN server"
  value       = module.turn.coturn_public_ip
}

output "ecs_cluster_name" {
  description = "ECS cluster name (for aws ecs update-service commands)"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  value = module.ecs.backend_service_name
}

output "frontend_service_name" {
  value = module.ecs.frontend_service_name
}
