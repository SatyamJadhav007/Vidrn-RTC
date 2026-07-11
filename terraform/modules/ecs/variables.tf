variable "project_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "backend_sg_id" {
  description = "Backend security group (created at root to break circular dependency with ElastiCache)"
  type        = string
}

variable "backend_image" {
  description = "Full ECR URI for backend Docker image"
  type        = string
}

variable "frontend_image" {
  description = "Full ECR URI for frontend Docker image"
  type        = string
}

variable "backend_desired_count" {
  type    = number
  default = 2
}

variable "frontend_desired_count" {
  type    = number
  default = 1
}

variable "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint address"
  type        = string
}

variable "mongo_uri" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "turn_secret" {
  type      = string
  sensitive = true
}

variable "coturn_public_ip" {
  description = "Elastic IP of the coturn TURN server"
  type        = string
}

variable "backend_cpu" {
  description = "Backend task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend task memory in MiB"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}
