# Session Analysis Feature Documentation

## Overview

The Session Analysis feature provides AI-powered analysis of RPG session transcriptions, extracting valuable insights to help game masters and players better understand and track their campaigns, character interactions, and plot developments.

## Key Components

### Backend Components

1. **SessionAnalysisModel**: Data model for session analysis
   - Stores relationships to sessions, transcriptions, and analysis results
   - Includes metadata about the analysis process

2. **SessionAnalysisRepository**: Repository for session analysis data
   - Handles CRUD operations for session analysis
   - Implements complex graph queries for retrieving related data

3. **SessionAnalysisService**: Service for processing and managing analyses
   - Processes transcriptions to extract insights
   - Manages analysis lifecycle (creation, processing, retrieval, deletion)

4. **SessionAnalysisController**: API controller for session analysis
   - Exposes RESTful endpoints for analysis operations
   - Handles request validation and response formatting

### Frontend Components

1. **SessionAnalysisPage**: Main page for viewing analysis results
   - Displays tabs for different analysis sections
   - Integrates with audio player for synchronized playback

2. **SessionSummary**: Displays AI-generated session summary
   - Shows concise overview of the session
   - Includes metadata about the analysis process

3. **KeyPointsList**: Displays key points extracted from the session
   - Shows categorized key points with importance scores
   - Allows navigation to corresponding audio segments

4. **CharacterInsightsList**: Shows character participation and interactions
   - Displays participation metrics and sentiment scores
   - Shows notable quotes and key interactions
   - Includes expandable details for each character

5. **PlotDevelopmentsList**: Displays plot developments and related entities
   - Shows plot points with importance scores
   - Includes related entities (characters, locations, items)
   - Allows navigation to corresponding audio segments

6. **SentimentAnalysis**: Visualizes sentiment analysis
   - Shows overall sentiment and distribution
   - Displays sentiment timeline with context
   - Allows navigation to corresponding audio segments

7. **TopicsList**: Shows topics discussed in the session
   - Displays topics with relevance scores and keywords
   - Allows navigation to corresponding audio segments

## Data Flow

1. **Analysis Creation**:
   - User initiates analysis from TranscriptionViewer or SessionRecordingsPage
   - Request is sent to `/api/session-analyses` with session and transcription IDs
   - SessionAnalysisController creates analysis entry in database
   - Initial analysis status is set to "pending"

2. **Analysis Processing**:
   - User or system triggers processing via `/api/session-analyses/{id}/process`
   - SessionAnalysisService processes the transcription
   - Extracts summary, key points, character insights, plot developments, sentiment, and topics
   - Results are saved to database with relationships to relevant entities
   - Analysis status is updated to "completed"

3. **Analysis Retrieval**:
   - User navigates to SessionAnalysisPage
   - Request is sent to `/api/session-analyses/{id}` or related endpoints
   - SessionAnalysisController retrieves analysis data from repository
   - Frontend components display different aspects of the analysis
   - User can navigate between analysis insights and corresponding audio segments

## API Endpoints

- `GET /api/session-analyses/{id}`: Get analysis by ID
- `GET /api/session-analyses/session/{sessionId}`: Get analysis by session ID
- `GET /api/session-analyses/transcription/{transcriptionId}`: Get analysis by transcription ID
- `POST /api/session-analyses`: Create new analysis
- `POST /api/session-analyses/{id}/process`: Process analysis
- `DELETE /api/session-analyses/{id}`: Delete analysis

## Analysis Components

### Summary Generation

- Provides concise overview of the session
- Extracts key narrative elements
- Summarizes main events and outcomes

### Key Points Extraction

- Identifies important moments in the session
- Categorizes key points (decision, combat, discovery, interaction, quest, lore)
- Assigns importance scores based on relevance
- Links key points to specific transcription segments

### Character Insights

- Analyzes character participation and interactions
- Calculates participation scores based on speaking time
- Identifies topics of interest for each character
- Extracts notable quotes with importance scores
- Analyzes interactions between characters with sentiment scoring

### Plot Developments

- Identifies significant plot points and developments
- Links plot developments to related entities
- Assigns importance scores based on narrative impact
- Provides context for each development

### Sentiment Analysis

- Analyzes overall sentiment of the session
- Calculates sentiment distribution (positive, neutral, negative)
- Creates sentiment timeline with context
- Identifies emotional high and low points

### Topic Extraction

- Identifies main topics discussed in the session
- Extracts keywords for each topic
- Assigns relevance scores based on frequency and importance
- Links topics to specific transcription segments

## User Experience

1. **Accessing Analysis**:
   - From Session Detail Page: Click "AI Analysis" button
   - From Recordings Page: Click "AI Analysis" button on a transcription
   - From Transcription Viewer: Click "AI Analysis" button

2. **Viewing Analysis**:
   - Navigate between different analysis sections using tabs
   - Click on insights to navigate to corresponding audio segments
   - Play audio synchronized with analysis insights
   - Expand/collapse details for more information

3. **Creating New Analysis**:
   - Select a transcription to analyze
   - Click "Create Analysis" button
   - Wait for processing to complete
   - View analysis results

## Technical Implementation Details

- **Analysis Processing**: NLP-based processing for extracting insights from transcriptions
- **Data Storage**: Neo4j graph database for storing analysis results with relationships
- **Audio Integration**: Synchronized audio playback with analysis navigation
- **UI Components**: React components with Material UI for displaying analysis results

## Future Enhancements

- Real-time analysis during live sessions
- Cross-session analysis to track campaign-wide trends
- More advanced NLP techniques for better analysis
- Integration with AI-assisted note-taking
- Customizable analysis parameters
- Export and sharing of analysis results

## Known Limitations

- Analysis quality depends on transcription accuracy
- Processing can be resource-intensive for long sessions
- Character insights may be limited if speakers are not properly identified
- No real-time analysis during sessions yet
- No cross-session analysis to track campaign-wide trends
