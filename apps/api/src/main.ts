import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Streamcore API Docs')
    .setDescription('OpenAPI documentation for Streamcore API')
    .setVersion('1.0')
    .addGlobalResponse({
      status: 400,
      description: 'Bad Request',
    })
    .addGlobalResponse({ status: 500, description: 'Internal Server Error' })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(
      'Streamcore server is running on port',
      process.env.PORT ?? 3000,
    );
  })
  .catch((err) => {
    console.error('Failed to start application:', err);
  });
