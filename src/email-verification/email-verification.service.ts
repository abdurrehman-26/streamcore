// email-verification.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { MongoVerificationStoreService } from './verification-stores/mongo/mongo-verification-store.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly store: MongoVerificationStoreService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  async requestCode(email: string): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    await this.store.saveCode(email, code, 15 * 60); // 15 min TTL
    await this.mailService.sendVerificationEmail(email, code);
    return code;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const saved = await this.store.getCode(email);
    if (!saved) throw new BadRequestException('Code expired or not found');

    const isValid =
      saved.length > 6 ? await bcrypt.compare(code, saved) : saved === code;
    if (!isValid) throw new BadRequestException('Invalid code');
    await this.usersService.markEmailAsVerified(email);
    await this.store.deleteCode(email);
    return true;
  }
}
