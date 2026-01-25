import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap()
  .then(() => {
    console.log('Worker started successfully');
  })
  .catch((err) => {
    console.error('Error during application context initialization', err);
  });
