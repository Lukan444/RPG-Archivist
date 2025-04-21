import { DatabaseService } from '../services/database.service';
import { GraphData, GraphNode, GraphEdge, NodeType, EdgeType, GraphQueryParams } from '../models/graph.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for graph data
 */
export class GraphRepository {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Get mind map graph data
   * @param params Query parameters
   * @returns Graph data
   */
  public async getMindMapGraph(params: GraphQueryParams = {}): Promise<GraphData> {
    try {
      // Set default values
      const depth = params.depth || 1;
      const nodeTypes = params.nodeTypes || Object.values(NodeType);
      const edgeTypes = params.edgeTypes || Object.values(EdgeType);
      const includeImages = params.includeImages !== undefined ? params.includeImages : true;

      // Build query
      let query = '';
      const queryParams: Record<string, any> = { depth, nodeTypes, edgeTypes };

      // Start with a specific entity if provided
      if (params.worldId) {
        query = `
          MATCH (start:RPGWorld {rpg_world_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.worldId;
      } else if (params.campaignId) {
        query = `
          MATCH (start:Campaign {campaign_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.campaignId;
      } else if (params.sessionId) {
        query = `
          MATCH (start:Session {session_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.sessionId;
      } else if (params.characterId) {
        query = `
          MATCH (start:Character {character_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.characterId;
      } else if (params.locationId) {
        query = `
          MATCH (start:Location {location_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.locationId;
      } else if (params.itemId) {
        query = `
          MATCH (start:Item {item_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.itemId;
      } else if (params.eventId) {
        query = `
          MATCH (start:Event {event_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.eventId;
      } else if (params.powerId) {
        query = `
          MATCH (start:Power {power_id: $startId})
          CALL apoc.path.expand(start, $edgeTypes, $nodeTypes, 1, $depth) YIELD path
          WITH DISTINCT nodes(path) as nodes, relationships(path) as rels
          UNWIND nodes as node
          WITH COLLECT(DISTINCT node) as allNodes, rels
          UNWIND rels as rel
          WITH COLLECT(DISTINCT rel) as allRels, allNodes
        `;
        queryParams.startId = params.powerId;
      } else {
        // If no specific entity is provided, get a sample of each entity type
        query = `
          MATCH (n)
          WHERE (n:RPGWorld OR n:Campaign OR n:Session OR n:Character OR n:Location OR n:Item OR n:Event OR n:Power)
          WITH n
          LIMIT 50
          WITH COLLECT(n) as allNodes
          MATCH (n)-[r]-(m)
          WHERE n IN allNodes AND m IN allNodes
          WITH allNodes, COLLECT(DISTINCT r) as allRels
        `;
      }

      // Complete the query to return nodes and relationships
      query += `
        RETURN
          [node IN allNodes | {
            id: CASE
              WHEN node:RPGWorld THEN node.rpg_world_id
              WHEN node:Campaign THEN node.campaign_id
              WHEN node:Session THEN node.session_id
              WHEN node:Character THEN node.character_id
              WHEN node:Location THEN node.location_id
              WHEN node:Item THEN node.item_id
              WHEN node:Event THEN node.event_id
              WHEN node:Power THEN node.power_id
              ELSE toString(id(node))
            END,
            label: COALESCE(node.name, node.title, ''),
            type: CASE
              WHEN node:RPGWorld THEN 'world'
              WHEN node:Campaign THEN 'campaign'
              WHEN node:Session THEN 'session'
              WHEN node:Character THEN 'character'
              WHEN node:Location THEN 'location'
              WHEN node:Item THEN 'item'
              WHEN node:Event THEN 'event'
              WHEN node:Power THEN 'power'
              ELSE 'unknown'
            END,
            imageUrl: CASE
              WHEN $includeImages THEN COALESCE(node.image_url, '')
              ELSE ''
            END,
            properties: node
          }] as nodes,
          [rel IN allRels | {
            id: toString(id(rel)),
            source: CASE
              WHEN startNode(rel):RPGWorld THEN startNode(rel).rpg_world_id
              WHEN startNode(rel):Campaign THEN startNode(rel).campaign_id
              WHEN startNode(rel):Session THEN startNode(rel).session_id
              WHEN startNode(rel):Character THEN startNode(rel).character_id
              WHEN startNode(rel):Location THEN startNode(rel).location_id
              WHEN startNode(rel):Item THEN startNode(rel).item_id
              WHEN startNode(rel):Event THEN startNode(rel).event_id
              WHEN startNode(rel):Power THEN startNode(rel).power_id
              ELSE toString(id(startNode(rel)))
            END,
            target: CASE
              WHEN endNode(rel):RPGWorld THEN endNode(rel).rpg_world_id
              WHEN endNode(rel):Campaign THEN endNode(rel).campaign_id
              WHEN endNode(rel):Session THEN endNode(rel).session_id
              WHEN endNode(rel):Character THEN endNode(rel).character_id
              WHEN endNode(rel):Location THEN endNode(rel).location_id
              WHEN endNode(rel):Item THEN endNode(rel).item_id
              WHEN endNode(rel):Event THEN endNode(rel).event_id
              WHEN endNode(rel):Power THEN endNode(rel).power_id
              ELSE toString(id(endNode(rel)))
            END,
            type: type(rel),
            label: type(rel),
            properties: rel
          }] as relationships
      `;

      // Execute query
      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { ...queryParams, includeImages });
        return result.records.length > 0
          ? {
              nodes: result.records[0].get('nodes'),
              edges: result.records[0].get('relationships')
            }
          : { nodes: [], edges: [] };
      });

      return result;
    } catch (error) {
      console.error('Error getting mind map graph:', error);
      throw error;
    }
  }

  /**
   * Get hierarchy graph data
   * @param params Query parameters
   * @returns Graph data
   */
  public async getHierarchyGraph(params: GraphQueryParams = {}): Promise<GraphData> {
    try {
      // Set default values
      const depth = params.depth || 3;
      const includeImages = params.includeImages !== undefined ? params.includeImages : true;

      // Build query
      let query = '';
      const queryParams: Record<string, any> = { depth };

      // Start with a specific entity if provided
      if (params.worldId) {
        query = `
          MATCH (world:RPGWorld {rpg_world_id: $worldId})
          OPTIONAL MATCH (world)-[:CONTAINS]->(campaign:Campaign)
          OPTIONAL MATCH (campaign)-[:CONTAINS]->(session:Session)
          OPTIONAL MATCH (session)-[:HAS_PARTICIPANT]->(character:Character)
          WITH world, campaign, session, character
          WHERE world IS NOT NULL
          
          WITH 
            COLLECT(DISTINCT world) as worlds,
            COLLECT(DISTINCT campaign) as campaigns,
            COLLECT(DISTINCT session) as sessions,
            COLLECT(DISTINCT character) as characters
          
          UNWIND worlds as world
          WITH world, campaigns, sessions, characters
          WHERE world IS NOT NULL
          
          WITH 
            COLLECT({
              id: world.rpg_world_id,
              label: world.name,
              type: 'world',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(world.image_url, '') ELSE '' END,
              properties: world
            }) as worldNodes,
            campaigns, sessions, characters
          
          UNWIND campaigns as campaign
          WITH campaign, worldNodes, campaigns, sessions, characters
          WHERE campaign IS NOT NULL
          
          WITH 
            worldNodes,
            COLLECT({
              id: campaign.campaign_id,
              label: campaign.name,
              type: 'campaign',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(campaign.image_url, '') ELSE '' END,
              properties: campaign
            }) as campaignNodes,
            campaigns, sessions, characters
          
          UNWIND sessions as session
          WITH session, worldNodes, campaignNodes, campaigns, sessions, characters
          WHERE session IS NOT NULL
          
          WITH 
            worldNodes,
            campaignNodes,
            COLLECT({
              id: session.session_id,
              label: session.title,
              type: 'session',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(session.image_url, '') ELSE '' END,
              properties: session
            }) as sessionNodes,
            campaigns, sessions, characters
          
          UNWIND characters as character
          WITH character, worldNodes, campaignNodes, sessionNodes, campaigns, sessions, characters
          WHERE character IS NOT NULL
          
          WITH 
            worldNodes,
            campaignNodes,
            sessionNodes,
            COLLECT({
              id: character.character_id,
              label: character.name,
              type: 'character',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(character.image_url, '') ELSE '' END,
              properties: character
            }) as characterNodes
          
          WITH worldNodes + campaignNodes + sessionNodes + characterNodes as allNodes
          
          UNWIND campaigns as campaign
          MATCH (world:RPGWorld)-[:CONTAINS]->(campaign)
          WITH allNodes, world, campaign
          
          WITH 
            allNodes,
            COLLECT({
              id: 'w2c_' + world.rpg_world_id + '_' + campaign.campaign_id,
              source: world.rpg_world_id,
              target: campaign.campaign_id,
              type: 'CONTAINS',
              label: 'CONTAINS',
              properties: {}
            }) as worldToCampaignEdges
          
          UNWIND sessions as session
          MATCH (campaign:Campaign)-[:CONTAINS]->(session)
          WITH allNodes, worldToCampaignEdges, campaign, session
          
          WITH 
            allNodes,
            worldToCampaignEdges,
            COLLECT({
              id: 'c2s_' + campaign.campaign_id + '_' + session.session_id,
              source: campaign.campaign_id,
              target: session.session_id,
              type: 'CONTAINS',
              label: 'CONTAINS',
              properties: {}
            }) as campaignToSessionEdges
          
          UNWIND characters as character
          MATCH (session:Session)-[:HAS_PARTICIPANT]->(character)
          WITH allNodes, worldToCampaignEdges, campaignToSessionEdges, session, character
          
          WITH 
            allNodes,
            worldToCampaignEdges,
            campaignToSessionEdges,
            COLLECT({
              id: 's2c_' + session.session_id + '_' + character.character_id,
              source: session.session_id,
              target: character.character_id,
              type: 'HAS_PARTICIPANT',
              label: 'HAS_PARTICIPANT',
              properties: {}
            }) as sessionToCharacterEdges
          
          RETURN 
            allNodes as nodes,
            worldToCampaignEdges + campaignToSessionEdges + sessionToCharacterEdges as relationships
        `;
        queryParams.worldId = params.worldId;
      } else if (params.campaignId) {
        query = `
          MATCH (campaign:Campaign {campaign_id: $campaignId})
          OPTIONAL MATCH (campaign)-[:CONTAINS]->(session:Session)
          OPTIONAL MATCH (session)-[:HAS_PARTICIPANT]->(character:Character)
          WITH campaign, session, character
          WHERE campaign IS NOT NULL
          
          WITH 
            COLLECT(DISTINCT campaign) as campaigns,
            COLLECT(DISTINCT session) as sessions,
            COLLECT(DISTINCT character) as characters
          
          UNWIND campaigns as campaign
          WITH campaign, campaigns, sessions, characters
          WHERE campaign IS NOT NULL
          
          WITH 
            COLLECT({
              id: campaign.campaign_id,
              label: campaign.name,
              type: 'campaign',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(campaign.image_url, '') ELSE '' END,
              properties: campaign
            }) as campaignNodes,
            campaigns, sessions, characters
          
          UNWIND sessions as session
          WITH session, campaignNodes, campaigns, sessions, characters
          WHERE session IS NOT NULL
          
          WITH 
            campaignNodes,
            COLLECT({
              id: session.session_id,
              label: session.title,
              type: 'session',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(session.image_url, '') ELSE '' END,
              properties: session
            }) as sessionNodes,
            campaigns, sessions, characters
          
          UNWIND characters as character
          WITH character, campaignNodes, sessionNodes, campaigns, sessions, characters
          WHERE character IS NOT NULL
          
          WITH 
            campaignNodes,
            sessionNodes,
            COLLECT({
              id: character.character_id,
              label: character.name,
              type: 'character',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(character.image_url, '') ELSE '' END,
              properties: character
            }) as characterNodes
          
          WITH campaignNodes + sessionNodes + characterNodes as allNodes
          
          UNWIND sessions as session
          MATCH (campaign:Campaign)-[:CONTAINS]->(session)
          WITH allNodes, campaign, session
          
          WITH 
            allNodes,
            COLLECT({
              id: 'c2s_' + campaign.campaign_id + '_' + session.session_id,
              source: campaign.campaign_id,
              target: session.session_id,
              type: 'CONTAINS',
              label: 'CONTAINS',
              properties: {}
            }) as campaignToSessionEdges
          
          UNWIND characters as character
          MATCH (session:Session)-[:HAS_PARTICIPANT]->(character)
          WITH allNodes, campaignToSessionEdges, session, character
          
          WITH 
            allNodes,
            campaignToSessionEdges,
            COLLECT({
              id: 's2c_' + session.session_id + '_' + character.character_id,
              source: session.session_id,
              target: character.character_id,
              type: 'HAS_PARTICIPANT',
              label: 'HAS_PARTICIPANT',
              properties: {}
            }) as sessionToCharacterEdges
          
          RETURN 
            allNodes as nodes,
            campaignToSessionEdges + sessionToCharacterEdges as relationships
        `;
        queryParams.campaignId = params.campaignId;
      } else {
        // If no specific entity is provided, get all worlds and their hierarchies
        query = `
          MATCH (world:RPGWorld)
          OPTIONAL MATCH (world)-[:CONTAINS]->(campaign:Campaign)
          OPTIONAL MATCH (campaign)-[:CONTAINS]->(session:Session)
          WITH world, campaign, session
          LIMIT 100
          
          WITH 
            COLLECT(DISTINCT world) as worlds,
            COLLECT(DISTINCT campaign) as campaigns,
            COLLECT(DISTINCT session) as sessions
          
          UNWIND worlds as world
          WITH world, campaigns, sessions
          WHERE world IS NOT NULL
          
          WITH 
            COLLECT({
              id: world.rpg_world_id,
              label: world.name,
              type: 'world',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(world.image_url, '') ELSE '' END,
              properties: world
            }) as worldNodes,
            campaigns, sessions
          
          UNWIND campaigns as campaign
          WITH campaign, worldNodes, campaigns, sessions
          WHERE campaign IS NOT NULL
          
          WITH 
            worldNodes,
            COLLECT({
              id: campaign.campaign_id,
              label: campaign.name,
              type: 'campaign',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(campaign.image_url, '') ELSE '' END,
              properties: campaign
            }) as campaignNodes,
            campaigns, sessions
          
          UNWIND sessions as session
          WITH session, worldNodes, campaignNodes, campaigns, sessions
          WHERE session IS NOT NULL
          
          WITH 
            worldNodes,
            campaignNodes,
            COLLECT({
              id: session.session_id,
              label: session.title,
              type: 'session',
              imageUrl: CASE WHEN $includeImages THEN COALESCE(session.image_url, '') ELSE '' END,
              properties: session
            }) as sessionNodes
          
          WITH worldNodes + campaignNodes + sessionNodes as allNodes
          
          UNWIND campaigns as campaign
          MATCH (world:RPGWorld)-[:CONTAINS]->(campaign)
          WITH allNodes, world, campaign
          
          WITH 
            allNodes,
            COLLECT({
              id: 'w2c_' + world.rpg_world_id + '_' + campaign.campaign_id,
              source: world.rpg_world_id,
              target: campaign.campaign_id,
              type: 'CONTAINS',
              label: 'CONTAINS',
              properties: {}
            }) as worldToCampaignEdges
          
          UNWIND sessions as session
          MATCH (campaign:Campaign)-[:CONTAINS]->(session)
          WITH allNodes, worldToCampaignEdges, campaign, session
          
          WITH 
            allNodes,
            worldToCampaignEdges,
            COLLECT({
              id: 'c2s_' + campaign.campaign_id + '_' + session.session_id,
              source: campaign.campaign_id,
              target: session.session_id,
              type: 'CONTAINS',
              label: 'CONTAINS',
              properties: {}
            }) as campaignToSessionEdges
          
          RETURN 
            allNodes as nodes,
            worldToCampaignEdges + campaignToSessionEdges as relationships
        `;
      }

      // Execute query
      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { ...queryParams, includeImages });
        return result.records.length > 0
          ? {
              nodes: result.records[0].get('nodes'),
              edges: result.records[0].get('relationships')
            }
          : { nodes: [], edges: [] };
      });

      return result;
    } catch (error) {
      console.error('Error getting hierarchy graph:', error);
      throw error;
    }
  }
}
