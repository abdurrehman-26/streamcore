// mongo-verification.store.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VerificationStore } from '../verification-store.interface';
import { EmailVerification } from '../../../schemas/email-verification.schema';
import bcrypt from 'bcryptjs';

@Injectable()
export class MongoVerificationStoreService implements VerificationStore {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly verificationModel: Model<EmailVerification>,
  ) {}

  async saveCode(
    email: string,
    code: string,
    ttlSeconds: number,
  ): Promise<void> {
    const hashed = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.verificationModel.findOneAndUpdate(
      { email },
      { codeHash: hashed, expiresAt },
      { upsert: true, new: true },
    );
  }

  async getCode(email: string): Promise<string | null> {
    const record = await this.verificationModel.findOne({ email });
    if (!record || record.expiresAt.getTime() < Date.now()) return null;
    return record.codeHash;
  }

  async deleteCode(email: string): Promise<void> {
    await this.verificationModel.deleteOne({ email });
  }
}
