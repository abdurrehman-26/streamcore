import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationSchema,
} from '../../../schemas/email-verification.schema';
import { MongoVerificationStoreService } from './mongo-verification-store.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
  ],
  providers: [MongoVerificationStoreService],
  exports: [MongoVerificationStoreService],
})
export class MongoVerificationStoreModule {}
