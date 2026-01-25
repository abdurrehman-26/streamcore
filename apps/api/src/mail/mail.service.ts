// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { EnvironmentVariables } from '../types/env';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailerSend: MailerSend;
  private readonly sender: Sender;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.mailerSend = new MailerSend({
      apiKey: this.configService.get<string>('MAILERSEND_API_KEY') || '',
    });
    this.sender = new Sender(
      this.configService.get<string>('MAILERSEND_FROM_EMAIL') || '',
      this.configService.get<string>('MAILERSEND_FROM_NAME') || '',
    );
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const recipients = [new Recipient(email, email)];

    const emailParams = new EmailParams()
      .setFrom(this.sender)
      .setTo(recipients)
      .setSubject('Verify your email address')
      .setHtml(
        `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h3 style="font-size: 24px; letter-spacing: 2px;">${code}</h3>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `,
      )
      .setText(`Your verification code is ${code}. It expires in 15 minutes.`);

    try {
      await this.mailerSend.email.send(emailParams);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }
}
