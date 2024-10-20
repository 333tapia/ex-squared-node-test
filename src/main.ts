import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './db/seed.service';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const dbExists = existsSync('database.sqlite');
  if (!dbExists) {
    const dbSeed = app.get(SeedService);
    await dbSeed.run();
  }

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
