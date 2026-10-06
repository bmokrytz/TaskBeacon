resource "aws_vpc" "main" {
    cidr_block = "10.0.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true

    tags = {
        Name        = "taskbeacon-production-vpc"
        Description = "A VPC for the TaskBeacon production environment."
    }
}

resource "aws_internet_gateway" "gw" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name        = "taskbeacon-production-internet-gateway"
        Description = "Internet Gateway for the TaskBeacon production environment."
    }
}

resource "aws_subnet" "public_1" {
    vpc_id      = aws_vpc.main.id
    cidr_block  = "10.0.1.0/24"

    availability_zone       = "us-east-1a"
    map_public_ip_on_launch = true

    tags = {
        Name = "taskbeacon-production-public-subnet-1"
    }
}

resource "aws_subnet" "public_2" {
    vpc_id      = aws_vpc.main.id
    cidr_block = "10.0.2.0/24"

    availability_zone       = "us-east-1b"
    map_public_ip_on_launch = true

    tags = {
        Name = "taskbeacon-production-public-subnet-2"
    }
}

resource "aws_route_table" "public_rt" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "taskbeacon-production-public-rt"
    }
}

resource "aws_route" "ig_route" {
    route_table_id          = aws_route_table.public_rt.id
    destination_cidr_block = "0.0.0.0/0"

    gateway_id              = aws_internet_gateway.gw.id
}

resource "aws_route_table_association" "rt_association_1" {
    subnet_id       = aws_subnet.public_1.id
    route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "rt_association_2" {
    subnet_id       = aws_subnet.public_2.id
    route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "alb" {
    name        = "taskbeacon-production-alb-sg"
    description = "Controls traffic to the ALB"
    vpc_id      = aws_vpc.main.id

    ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name        = "taskbeacon-production-alb-sg"
        Description = "Controls traffic to the ALB"
    }
}

resource "aws_security_group" "ecs" {
    name = "taskbeacon-production-ecs-sg"
    description = "Security group for ECS"
    vpc_id = aws_vpc.main.id

    ingress {
        from_port       = 8000
        to_port         = 8000
        protocol        = "tcp"
        security_groups = [aws_security_group.alb.id]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name        = "taskbeacon-production-ecs-sg"
        Description = "Controls traffic to the ECS containers"
    }
}



