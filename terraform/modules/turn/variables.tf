variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_id" {
  description = "Public subnet for the coturn EC2 instance"
  type        = string
}

variable "key_pair_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
}

variable "turn_secret" {
  description = "Shared secret for coturn HMAC time-limited credentials"
  type        = string
  sensitive   = true
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into the instance (your IP/32)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is cheapest for relay workload)"
  type        = string
  default     = "t3.micro"
}
