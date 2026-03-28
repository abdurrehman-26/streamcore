import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VideoMetadata,
  VideoMetadataDocument,
} from '../schemas/video-metadata.schema';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface videoData {
  title?: string;
  description?: string;
}

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async getAllVideos(): Promise<VideoMetadataDocument[]> {
    return this.videoMetadataModel.find().select('-_id -__v -updatedAt').exec();
  }

  async updateVideo(videoId: string, videoData: videoData) {
    const updatevideoData: videoData = {};
    if (videoData?.title) {
      updatevideoData.title = videoData.title;
    }
    if (videoData?.description) {
      updatevideoData.description = videoData.description;
    }
    return await this.videoMetadataModel
      .findOneAndUpdate(
        {
          videoId: videoId,
        },
        updatevideoData,
        { new: true },
      )
      .select('-_id -__v -updatedAt');
  }

  async createPutVideoUpload() {
    const videoId = nanoid(12);
    const key = `raw/${videoId}.mp4`;
    await this.videoMetadataModel.create({
      videoId,
      title: videoId,
      status: 'uploading',
    });
    const command = new PutObjectCommand({
      Bucket: 'streamcore',
      Key: key,
      ContentType: 'video/mp4',
    });

    const presignedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    }); // 1 hour
    return { url: presignedUrl, videoId };
  }

  async createMultipartVideoUpload() {
    const videoId = nanoid(12);

    await this.videoMetadataModel.create({
      videoId,
      title: videoId,
      status: 'uploading',
    });

    const command = new CreateMultipartUploadCommand({
      Bucket: 'streamcore',
      Key: `raw/${videoId}.mp4`,
      ContentType: 'video/mp4',
    });

    const res = await this.s3.send(command);

    return {
      uploadId: res.UploadId,
      key: res.Key,
    };
  }

  async getMultipartVideoUploadUrls(
    key: string,
    uploadId: string,
    parts: number[],
  ) {
    return await Promise.all(
      parts.map(async (num) => {
        const command = new UploadPartCommand({
          Bucket: 'streamcore',
          Key: key,
          UploadId: uploadId,
          PartNumber: num,
        });

        const signedUrl = await getSignedUrl(this.s3, command, {
          expiresIn: 3600,
        });

        return { partNumber: num, url: signedUrl };
      }),
    );
  }

  async completeMultipartVideoUpload(
    key: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: 'streamcore',
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    return await this.s3.send(command);
  }
}
