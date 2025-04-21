import { DatabaseService } from '../services/database.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import { ProposalEntityType, ProposalTemplate } from '../models/change-proposal.model';

/**
 * Initialize default proposal templates
 */
export async function initProposalTemplates() {
  try {
    console.log('Initializing default proposal templates...');
    
    // Create database service
    const dbService = new DatabaseService();
    
    // Create repository factory
    const repositoryFactory = new RepositoryFactory(dbService);
    
    // Get change proposal repository
    const changeProposalRepository = repositoryFactory.getChangeProposalRepository();
    
    // Check if templates already exist
    const existingTemplates = await changeProposalRepository.getTemplates();
    
    if (existingTemplates.length > 0) {
      console.log(`Found ${existingTemplates.length} existing templates. Skipping initialization.`);
      return;
    }
    
    // Create default templates
    const defaultTemplates: Omit<ProposalTemplate, 'id'>[] = [
      // World template
      {
        name: 'World Creation',
        description: 'Template for creating a new RPG world',
        entityType: ProposalEntityType.WORLD,
        promptTemplate: `Create a detailed proposal for a new RPG world.

Please consider the following aspects:
- World name and high-level concept
- Setting (fantasy, sci-fi, modern, etc.)
- Major geographical features
- Key historical events
- Dominant cultures or civilizations
- Magic system or technology level
- Major conflicts or tensions

Current context: {{contextData}}

Respond with a comprehensive world creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new RPG world.
Be creative but also practical - focus on elements that would be useful for a game master.
Include enough detail to make the world feel rich and interesting, but leave room for expansion.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New World: [World Name]",
  "description": "Detailed description of the world",
  "reason": "Reason for creating this world",
  "changes": [
    {
      "field": "name",
      "newValue": "World name",
      "description": "Name of the world"
    },
    {
      "field": "description",
      "newValue": "Detailed world description",
      "description": "Overview of the world"
    },
    {
      "field": "setting",
      "newValue": "Setting type",
      "description": "The general setting of the world"
    },
    {
      "field": "history",
      "newValue": "Historical background",
      "description": "Key historical events"
    },
    {
      "field": "geography",
      "newValue": "Geographical features",
      "description": "Major geographical elements"
    }
  ]
}`,
        requiredContext: false
      },
      
      // Campaign template
      {
        name: 'Campaign Creation',
        description: 'Template for creating a new campaign in an existing world',
        entityType: ProposalEntityType.CAMPAIGN,
        promptTemplate: `Create a detailed proposal for a new campaign in the following world:

World data: {{entityData}}

Please consider the following aspects:
- Campaign name and high-level concept
- Main storyline or plot hooks
- Key NPCs and factions
- Major locations
- Potential challenges and encounters
- Themes and tone

Respond with a comprehensive campaign creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new campaign within an existing world.
Be creative but also practical - focus on elements that would be useful for a game master.
Include enough detail to make the campaign feel rich and interesting, but leave room for player agency.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Campaign: [Campaign Name]",
  "description": "Detailed description of the campaign",
  "reason": "Reason for creating this campaign",
  "changes": [
    {
      "field": "name",
      "newValue": "Campaign name",
      "description": "Name of the campaign"
    },
    {
      "field": "description",
      "newValue": "Detailed campaign description",
      "description": "Overview of the campaign"
    },
    {
      "field": "plotSummary",
      "newValue": "Main storyline",
      "description": "Summary of the main plot"
    },
    {
      "field": "worldId",
      "newValue": "{{entityId}}",
      "description": "ID of the world this campaign belongs to"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Session template
      {
        name: 'Session Planning',
        description: 'Template for planning a new session in an existing campaign',
        entityType: ProposalEntityType.SESSION,
        promptTemplate: `Create a detailed proposal for a new session in the following campaign:

Campaign data: {{entityData}}

Context data: {{contextData}}

Please consider the following aspects:
- Session name and summary
- Key plot points and events
- NPCs involved
- Locations to be visited
- Potential encounters and challenges
- Rewards and consequences

Respond with a comprehensive session planning proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for planning a new session within an existing campaign.
Be creative but also practical - focus on elements that would be useful for a game master.
Include enough detail to make the session engaging, but leave room for player agency.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Session: [Session Name]",
  "description": "Detailed description of the session",
  "reason": "Reason for creating this session",
  "changes": [
    {
      "field": "name",
      "newValue": "Session name",
      "description": "Name of the session"
    },
    {
      "field": "summary",
      "newValue": "Brief session summary",
      "description": "Overview of what happens in the session"
    },
    {
      "field": "details",
      "newValue": "Detailed session notes",
      "description": "Detailed notes for the game master"
    },
    {
      "field": "campaignId",
      "newValue": "{{entityId}}",
      "description": "ID of the campaign this session belongs to"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Character template
      {
        name: 'Character Creation',
        description: 'Template for creating a new character',
        entityType: ProposalEntityType.CHARACTER,
        promptTemplate: `Create a detailed proposal for a new character in the following context:

Context data: {{contextData}}

Please consider the following aspects:
- Character name and concept
- Background and history
- Personality traits and motivations
- Appearance and distinctive features
- Skills, abilities, and weaknesses
- Relationships with other characters or factions
- Goals and aspirations

Respond with a comprehensive character creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new character.
Be creative but also practical - focus on elements that would make the character interesting and playable.
Include enough detail to make the character feel rich and three-dimensional.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Character: [Character Name]",
  "description": "Detailed description of the character",
  "reason": "Reason for creating this character",
  "changes": [
    {
      "field": "name",
      "newValue": "Character name",
      "description": "Name of the character"
    },
    {
      "field": "description",
      "newValue": "Character description",
      "description": "Physical description and notable features"
    },
    {
      "field": "background",
      "newValue": "Character background",
      "description": "History and background of the character"
    },
    {
      "field": "personality",
      "newValue": "Character personality",
      "description": "Personality traits, motivations, and behaviors"
    },
    {
      "field": "goals",
      "newValue": "Character goals",
      "description": "Current goals and aspirations"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "[NEW_CHARACTER_ID]",
      "sourceType": "character",
      "targetId": "{{contextId}}",
      "targetType": "campaign",
      "relationshipType": "PART_OF"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Location template
      {
        name: 'Location Creation',
        description: 'Template for creating a new location',
        entityType: ProposalEntityType.LOCATION,
        promptTemplate: `Create a detailed proposal for a new location in the following context:

Context data: {{contextData}}

Please consider the following aspects:
- Location name and type
- Physical description and notable features
- History and significance
- Current inhabitants or occupants
- Points of interest
- Secrets or hidden elements
- Potential encounters or events

Respond with a comprehensive location creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new location.
Be creative but also practical - focus on elements that would make the location interesting and useful for gameplay.
Include enough detail to make the location feel rich and immersive.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Location: [Location Name]",
  "description": "Detailed description of the location",
  "reason": "Reason for creating this location",
  "changes": [
    {
      "field": "name",
      "newValue": "Location name",
      "description": "Name of the location"
    },
    {
      "field": "description",
      "newValue": "Location description",
      "description": "Physical description and notable features"
    },
    {
      "field": "history",
      "newValue": "Location history",
      "description": "History and significance of the location"
    },
    {
      "field": "inhabitants",
      "newValue": "Location inhabitants",
      "description": "Current inhabitants or occupants"
    },
    {
      "field": "pointsOfInterest",
      "newValue": "Points of interest",
      "description": "Notable areas or features within the location"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "[NEW_LOCATION_ID]",
      "sourceType": "location",
      "targetId": "{{contextId}}",
      "targetType": "campaign",
      "relationshipType": "PART_OF"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Item template
      {
        name: 'Item Creation',
        description: 'Template for creating a new item',
        entityType: ProposalEntityType.ITEM,
        promptTemplate: `Create a detailed proposal for a new item in the following context:

Context data: {{contextData}}

Please consider the following aspects:
- Item name and type
- Physical description and appearance
- History and origin
- Properties and abilities
- Current owner or location
- Significance or importance
- Potential plot hooks or uses

Respond with a comprehensive item creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new item.
Be creative but also practical - focus on elements that would make the item interesting and useful for gameplay.
Include enough detail to make the item feel unique and significant.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Item: [Item Name]",
  "description": "Detailed description of the item",
  "reason": "Reason for creating this item",
  "changes": [
    {
      "field": "name",
      "newValue": "Item name",
      "description": "Name of the item"
    },
    {
      "field": "description",
      "newValue": "Item description",
      "description": "Physical description and appearance"
    },
    {
      "field": "history",
      "newValue": "Item history",
      "description": "History and origin of the item"
    },
    {
      "field": "properties",
      "newValue": "Item properties",
      "description": "Special properties or abilities"
    },
    {
      "field": "significance",
      "newValue": "Item significance",
      "description": "Importance or role in the story"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "[NEW_ITEM_ID]",
      "sourceType": "item",
      "targetId": "{{contextId}}",
      "targetType": "campaign",
      "relationshipType": "PART_OF"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Event template
      {
        name: 'Event Creation',
        description: 'Template for creating a new event',
        entityType: ProposalEntityType.EVENT,
        promptTemplate: `Create a detailed proposal for a new event in the following context:

Context data: {{contextData}}

Please consider the following aspects:
- Event name and type
- When and where it occurs
- Key participants and their roles
- Causes and circumstances
- Immediate effects and consequences
- Long-term implications
- How characters might learn about or interact with this event

Respond with a comprehensive event creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new event.
Be creative but also practical - focus on elements that would make the event interesting and impactful for the story.
Include enough detail to make the event feel significant and consequential.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Event: [Event Name]",
  "description": "Detailed description of the event",
  "reason": "Reason for creating this event",
  "changes": [
    {
      "field": "name",
      "newValue": "Event name",
      "description": "Name of the event"
    },
    {
      "field": "description",
      "newValue": "Event description",
      "description": "Detailed description of what happens"
    },
    {
      "field": "date",
      "newValue": "Event date",
      "description": "When the event occurs"
    },
    {
      "field": "participants",
      "newValue": "Event participants",
      "description": "Key participants and their roles"
    },
    {
      "field": "consequences",
      "newValue": "Event consequences",
      "description": "Effects and implications of the event"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "[NEW_EVENT_ID]",
      "sourceType": "event",
      "targetId": "{{contextId}}",
      "targetType": "campaign",
      "relationshipType": "PART_OF"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Power template
      {
        name: 'Power Creation',
        description: 'Template for creating a new power or ability',
        entityType: ProposalEntityType.POWER,
        promptTemplate: `Create a detailed proposal for a new power or ability in the following context:

Context data: {{contextData}}

Please consider the following aspects:
- Power name and type
- Description and manifestation
- Mechanics and limitations
- Origin or source
- Characters who possess this power
- Potential uses and applications
- Drawbacks or consequences

Respond with a comprehensive power creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new power or ability.
Be creative but also practical - focus on elements that would make the power interesting and balanced for gameplay.
Include enough detail to make the power feel unique and well-defined.

Respond in JSON format with the following structure:
{
  "type": "create",
  "title": "Create New Power: [Power Name]",
  "description": "Detailed description of the power",
  "reason": "Reason for creating this power",
  "changes": [
    {
      "field": "name",
      "newValue": "Power name",
      "description": "Name of the power"
    },
    {
      "field": "description",
      "newValue": "Power description",
      "description": "Detailed description of how the power works"
    },
    {
      "field": "mechanics",
      "newValue": "Power mechanics",
      "description": "Rules and mechanics for using the power"
    },
    {
      "field": "limitations",
      "newValue": "Power limitations",
      "description": "Limitations and drawbacks of the power"
    },
    {
      "field": "origin",
      "newValue": "Power origin",
      "description": "Origin or source of the power"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "[NEW_POWER_ID]",
      "sourceType": "power",
      "targetId": "{{contextId}}",
      "targetType": "campaign",
      "relationshipType": "PART_OF"
    }
  ]
}`,
        requiredContext: true
      },
      
      // Relationship template
      {
        name: 'Relationship Creation',
        description: 'Template for creating a new relationship between entities',
        entityType: ProposalEntityType.RELATIONSHIP,
        promptTemplate: `Create a detailed proposal for a new relationship between entities in the following context:

Context data: {{contextData}}

Entity data: {{entityData}}

Please consider the following aspects:
- Type of relationship
- Entities involved
- Nature and quality of the relationship
- History and development
- Current status
- Potential future developments
- Significance to the story

Respond with a comprehensive relationship creation proposal in JSON format.`,
        systemPrompt: `You are an AI assistant for an RPG campaign management system. 
Your task is to generate a detailed proposal for creating a new relationship between entities.
Be creative but also practical - focus on elements that would make the relationship interesting and meaningful for the story.
Include enough detail to make the relationship feel nuanced and dynamic.

Respond in JSON format with the following structure:
{
  "type": "relate",
  "title": "Create New Relationship",
  "description": "Detailed description of the relationship",
  "reason": "Reason for creating this relationship",
  "changes": [],
  "relationshipChanges": [
    {
      "sourceId": "ID of source entity",
      "sourceType": "Type of source entity",
      "targetId": "ID of target entity",
      "targetType": "Type of target entity",
      "relationshipType": "Type of relationship",
      "properties": {
        "description": "Detailed description of the relationship",
        "quality": "Nature and quality of the relationship",
        "history": "History and development of the relationship"
      }
    }
  ]
}`,
        requiredContext: true
      }
    ];
    
    // Create templates
    for (const template of defaultTemplates) {
      await changeProposalRepository.createTemplate(template);
      console.log(`Created template: ${template.name}`);
    }
    
    console.log('Default proposal templates initialized successfully.');
  } catch (error) {
    console.error('Error initializing default proposal templates:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initProposalTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
