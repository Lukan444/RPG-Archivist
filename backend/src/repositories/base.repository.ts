import { DatabaseService } from '../services/database.service';

/**
 * Base repository class
 */
export class BaseRepository {
  protected dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }
}
