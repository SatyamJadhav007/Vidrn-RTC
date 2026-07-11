#!/bin/bash
set -euo pipefail

# ===========================================================================
# coturn bootstrap — runs once on EC2 first boot via user_data
# Installs Docker, pulls the coturn image, and starts the relay server.
# ===========================================================================

# Install Docker on Amazon Linux 2023
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

# Get instance private IP via IMDSv2 (required on AL2023)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
PRIVATE_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/local-ipv4)

# Run coturn container with host networking (needs raw UDP access)
docker run -d \
  --name coturn \
  --restart unless-stopped \
  --network host \
  coturn/coturn:latest \
  -n \
  --listening-port=3478 \
  --relay-ip="$PRIVATE_IP" \
  --external-ip="${public_ip}/$PRIVATE_IP" \
  --use-auth-secret \
  --static-auth-secret="${turn_secret}" \
  --realm=vidrn.com \
  --min-port=49152 \
  --max-port=65535 \
  --no-cli \
  --log-file=stdout \
  --no-tls \
  --no-dtls \
  --fingerprint
