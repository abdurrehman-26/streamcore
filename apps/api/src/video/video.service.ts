import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VideoMetadata } from '../schemas/video-metadata.schema';
import { Model } from 'mongoose';

export interface videoData {
  title?: string;
  description?: string;
}

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
  ) {}
  async updateVideo(videoId: string, videoData: videoData) {
    const updatevideoData: videoData = {};
    if (videoData.title) {
      updatevideoData.title = videoData.title;
    }
    if (videoData.description) {
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
}
