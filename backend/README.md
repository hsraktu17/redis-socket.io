# Project Setup Instructions

## Overview

This project demonstrates a microservices architecture with two servers (`server1` and `server2`) communicating via a Redis database. It supports deployment both with Docker and without Docker.

---

## Prerequisites

- **Node.js** (v16 or later)
- **Docker** (if running with or without Docker for Redis)

---

## Running with Docker

### 1. Install Docker

Ensure Docker and Docker Compose are installed. Download and install Docker from [Docker Official Site](https://www.docker.com/).

### 2. Build and Start Containers

Run the following command in the root directory of the project:

```bash
docker-compose up --build
```

This command:

- Builds the images for `server1` and `server2`.
- Starts the containers along with Redis.

### 3. Access Services

- **Server 1**: [http://localhost:3000](http://localhost:3000)
- **Server 2**: [http://localhost:3001](http://localhost:3001)
- **Redis UI**: [http://localhost:8001](http://localhost:8001)

### 4. Stop Containers

To stop the running containers, use:

```bash
docker-compose down
```

---

## Running Without Docker (Using Docker for Redis Only)

### 1. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
npm install
```

### 2. Start Redis with Docker

Run the following command to start Redis as a container:

```bash
docker run --name redis-stack -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

### 3. Start Servers

Open two terminals and run the following commands:

**Server 1:**

```bash
npm run dev
```

**Server 2:**

```bash
PORT=3001 npm run dev
```

### 4. Access Services

- **Server 1**: [http://localhost:3000](http://localhost:3000)
- **Server 2**: [http://localhost:3001](http://localhost:3001)

---

## Environment Variables

| Variable     | Description                   | Default Value  |
| ------------ | ----------------------------- | -------------- |
| `PORT`       | Port on which the server runs | `3000`, `3001` |
| `REDIS_HOST` | Redis hostname                | `localhost`    |
| `REDIS_PORT` | Redis port                    | `6379`         |

---

## Notes

- Ensure that ports `3000`, `3001`, `6379`, and `8001` are not in use before starting the services.
- The Redis Stack includes a UI at port `8001` for easier monitoring and management.

