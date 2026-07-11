output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint address"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  value = aws_elasticache_cluster.redis.port
}

output "redis_sg_id" {
  value = aws_security_group.redis.id
}
