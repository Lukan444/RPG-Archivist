# RPG Archivist Web Codebase Summary

## Project Structure

```
rpg-archivist-web/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Application entry point
│   ├── uploads/             # Uploaded files (audio, images)
│   └── package.json
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main application component
│   │   └── index.tsx        # Frontend entry point
│   └── package.json
├── cline_docs/              # Project documentation
└── README.md
```

## Key Components

### Backend

#### Core Entities
- **RPG World**: Top-level container for campaigns
- **Campaign**: A collection of sessions, characters, locations, etc.
- **Session**: Individual game sessions with notes, recordings, etc.
- **Character**: Player characters and NPCs
- **Location**: Places in the game world
- **Item**: Objects that can be owned by characters or found in locations
- **Power**: Abilities, spells, skills that characters can have
- **Event**: Notable occurrences in the campaign timeline
- **AudioRecording**: Recorded audio from sessions
- **Transcription**: Transcribed text from audio recordings with speaker identification

#### Database Layer
- **DatabaseService**: Manages Neo4j database connection
- **BaseRepository**: Abstract base class for repositories
- **RepositoryFactory**: Factory for creating repository instances

#### Authentication
- **AuthController**: Handles user registration, login, and token refresh
- **AuthMiddleware**: Validates JWT tokens and user permissions

### Frontend

#### Core Components
- **Layout**: Main application layout with navigation
- **Dashboard**: Overview of recent activity and quick access
- **EntityList**: Reusable list component for displaying entities
- **EntityForm**: Reusable form component for creating/editing entities
- **RichTextEditor**: Markdown editor for notes and descriptions

#### Audio Components
- **AudioRecorder**: Records audio directly in the browser
- **AudioPlayer**: Plays audio recordings with transcription navigation
- **TranscriptionViewer**: Displays transcriptions with speaker identification
- **AudioRecordingsList**: Lists audio recordings for a session

#### Analysis Components
- **KeyPointsList**: Displays key points extracted from session transcriptions
- **CharacterInsightsList**: Shows character participation and interaction insights
- **PlotDevelopmentsList**: Displays plot developments and related entities
- **SentimentAnalysis**: Visualizes sentiment analysis with timeline
- **TopicsList**: Shows topics discussed in the session with relevance scores
- **SessionSummary**: Displays AI-generated session summary

#### Authentication Components
- **LoginForm**: User login form
- **RegisterForm**: User registration form
- **AuthContext**: Manages authentication state

## Data Flow

1. **User Authentication**:
   - User submits credentials via LoginForm
   - AuthService sends request to /api/auth/login
   - AuthController validates credentials and returns JWT token
   - AuthContext stores token and user information

2. **Entity Management**:
   - User creates/edits entity via EntityForm
   - EntityService sends request to appropriate API endpoint
   - Controller processes request and calls repository methods
   - Repository executes Neo4j queries to update database
   - Response is returned to frontend and state is updated

3. **Audio Recording and Transcription**:
   - User records audio via AudioRecorder
   - Audio is sent to /api/audio-recordings/upload
   - AudioRecordingController saves file and creates database entry
   - If auto-transcribe is enabled, transcription process is started
   - TranscriptionService processes audio using selected service
   - Transcription results are saved to database
   - User can view transcription via TranscriptionViewer

4. **Session Analysis**:
   - User initiates analysis from TranscriptionViewer or SessionRecordingsPage
   - Request is sent to /api/session-analyses
   - SessionAnalysisController creates analysis entry and starts processing
   - Analysis results are processed and saved to database
   - User views analysis via SessionAnalysisPage
   - Analysis components display different aspects of the analysis
   - User can navigate between analysis insights and corresponding audio segments

## Recent Significant Changes

- [2024-06-30] Added sentiment analysis and topic extraction
- [2024-06-15] Implemented character insights and plot developments analysis
- [2024-05-30] Added session summary generation and key points extraction
- [2024-05-15] Implemented AI-powered session analysis
- [2024-04-30] Added audio recording and transcription UI
- [2024-03-30] Implemented speaker management with character/user linking
- [2024-03-15] Added multiple transcription services integration
- [2024-02-28] Implemented audio recording and transcription functionality
- [2023-12-30] Implemented user settings and preferences
- [2023-12-15] Added rich text editing in notes
- [2023-11-30] Implemented filtering and sorting for lists
- [2023-11-15] Added search functionality
- [2023-10-30] Created dashboard with recent activity
- [2023-10-15] Implemented event logging
- [2023-09-30] Added items and powers support
- [2023-09-15] Implemented relationship management
- [2023-08-30] Created UI components with Material UI
- [2023-08-15] Implemented basic CRUD operations
- [2023-07-30] Created core entity models and repositories
- [2023-07-15] Designed and implemented database schema
- [2023-06-30] Implemented user authentication
- [2023-06-15] Initial project setup and repository creation

## Known Issues and Limitations

- Audio recording quality depends on user's microphone and browser support
- Transcription accuracy varies based on audio quality and speaker clarity
- Speaker diarization may not correctly identify all speakers in complex recordings
- Long audio recordings (>1 hour) may take significant time to process
- Session analysis quality depends on transcription accuracy
- Analysis processing can be resource-intensive for long sessions
- Character insights may be limited if speakers are not properly identified
- No real-time analysis during sessions yet
- No cross-session analysis to track campaign-wide trends
- No real-time collaboration features yet
- Limited support for image uploads and management
- No offline mode support

## Future Development Areas

- Implement AI-assisted note-taking during sessions
- Add real-time analysis during live sessions
- Create cross-session analysis to track campaign-wide trends
- Implement more advanced NLP techniques for better analysis
- Add AI-powered search and recommendations
- Create campaign timeline visualization
- Add support for image uploads and gallery
- Implement relationship graphs for characters
- Add interactive maps for locations
- Create public sharing feature for campaign content
- Implement real-time collaboration features
