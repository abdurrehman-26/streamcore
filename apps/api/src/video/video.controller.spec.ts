import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

describe('videoController', () => {
  let controller: VideoController;
  let videoQueue: jest.Mocked<Pick<Queue, 'add'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        // Mock Queue provider
        {
          provide: 'BullQueue_videoProcessing',
          useValue: {
            add: jest.fn().mockResolvedValue(undefined),
          },
        },

        // Mock MinIO client
        {
          provide: 'MINIO_CLIENT',
          useValue: {},
        },

        // Mock config service
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    videoQueue = module.get('BullQueue_videoProcessing');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call queue.add correctly', async () => {
    const mockBody = { foo: 'bar' };

    const result = await controller.handleWebhook(mockBody);

    expect(videoQueue.add).toHaveBeenCalledWith('process', mockBody);
    expect(result).toEqual({ message: 'webhook received' });
  });
});
