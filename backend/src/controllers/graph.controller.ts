import { Request, Response } from 'express';
import { GraphService } from '../services/graph.service';
import { NodeType, EdgeType } from '../models/graph.model';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
};

/**
 * Controller for graph data
 */
export class GraphController {
  private graphService: GraphService;

  constructor(graphService: GraphService) {
    this.graphService = graphService;

    // Bind methods to ensure 'this' context
    this.getGraphData = this.getGraphData.bind(this);
    this.getMindMapGraph = this.getMindMapGraph.bind(this);
    this.getHierarchyGraph = this.getHierarchyGraph.bind(this);
  }

  /**
   * Get error message from error object
   * @param error Error object
   * @returns Error message
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Get graph data
   * @param req Request
   * @param res Response
   */
  public async getGraphData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const worldId = req.query.worldId as string;
      const campaignId = req.query.campaignId as string;
      const sessionId = req.query.sessionId as string;
      const characterId = req.query.characterId as string;
      const locationId = req.query.locationId as string;
      const itemId = req.query.itemId as string;
      const eventId = req.query.eventId as string;
      const powerId = req.query.powerId as string;
      const depth = req.query.depth ? parseInt(req.query.depth as string) : undefined;
      const nodeTypes = req.query.nodeTypes ? (req.query.nodeTypes as string).split(',') as NodeType[] : undefined;
      const edgeTypes = req.query.edgeTypes ? (req.query.edgeTypes as string).split(',') as EdgeType[] : undefined;
      const includeImages = req.query.includeImages ? req.query.includeImages === 'true' : undefined;
      const layout = req.query.layout as 'force' | 'hierarchy' | 'radial' | undefined;

      // Get graph data based on provided parameters
      let graphData;
      if (worldId) {
        graphData = await this.graphService.getWorldGraph(worldId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (campaignId) {
        graphData = await this.graphService.getCampaignGraph(campaignId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (sessionId) {
        graphData = await this.graphService.getSessionGraph(sessionId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (characterId) {
        graphData = await this.graphService.getCharacterGraph(characterId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (locationId) {
        graphData = await this.graphService.getLocationGraph(locationId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (itemId) {
        graphData = await this.graphService.getItemGraph(itemId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (eventId) {
        graphData = await this.graphService.getEventGraph(eventId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else if (powerId) {
        graphData = await this.graphService.getPowerGraph(powerId, { depth, nodeTypes, edgeTypes, includeImages, layout });
      } else {
        graphData = await this.graphService.getMindMapGraph({ depth, nodeTypes, edgeTypes, includeImages, layout });
      }

      // Return response
      res.status(200).json({
        success: true,
        data: graphData
      });
    } catch (error) {
      console.error('Error getting graph data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get graph data',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get mind map graph
   * @param req Request
   * @param res Response
   */
  public async getMindMapGraph(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const depth = req.query.depth ? parseInt(req.query.depth as string) : undefined;
      const nodeTypes = req.query.nodeTypes ? (req.query.nodeTypes as string).split(',') as NodeType[] : undefined;
      const edgeTypes = req.query.edgeTypes ? (req.query.edgeTypes as string).split(',') as EdgeType[] : undefined;
      const includeImages = req.query.includeImages ? req.query.includeImages === 'true' : undefined;
      const layout = req.query.layout as 'force' | 'hierarchy' | 'radial' | undefined;

      // Get mind map graph
      const graphData = await this.graphService.getMindMapGraph({
        depth,
        nodeTypes,
        edgeTypes,
        includeImages,
        layout
      });

      // Return response
      res.status(200).json({
        success: true,
        data: graphData
      });
    } catch (error) {
      console.error('Error getting mind map graph:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get mind map graph',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get hierarchy graph
   * @param req Request
   * @param res Response
   */
  public async getHierarchyGraph(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const worldId = req.query.worldId as string;
      const campaignId = req.query.campaignId as string;
      const depth = req.query.depth ? parseInt(req.query.depth as string) : undefined;
      const includeImages = req.query.includeImages ? req.query.includeImages === 'true' : undefined;

      // Get hierarchy graph
      let graphData;
      if (worldId) {
        graphData = await this.graphService.getWorldHierarchyGraph(worldId, { depth, includeImages });
      } else if (campaignId) {
        graphData = await this.graphService.getCampaignHierarchyGraph(campaignId, { depth, includeImages });
      } else {
        graphData = await this.graphService.getHierarchyGraph({ depth, includeImages });
      }

      // Return response
      res.status(200).json({
        success: true,
        data: graphData
      });
    } catch (error) {
      console.error('Error getting hierarchy graph:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get hierarchy graph',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
