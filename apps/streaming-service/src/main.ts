import { NestFactory } from '@nestjs/core';
import { StreamingServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(StreamingServiceModule);
  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('Streaming Sevice started');
  })
  .catch((err) => {
    console.log('Error during application context initialization', err);
  });
