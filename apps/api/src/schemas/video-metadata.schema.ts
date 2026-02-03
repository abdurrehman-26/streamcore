import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoMetadataDocument = HydratedDocument<VideoMetadata>;

@Schema({ timestamps: true })
export class VideoMetadata {
  @Prop({ required: true, unique: true })
  videoId: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  status: 'uploading' | 'processing' | 'ready';

  @Prop()
  manifestURL: string;

  @Prop({ ref: 'User' })
  userId: string;
}

export const VideoMetadataSchema = SchemaFactory.createForClass(VideoMetadata);
