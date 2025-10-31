import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.DATABASE_URI || 'mongodb://localhost/streamcore',
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
