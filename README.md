# RPG Archivist Web

A web-based version of RPG Archivist - A tool for recording, transcribing, and managing RPG session data.

## Overview

RPG Archivist Web is a comprehensive platform designed to help Game Masters and players record, transcribe, analyze, and organize their tabletop RPG sessions. The application provides tools for audio recording, AI-powered transcription, content analysis, and knowledge management.

## Features

- **Session Recording**: Record your RPG sessions directly in the browser
- **AI Transcription**: Convert audio recordings to text using advanced transcription technology
- **Content Analysis**: Automatically extract characters, locations, items, and plot points
- **Knowledge Management**: Organize and connect campaign elements in a searchable database
- **Visualization Tools**: Explore relationships between campaign elements with interactive graphs
- **Storytelling Assistance**: Get AI-powered suggestions for plot development and world-building

## Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, Neo4j
- **Database**: Neo4j Graph Database
- **AI Services**: OpenAI for transcription and content analysis
- **Deployment**: Docker, Nginx

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- Neo4j Database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Lukan444/RPG-Archivist.git
   cd RPG-Archivist
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Neo4j Browser: http://localhost:7474

## Development

This project follows a single-branch development workflow. All changes should be made directly to the `master` branch. See [Git Workflow Guidelines](./cline_docs/gitWorkflow.md) for more details.

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
