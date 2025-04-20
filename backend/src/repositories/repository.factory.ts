import { DatabaseService } from '../services/database.service';
import { RPGWorldRepository } from './rpg-world.repository';
import { CampaignRepository } from './campaign.repository';
import { SessionRepository } from './session.repository';
import { CharacterRepository } from './character.repository';
import { LocationRepository } from './location.repository';
import { TranscriptionRepository } from './transcription.repository';
import { UserRepository } from './user.repository';
import { PowerRepository } from './power.repository';
import { ItemRepository } from './item.repository';

/**
 * Repository factory
 */
export class RepositoryFactory {
  private dbService: DatabaseService;
  private repositories: Map<string, any>;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
    this.repositories = new Map();
  }

  /**
   * Get repository
   * @param name Repository name
   * @param factory Factory function
   * @returns Repository
   */
  private getRepository<T>(name: string, factory: () => T): T {
    if (!this.repositories.has(name)) {
      this.repositories.set(name, factory());
    }
    return this.repositories.get(name);
  }

  /**
   * Get RPG World repository
   */
  public getRPGWorldRepository(): RPGWorldRepository {
    return this.getRepository('rpgWorld', () => new RPGWorldRepository(this.dbService));
  }

  /**
   * Get Campaign repository
   */
  public getCampaignRepository(): CampaignRepository {
    return this.getRepository('campaign', () => new CampaignRepository(this.dbService));
  }

  /**
   * Get Session repository
   */
  public getSessionRepository(): SessionRepository {
    return this.getRepository('session', () => new SessionRepository(this.dbService));
  }

  /**
   * Get Character repository
   */
  public getCharacterRepository(): CharacterRepository {
    return this.getRepository('character', () => new CharacterRepository(this.dbService));
  }

  /**
   * Get Location repository
   */
  public getLocationRepository(): LocationRepository {
    return this.getRepository('location', () => new LocationRepository(this.dbService));
  }

  /**
   * Get Transcription repository
   */
  public getTranscriptionRepository(): TranscriptionRepository {
    return this.getRepository('transcription', () => new TranscriptionRepository(this.dbService));
  }

  /**
   * Get User repository
   */
  public getUserRepository(): UserRepository {
    return this.getRepository('user', () => new UserRepository(this.dbService));
  }

  /**
   * Get Power repository
   */
  public getPowerRepository(): PowerRepository {
    return this.getRepository('power', () => new PowerRepository(this.dbService));
  }

  /**
   * Get Item repository
   */
  public getItemRepository(): ItemRepository {
    return this.getRepository('item', () => new ItemRepository(this.dbService));
  }
}
