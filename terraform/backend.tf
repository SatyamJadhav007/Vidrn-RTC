terraform {
  backend "s3" {
    bucket         = "vidrn-terraform-state"
    key            = "vidrn/terraform.tfstate"
    region         = "ap-south-1"
    use_lockfile = true 
    encrypt        = true
  }
}
