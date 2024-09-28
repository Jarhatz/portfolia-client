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

# Create a new user 'app'
RUN useradd -m -d /home/app app
# Set ownership and permissions for the app directory
RUN chown -R app:app /usr/local/app && chmod -R 755 /usr/local/app

# Switch to the 'app' user
USER app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
# Add Bun to PATH
ENV PATH="/home/app/.bun/bin:$PATH"

# Ensure the Bun installation directory has the correct permissions
RUN chown -R app:app /home/app/.bun && chmod -R 755 /home/app/.bun

# Copy project files
COPY --chown=app:app . .
RUN chmod -R 755 /usr/local/app

# Install dependencies using Bun
RUN bun install

EXPOSE 5173

CMD ["bun", "run", "dev"]