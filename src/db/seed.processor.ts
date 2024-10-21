import { Process, Processor } from '@nestjs/bull';
import { SeedService } from './seed.service';

@Processor('db-seed')
export class SeedProcessor {
  constructor(private readonly seedService: SeedService) {}

  @Process()
  async populateDb() {
    await this.seedService.run();
  }
}
