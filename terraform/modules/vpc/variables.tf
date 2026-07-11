variable "project_name" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Must be ≥2 for ALB multi-AZ requirement"
  type        = list(string)
}
