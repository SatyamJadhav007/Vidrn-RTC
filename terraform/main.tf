# ===========================================================================
# Root — provider, backend security group, module composition
# ===========================================================================
#Comment to trigger CI
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ============================================================================
# Backend Security Group (created HERE at root level)
#
# Why not inside the ECS module?
#   ECS module needs redis_endpoint from ElastiCache.
#   ElastiCache module needs backend_sg_id for its ingress rule.
#   If both SG and task definition lived in ECS, Terraform would see
#   a circular module dependency (ECS ↔ ElastiCache).
#
#   By creating the backend SG at root, both modules can reference it
#   independently — no circular dependency.
# ============================================================================

resource "aws_security_group" "backend" {
  name_prefix = "${var.project_name}-backend-"
  description = "Backend ECS tasks - traffic from VPC only (ALB)"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Backend port from within VPC (ALB routes here)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-backend-sg" }
}

# ============================================================================
# Modules
# ============================================================================

# --- Networking ---
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# --- TURN Server (coturn on EC2) ---
module "turn" {
  source = "./modules/turn"

  project_name     = var.project_name
  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_ids[0]
  key_pair_name    = var.ec2_key_pair_name
  turn_secret      = var.turn_secret
  ssh_allowed_cidr = var.ssh_allowed_cidr
}

# --- ElastiCache Redis ---
module "elasticache" {
  source = "./modules/elasticache"

  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  backend_sg_id      = aws_security_group.backend.id
}

# --- ECS Fargate (Backend + Frontend + ALB) ---
module "ecs" {
  source = "./modules/ecs"

  project_name           = var.project_name
  aws_region             = var.aws_region
  vpc_id                 = module.vpc.vpc_id
  public_subnet_ids      = module.vpc.public_subnet_ids
  backend_sg_id          = aws_security_group.backend.id
  backend_image          = var.backend_image
  frontend_image         = var.frontend_image
  backend_desired_count  = var.backend_desired_count
  frontend_desired_count = var.frontend_desired_count
  redis_endpoint         = module.elasticache.redis_endpoint
  mongo_uri              = var.mongo_uri
  jwt_secret             = var.jwt_secret
  turn_secret            = var.turn_secret
  coturn_public_ip       = module.turn.coturn_public_ip
}
