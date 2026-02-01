import { Prop, Schema } from '@nestjs/mongoose';

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
