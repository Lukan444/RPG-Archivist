# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and continuous deployment of the RPG Archivist Web application.

## Workflows

### CI (Continuous Integration)

**File:** `ci.yml`

This workflow runs on every push to the main, master, and develop branches, as well as on pull requests to these branches. It performs the following tasks:

1. **Lint and Test Frontend**:
   - Sets up Node.js environment
   - Installs dependencies
   - Runs ESLint to check code quality
   - Runs tests using Jest and React Testing Library

2. **Lint and Test Backend**:
   - Sets up Node.js environment
   - Installs dependencies
   - Runs ESLint to check code quality
   - Runs tests using Jest

3. **Build**:
   - Builds both frontend and backend to ensure they compile successfully
   - This job only runs if the lint and test jobs pass

### CD (Continuous Deployment)

**File:** `cd.yml`

This workflow runs on every push to the main or master branch. It performs the following tasks:

1. **Build and Push Docker Images**:
   - Sets up Docker Buildx
   - Logs in to DockerHub using secrets
   - Builds and pushes the frontend Docker image
   - Builds and pushes the backend Docker image

2. **Deploy** (commented out until ready):
   - Connects to the deployment server via SSH
   - Pulls the latest Docker images
   - Restarts the application with the new images

### Dependency Scanning

**File:** `dependency-scan.yml`

This workflow runs weekly and can also be triggered manually. It performs the following tasks:

1. **Scan Frontend Dependencies**:
   - Runs npm audit to check for vulnerabilities
   - Uses Snyk to perform a more thorough scan

2. **Scan Backend Dependencies**:
   - Runs npm audit to check for vulnerabilities
   - Uses Snyk to perform a more thorough scan

### CodeQL Analysis

**File:** `codeql-analysis.yml`

This workflow runs on every push to the main, master, and develop branches, as well as on pull requests to these branches, and weekly. It performs the following tasks:

1. **Analyze Code**:
   - Initializes CodeQL for JavaScript and TypeScript
   - Builds the codebase
   - Performs static code analysis to find security vulnerabilities

## Required Secrets

The following secrets need to be configured in the GitHub repository settings:

- `DOCKERHUB_USERNAME`: Your DockerHub username
- `DOCKERHUB_TOKEN`: Your DockerHub access token
- `SNYK_TOKEN`: Your Snyk API token (for dependency scanning)
- `SSH_HOST`: The hostname or IP address of your deployment server
- `SSH_USERNAME`: The username to use when connecting to your deployment server
- `SSH_PRIVATE_KEY`: The private key to use when connecting to your deployment server

## Manual Triggers

Some workflows can be triggered manually from the GitHub Actions tab:

- **Dependency Scanning**: Click on "Run workflow" on the "Dependency Scanning" workflow
- **CodeQL Analysis**: Click on "Run workflow" on the "CodeQL Analysis" workflow

## Workflow Status

You can check the status of all workflows in the "Actions" tab of the GitHub repository.
