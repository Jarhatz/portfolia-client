# Use Ubuntu 22.04 LTS as the base image
FROM ubuntu:22.04

# Set environment variables to prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/local/app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"

# Copy package.json and bun.lockb and .env first (for efficient caching)
COPY package.json bun.lockb .env ./

# Install dependencies using Bun
RUN bun install

# # Add Vite to PATH
# ENV PATH="/usr/local/app/node_modules/.bin/vite:$PATH"

# Set ownership and permissions for readable/writeable directories
RUN useradd app
RUN chown app:app .env
RUN chmod 600 .env
RUN chown -R app:app ./node_modules
# Change permissions of all files to 600 (read and write)
RUN find ./node_modules -type f -exec chmod 600 {} +
# Change permissions of all directories to 700 (read, write, and execute)
RUN find ./node_modules -type d -exec chmod 700 {} +

# Copy all other project files
COPY public ./public
COPY src ./src
COPY eslint.config.js \
index.html index.ts \
postcss.config.js \
tailwind.config.js \
tsconfig.app.json \
tsconfig.json \
tsconfig.node.json \
vite.config.ts ./

EXPOSE 5173

USER app

CMD ["bun", "run", "dev"]