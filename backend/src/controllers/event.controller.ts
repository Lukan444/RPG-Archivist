import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Event, EventType } from '../models/event.model';
import { validationResult } from 'express-validator';

/**
 * Event controller for handling event-related requests
 */
export class EventController {
  private repositoryFactory: RepositoryFactory;

  constructor(repositoryFactory: RepositoryFactory) {
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Get all events
   * @param req Express request
   * @param res Express response
   */
  public async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const sessionId = req.query.session_id as string;
      const eventType = req.query.event_type as EventType;
      const locationId = req.query.location_id as string;

      // Check if campaign_id is provided
      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_ID_REQUIRED',
            message: 'Campaign ID is required'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Get events
      const { events, total } = await this.repositoryFactory.getEventRepository().findAll(
        campaignId,
        page,
        limit,
        req.query.sort as string || 'timeline_position',
        req.query.order as 'asc' | 'desc' || 'asc',
        search,
        sessionId,
        eventType,
        locationId
      );

      // Return response
      res.status(200).json({
        success: true,
        data: events,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting events'
        }
      });
    }
  }

  /**
   * Get event by ID
   * @param req Express request
   * @param res Express response
   */
  public async getEventById(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Return response
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting event'
        }
      });
    }
  }

  /**
   * Create event
   * @param req Express request
   * @param res Express response
   */
  public async createEvent(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if campaign exists
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(req.body.campaign_id);
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CAMPAIGN_NOT_FOUND',
            message: 'Campaign not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(req.body.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if session exists if provided
      if (req.body.session_id) {
        const session = await this.repositoryFactory.getSessionRepository().findById(req.body.session_id);
        if (!session) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: 'Session not found'
            }
          });
          return;
        }

        // Check if session belongs to campaign
        if (session.campaign_id !== req.body.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'SESSION_CAMPAIGN_MISMATCH',
              message: 'Session does not belong to the specified campaign'
            }
          });
          return;
        }
      }

      // Check if location exists if provided
      if (req.body.location_id) {
        const location = await this.repositoryFactory.getLocationRepository().findById(req.body.location_id);
        if (!location) {
          res.status(404).json({
            success: false,
            error: {
              code: 'LOCATION_NOT_FOUND',
              message: 'Location not found'
            }
          });
          return;
        }

        // Check if location belongs to campaign
        if (location.campaign_id !== req.body.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'LOCATION_CAMPAIGN_MISMATCH',
              message: 'Location does not belong to the specified campaign'
            }
          });
          return;
        }
      }

      // Get the highest timeline position if not provided
      let timelinePosition = req.body.timeline_position;
      if (timelinePosition === undefined) {
        const highestPosition = await this.repositoryFactory.getEventRepository().getHighestTimelinePosition(req.body.campaign_id);
        timelinePosition = highestPosition + 1;
      }

      // Create event
      const event = await this.repositoryFactory.getEventRepository().create({
        campaign_id: req.body.campaign_id,
        session_id: req.body.session_id,
        name: req.body.name,
        description: req.body.description,
        event_type: req.body.event_type,
        event_date: req.body.event_date,
        timeline_position: timelinePosition,
        location_id: req.body.location_id
      }, userId);

      // Return response
      res.status(201).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating event'
        }
      });
    }
  }

  /**
   * Update event
   * @param req Express request
   * @param res Express response
   */
  public async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if session exists if provided
      if (req.body.session_id) {
        const session = await this.repositoryFactory.getSessionRepository().findById(req.body.session_id);
        if (!session) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: 'Session not found'
            }
          });
          return;
        }

        // Check if session belongs to campaign
        if (session.campaign_id !== event.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'SESSION_CAMPAIGN_MISMATCH',
              message: 'Session does not belong to the specified campaign'
            }
          });
          return;
        }
      }

      // Check if location exists if provided
      if (req.body.location_id) {
        const location = await this.repositoryFactory.getLocationRepository().findById(req.body.location_id);
        if (!location) {
          res.status(404).json({
            success: false,
            error: {
              code: 'LOCATION_NOT_FOUND',
              message: 'Location not found'
            }
          });
          return;
        }

        // Check if location belongs to campaign
        if (location.campaign_id !== event.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'LOCATION_CAMPAIGN_MISMATCH',
              message: 'Location does not belong to the specified campaign'
            }
          });
          return;
        }
      }

      // Update event
      const updatedEvent = await this.repositoryFactory.getEventRepository().update(eventId, {
        name: req.body.name,
        description: req.body.description,
        event_type: req.body.event_type,
        event_date: req.body.event_date,
        timeline_position: req.body.timeline_position,
        session_id: req.body.session_id,
        location_id: req.body.location_id
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating event'
        }
      });
    }
  }

  /**
   * Delete event
   * @param req Express request
   * @param res Express response
   */
  public async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Delete event
      try {
        const deleted = await this.repositoryFactory.getEventRepository().delete(eventId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error.message === 'Cannot delete event with associated characters or items') {
          res.status(400).json({
            success: false,
            error: {
              code: 'EVENT_HAS_ASSOCIATIONS',
              message: 'Cannot delete event with associated characters or items'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting event'
        }
      });
    }
  }

  /**
   * Get characters in event
   * @param req Express request
   * @param res Express response
   */
  public async getCharactersInEvent(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Get characters in event
      const eventCharacters = await this.repositoryFactory.getEventRepository().getCharactersInEvent(eventId);

      // Return response
      res.status(200).json({
        success: true,
        data: eventCharacters
      });
    } catch (error) {
      console.error('Error getting characters in event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting characters in event'
        }
      });
    }
  }

  /**
   * Add character to event
   * @param req Express request
   * @param res Express response
   */
  public async addCharacterToEvent(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID and character ID from request parameters
      const eventId = req.params.id;
      const characterId = req.body.character_id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Check if character and event are in the same campaign
      if (character.campaign_id !== event.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_MISMATCH',
            message: 'Character and event must be in the same campaign'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if character is already in event
      const eventCharacter = await this.repositoryFactory.getEventRepository().getEventCharacter(eventId, characterId);
      if (eventCharacter) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CHARACTER_ALREADY_IN_EVENT',
            message: 'Character is already in this event'
          }
        });
        return;
      }

      // Add character to event
      const newEventCharacter = await this.repositoryFactory.getEventRepository().addCharacterToEvent({
        event_id: eventId,
        character_id: characterId,
        role: req.body.role,
        notes: req.body.notes
      });

      // Return response
      res.status(201).json({
        success: true,
        data: newEventCharacter
      });
    } catch (error) {
      console.error('Error adding character to event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding character to event'
        }
      });
    }
  }

  /**
   * Update event character
   * @param req Express request
   * @param res Express response
   */
  public async updateEventCharacter(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID and character ID from request parameters
      const eventId = req.params.id;
      const characterId = req.params.characterId;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if character is in event
      const eventCharacter = await this.repositoryFactory.getEventRepository().getEventCharacter(eventId, characterId);
      if (!eventCharacter) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_IN_EVENT',
            message: 'Character is not in this event'
          }
        });
        return;
      }

      // Update event character
      const updatedEventCharacter = await this.repositoryFactory.getEventRepository().updateEventCharacter(eventId, characterId, {
        role: req.body.role,
        notes: req.body.notes
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedEventCharacter
      });
    } catch (error) {
      console.error('Error updating event character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating event character'
        }
      });
    }
  }

  /**
   * Remove character from event
   * @param req Express request
   * @param res Express response
   */
  public async removeCharacterFromEvent(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID and character ID from request parameters
      const eventId = req.params.id;
      const characterId = req.params.characterId;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if character is in event
      const eventCharacter = await this.repositoryFactory.getEventRepository().getEventCharacter(eventId, characterId);
      if (!eventCharacter) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_IN_EVENT',
            message: 'Character is not in this event'
          }
        });
        return;
      }

      // Remove character from event
      const deleted = await this.repositoryFactory.getEventRepository().removeCharacterFromEvent(eventId, characterId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error removing character from event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing character from event'
        }
      });
    }
  }

  /**
   * Get items in event
   * @param req Express request
   * @param res Express response
   */
  public async getItemsInEvent(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Get items in event
      const eventItems = await this.repositoryFactory.getEventRepository().getItemsInEvent(eventId);

      // Return response
      res.status(200).json({
        success: true,
        data: eventItems
      });
    } catch (error) {
      console.error('Error getting items in event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting items in event'
        }
      });
    }
  }

  /**
   * Add item to event
   * @param req Express request
   * @param res Express response
   */
  public async addItemToEvent(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID and item ID from request parameters
      const eventId = req.params.id;
      const itemId = req.body.item_id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Check if item and event are in the same campaign
      if (item.campaign_id !== event.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_MISMATCH',
            message: 'Item and event must be in the same campaign'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if item is already in event
      const eventItem = await this.repositoryFactory.getEventRepository().getEventItem(eventId, itemId);
      if (eventItem) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ITEM_ALREADY_IN_EVENT',
            message: 'Item is already in this event'
          }
        });
        return;
      }

      // Add item to event
      const newEventItem = await this.repositoryFactory.getEventRepository().addItemToEvent({
        event_id: eventId,
        item_id: itemId,
        role: req.body.role,
        notes: req.body.notes
      });

      // Return response
      res.status(201).json({
        success: true,
        data: newEventItem
      });
    } catch (error) {
      console.error('Error adding item to event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding item to event'
        }
      });
    }
  }

  /**
   * Update event item
   * @param req Express request
   * @param res Express response
   */
  public async updateEventItem(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID and item ID from request parameters
      const eventId = req.params.id;
      const itemId = req.params.itemId;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if item is in event
      const eventItem = await this.repositoryFactory.getEventRepository().getEventItem(eventId, itemId);
      if (!eventItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_IN_EVENT',
            message: 'Item is not in this event'
          }
        });
        return;
      }

      // Update event item
      const updatedEventItem = await this.repositoryFactory.getEventRepository().updateEventItem(eventId, itemId, {
        role: req.body.role,
        notes: req.body.notes
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedEventItem
      });
    } catch (error) {
      console.error('Error updating event item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating event item'
        }
      });
    }
  }

  /**
   * Remove item from event
   * @param req Express request
   * @param res Express response
   */
  public async removeItemFromEvent(req: Request, res: Response): Promise<void> {
    try {
      // Get event ID and item ID from request parameters
      const eventId = req.params.id;
      const itemId = req.params.itemId;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Check if item is in event
      const eventItem = await this.repositoryFactory.getEventRepository().getEventItem(eventId, itemId);
      if (!eventItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_IN_EVENT',
            message: 'Item is not in this event'
          }
        });
        return;
      }

      // Remove item from event
      const deleted = await this.repositoryFactory.getEventRepository().removeItemFromEvent(eventId, itemId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error removing item from event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing item from event'
        }
      });
    }
  }

  /**
   * Get campaign timeline
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignTimeline(req: Request, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.campaignId;

      // Check if campaign exists
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CAMPAIGN_NOT_FOUND',
            message: 'Campaign not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Get campaign timeline
      const timeline = await this.repositoryFactory.getEventRepository().getCampaignTimeline(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('Error getting campaign timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign timeline'
        }
      });
    }
  }

  /**
   * Update event timeline position
   * @param req Express request
   * @param res Express response
   */
  public async updateEventTimelinePosition(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get event ID from request parameters
      const eventId = req.params.id;

      // Get event
      const event = await this.repositoryFactory.getEventRepository().findById(eventId);

      // Check if event exists
      if (!event) {
        res.status(404).json({
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Event not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(event.campaign_id, userId);
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Update event timeline position
      const updatedEvent = await this.repositoryFactory.getEventRepository().updateTimelinePosition(eventId, {
        timeline_position: req.body.timeline_position
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event timeline position:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating event timeline position'
        }
      });
    }
  }
}
