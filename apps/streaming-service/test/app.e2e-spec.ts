import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StreamingServiceModule } from '../src/app.module';

describe('StreamingServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StreamingServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
