# Database Schema Analysis and Implementation

## Overview

This document outlines the analysis of the existing Neo4j database schema used in the desktop version of RPG Archivist and the implementation of a compatible schema for the web version.

## Current Desktop Application Schema

The desktop application uses a Neo4j graph database with the following entity types:

1. **RPGWorld**: Represents an RPG system or world (e.g., D&D, Pathfinder)
   - Properties: rpg_world_id, name, description, system_version, created_at
   - Relationships: HAS_CAMPAIGN (incoming from Campaign)

2. **Campaign**: Represents a campaign within an RPG world
   - Properties: campaign_id, name, description, start_date, created_at
   - Relationships: PART_OF (to RPGWorld), HAS_SESSION (incoming from Session), HAS_CHARACTER (incoming from Character), HAS_LOCATION (incoming from Location)

3. **Session**: Represents a gaming session within a campaign
   - Properties: session_id, name, number, date, summary, created_at
   - Relationships: PART_OF (to Campaign), HAS_TRANSCRIPTION (incoming from Transcription), HAS_CHARACTER (incoming from Character), HAS_EVENT (incoming from Event)

4. **Character**: Represents a character in the campaign (PC or NPC)
   - Properties: character_id, name, character_type, description, created_at
   - Relationships: PART_OF (to Campaign), APPEARS_IN (to Session), RESIDES_IN (to Location), LOCATED_AT (to Location), MEMBER_OF (to Faction), LEADS (to Faction), OWNS (to Item), etc.

5. **Location**: Represents a location in the campaign
   - Properties: location_id, name, location_type, description, created_at
   - Relationships: PART_OF (to Campaign), CONTAINS (to Location), CONTAINED_IN (from Location), HAS_CHARACTER (incoming from Character), etc.

6. **Transcription**: Represents a transcription of a gaming session
   - Properties: transcription_id, text, date, speakers, format, created_at
   - Relationships: PART_OF (to Session), HAS_VERSION (incoming from TranscriptionVersion)

7. **TranscriptionVersion**: Represents a version of a transcription
   - Properties: version_id, text, version_number, timestamp, created_by, created_at
   - Relationships: VERSION_OF (to Transcription), PREVIOUS_VERSION (to TranscriptionVersion)

8. **Event**: Represents an event in the campaign timeline
   - Properties: event_id, title, description, timestamp, event_type, created_at
   - Relationships: OCCURRED_IN (to Session), INVOLVES (incoming from Character), HAPPENED_AT (to Location)

9. **Faction**: Represents a faction or organization in the campaign
   - Properties: faction_id, name, description, faction_type, created_at
   - Relationships: PART_OF (to Campaign), HAS_MEMBER (incoming from Character), LED_BY (incoming from Character), etc.

10. **Item**: Represents an item in the campaign
    - Properties: item_id, name, type, description, created_at
    - Relationships: PART_OF (to Campaign), OWNED_BY (incoming from Character), CREATED_BY (incoming from Character), LOCATED_AT (to Location)

11. **Note**: Represents a note or journal entry
    - Properties: note_id, title, content, tags, created_at, updated_at
    - Relationships: PART_OF (to Campaign), RELATES_TO (to various entities)

## Web Application Implementation

For the web version, we've implemented a compatible database schema with the following components:

### 1. Database Configuration and Connection Management

- **database.ts**: Handles Neo4j driver initialization, connection management, and transaction execution
- Provides methods for executing read and write transactions
- Implements connection pooling and error handling

### 2. Entity Schema Definition

- **entity-schema.ts**: Defines the schema for all entities in the system
- Includes property definitions with types and constraints
- Defines relationships between entities
- Ensures compatibility with the desktop application's schema

### 3. Schema Validation and Management

- **schema-validator.ts**: Validates and fixes the database schema
- Creates constraints and indexes
- Ensures required properties exist
- Tracks schema versions for future migrations

### 4. Repository Pattern Implementation

We've implemented the Repository pattern to provide a clean API for database operations:

- **base.repository.ts**: Defines the base repository interface and implementation
- **rpg-world.repository.ts**: Repository for RPG World entities
- **campaign.repository.ts**: Repository for Campaign entities
- **session.repository.ts**: Repository for Session entities
- **character.repository.ts**: Repository for Character entities
- **location.repository.ts**: Repository for Location entities
- **transcription.repository.ts**: Repository for Transcription entities
- **repository.factory.ts**: Factory for creating and managing repositories

### 5. Mind Map Visualization Service

- **mind-map.service.ts**: Generates mind map data for visualization
- Supports filtering by campaign, session, character, or location
- Provides options to include/exclude different entity types
- Returns nodes and edges in a format compatible with visualization libraries

## Database Access Layer Design

The database access layer is designed with the following principles:

1. **Separation of Concerns**: Each repository is responsible for a specific entity type
2. **Transaction Management**: Proper transaction handling for read and write operations
3. **Error Handling**: Comprehensive error handling and recovery mechanisms
4. **Connection Pooling**: Efficient connection management with pooling
5. **Type Safety**: TypeScript interfaces for all entities and operations
6. **Repository Pattern**: Clean API for database operations
7. **Factory Pattern**: Centralized repository creation and management

## Schema Compatibility Considerations

1. **Property Names**: Maintained consistent property names with the desktop application
2. **Relationship Types**: Ensured all relationship types match the desktop application
3. **Constraints and Indexes**: Created the same constraints and indexes
4. **ID Generation**: Used UUID generation for entity IDs
5. **Default Values**: Provided sensible defaults for required properties
6. **Error Handling**: Implemented robust error handling for database operations
7. **Schema Validation**: Added schema validation to ensure compatibility

## Next Steps

1. **Implement Database Access Layer**: Complete the implementation of the database access layer
2. **Plan Transaction Management Strategy**: Develop a strategy for managing transactions
3. **Create Database Connection Configuration**: Configure database connection settings
4. **Design Error Handling and Recovery Mechanisms**: Implement robust error handling
5. **Implement Data Migration Strategy**: Develop a strategy for migrating data from the desktop application
6. **Create API Endpoints**: Implement RESTful API endpoints for entity operations
7. **Implement Authentication and Authorization**: Add user authentication and authorization

## Conclusion

The analysis of the desktop application's database schema has provided valuable insights for implementing a compatible schema for the web version. The implementation follows best practices for Neo4j integration with Node.js and provides a solid foundation for building the web application's backend.

The repository pattern provides a clean API for database operations, and the schema validator ensures compatibility with the desktop application. The mind map visualization service provides a powerful tool for visualizing the relationships between entities in the RPG campaign.

The next steps involve completing the database access layer, implementing transaction management, and creating API endpoints for the frontend to interact with the database.
