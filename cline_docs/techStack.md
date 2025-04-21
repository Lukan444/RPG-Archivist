# RPG Archivist Web Technology Stack

## Frontend
- **Framework**: React.js
- **UI Library**: Material UI
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Date/Time**: date-fns
- **Rich Text Editing**: Quill.js

## Backend
- **Language**: TypeScript
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: Neo4j (Graph Database)
- **ORM**: Custom Neo4j data access layer
- **File Storage**: Local filesystem (with cloud storage planned)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod

## Audio Processing and Transcription
- **Audio Recording**: Web Audio API with MediaRecorder
- **Audio Processing**: Web Audio API, FFmpeg (server-side)
- **Transcription Services**:
  - OpenAI Whisper API (cloud-based, high accuracy)
  - Vosk (offline, privacy-focused)
  - Hybrid approach (combining both for optimal results)
- **Speaker Diarization**: pyannote.audio

## DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (planned)
- **Deployment**: Self-hosted or cloud provider (AWS/Azure/GCP)
- **Monitoring**: Sentry (planned)

## Testing
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **E2E Testing**: Cypress (planned)
- **API Testing**: Postman

## Architecture Decisions

### Graph Database (Neo4j)
We chose Neo4j as our database because RPG campaigns naturally form complex networks of relationships between characters, locations, items, and events. A graph database makes it easy to:
- Model and query complex relationships
- Perform path-finding and graph traversal operations
- Visualize connections between entities
- Scale as the campaign grows in complexity

### TypeScript
TypeScript was selected for both frontend and backend to:
- Provide type safety and better developer experience
- Catch errors at compile time rather than runtime
- Improve code documentation through type definitions
- Enable better IDE support and code completion

### Material UI
Material UI was chosen as the UI library because:
- It provides a comprehensive set of pre-built components
- It supports responsive design out of the box
- It offers customizable theming with dark/light mode support
- It follows accessibility best practices
- It has excellent documentation and community support

### Hybrid Transcription Approach
For audio transcription, we implemented a hybrid approach that:
- Uses Vosk for initial offline processing (privacy, speed)
- Leverages OpenAI Whisper for higher accuracy when needed
- Combines results based on confidence scores
- Provides flexibility based on user preferences and requirements

## Future Technology Considerations
- **Real-time Collaboration**: Socket.io or similar
- **Cloud Storage**: AWS S3 or similar for media files
- **AI Integration**: OpenAI GPT or similar for content generation and analysis
- **Vector Database**: For semantic search capabilities
- **WebRTC**: For real-time audio/video communication during sessions
