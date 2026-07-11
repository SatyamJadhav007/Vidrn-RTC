output "coturn_public_ip" {
  description = "Elastic IP of the coturn TURN server (use in TURN_URL)"
  value       = aws_eip.turn.public_ip
}

output "turn_sg_id" {
  value = aws_security_group.turn.id
}

output "instance_id" {
  value = aws_instance.turn.id
}
