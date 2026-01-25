// email-verification.module.ts
import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { MailModule } from '../mail/mail.module';
import { MongoVerificationStoreModule } from './verification-stores/mongo/mongo-verification-store.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongoVerificationStoreModule, MailModule, UsersModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
