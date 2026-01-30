import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import * as Minio from 'minio';

describe('videoController', () => {
  let controller: VideoController;
  let videoQueue: jest.Mocked<Pick<Queue, 'add'>>;
  let minioClient: jest.Mocked<Pick<Minio.Client, 'presignedPutObject'>>;

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
          useValue: {
            presignedPutObject: jest.fn(),
          },
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
    minioClient = module.get('MINIO_CLIENT');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateUploadUrl', () => {
    it('should return a presigned URL', async () => {
      // Mock the presignedPutObject method
      const mockPresignedUrl = 'http://example.com/presigned-url';
      minioClient.presignedPutObject = jest
        .fn()
        .mockResolvedValue(mockPresignedUrl);

      const result = await controller.generateUploadUrl();

      expect(minioClient.presignedPutObject).toHaveBeenCalledWith(
        'streamcore',
        expect.stringMatching(/^raw\/video_\d+\.mp4$/),
      );
      expect(result).toEqual({
        message: 'video upload url generated',
        url: mockPresignedUrl,
      });
    });
  });

  describe('handleWebhook', () => {
    it('should call queue.add correctly and return correct response', async () => {
      const mockBody = { foo: 'bar' };

      const result = await controller.handleWebhook(mockBody);

      expect(videoQueue.add).toHaveBeenCalledWith('process', mockBody);
      expect(result).toEqual({ message: 'webhook received' });
    });
    it('should propagate errors from the queue', async () => {
      (videoQueue.add as jest.Mock).mockRejectedValueOnce(
        new Error('Queue failed'),
      );

      await expect(controller.handleWebhook({ test: true })).rejects.toThrow(
        'Queue failed',
      );
    });
  });
});
