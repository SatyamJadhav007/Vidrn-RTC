# ===========================================================================
# coturn TURN/STUN server on EC2
#
# Runs the coturn/coturn Docker image via user_data bootstrap script.
# Elastic IP ensures the TURN URL stays stable across stop/start cycles.
# Security group opens STUN/TURN signaling (3478) + UDP relay range.
# ===========================================================================

# --- Latest Amazon Linux 2023 AMI ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- Security Group ---
resource "aws_security_group" "turn" {
  name_prefix = "${var.project_name}-turn-"
  description = "coturn STUN/TURN signaling + relay + SSH"
  vpc_id      = var.vpc_id

  # STUN/TURN signaling (TCP)
  ingress {
    from_port   = 3478
    to_port     = 3478
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "STUN/TURN TCP"
  }

  # STUN/TURN signaling (UDP)
  ingress {
    from_port   = 3478
    to_port     = 3478
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "STUN/TURN UDP"
  }

  # TURN relay port range (UDP — media relay traffic)
  ingress {
    from_port   = 49152
    to_port     = 65535
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "TURN relay UDP"
  }

  # SSH (restricted to your IP)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
    description = "SSH"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-turn-sg" }
}

# --- Elastic IP (static address so TURN URL doesn't change) ---
resource "aws_eip" "turn" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-turn-eip" }
}

# --- EC2 Instance ---
resource "aws_instance" "turn" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.turn.id]

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    turn_secret = var.turn_secret
    public_ip   = aws_eip.turn.public_ip
  }))

  tags = { Name = "${var.project_name}-turn" }

  depends_on = [aws_eip.turn]
}

# --- Associate Elastic IP with the instance ---
resource "aws_eip_association" "turn" {
  instance_id   = aws_instance.turn.id
  allocation_id = aws_eip.turn.id
}
