# 1. Main VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "taskbeacon-staging-vpc"
    Description = "VPC for TaskBeacon's staging environment."
  }
}

# 2. Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "taskbeacon-staging-igw"
  }
}

# 3. Public Subnet 1 (Zone A)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "taskbeacon-staging-public-1"
  }
}

# 4. Public Subnet 2 (Zone B)
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "taskbeacon-staging-public-2"
  }
}

# 5. Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "taskbeacon-staging-public-rt"
  }
}

# 6. Route Table Associations
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}





# 7. Security Group for the ALB
resource "aws_security_group" "alb" {
  name        = "taskbeacon-staging-alb-sg"
  description = "Controls traffic to the Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  # Inbound HTTP from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound HTTPS from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic to anywhere (to forward requests to ECS)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    ="-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "taskbeacon-staging-alb-sg"
    Description = "Controls traffic to the Application Load Balancer"
  }
}

# 8. Security Group for ECS Tasks
resource "aws_security_group" "ecs" {
  name        = "taskbeacon-staging-ecs-sg"
  description = "Controls traffic to the ECS containers"
  vpc_id      = aws_vpc.main.id

  # Inbound traffic ONLY from the Load Balancer security group on port 8000
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound traffic to anywhere (allows ECS tasks to download packages or talk to DB)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "taskbeacon-staging-ecs-sg"
    Description = "Controls traffic to the ECS containers"
  }
}