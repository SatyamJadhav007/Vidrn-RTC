variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name prefix for all resource names"
  type        = string
  default     = "vidrn"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "AZs for subnets (ALB requires ≥2)"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

# --- Container images ---

variable "backend_image" {
  description = "Full ECR URI for backend (e.g. 123456789.dkr.ecr.ap-south-1.amazonaws.com/vidrn-backend:latest)"
  type        = string
}

variable "frontend_image" {
  description = "Full ECR URI for frontend Nginx image"
  type        = string
}

# --- Scaling ---

variable "backend_desired_count" {
  description = "Number of backend Fargate tasks (≥2 demonstrates horizontal scaling)"
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  description = "Number of frontend Fargate tasks"
  type        = number
  default     = 1
}

# --- Secrets ---

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing key"
  type        = string
  sensitive   = true
}

variable "turn_secret" {
  description = "Shared secret for coturn HMAC time-limited credentials"
  type        = string
  sensitive   = true
}

# --- EC2 / TURN ---

variable "ec2_key_pair_name" {
  description = "EC2 key pair name for coturn SSH access (must already exist in AWS)"
  type        = string
  default     = "vidrn-turn-key"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into coturn instance (your IP/32 recommended)"
  type        = string
  default     = "0.0.0.0/0"
}
