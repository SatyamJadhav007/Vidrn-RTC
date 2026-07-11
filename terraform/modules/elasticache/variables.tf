variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "backend_sg_id" {
  description = "Security group of backend ECS tasks — only these can reach Redis"
  type        = string
}

variable "node_type" {
  description = "ElastiCache node size (cache.t3.micro is cheapest)"
  type        = string
  default     = "cache.t3.micro"
}
