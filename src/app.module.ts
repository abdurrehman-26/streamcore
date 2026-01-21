import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './video/video.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.DATABASE_URI || 'mongodb://localhost/streamcore',
    ),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    VideoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
