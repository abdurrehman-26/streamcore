import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  createUser(name: string, email: string, passwordHash: string) {
    return this.userModel.create({ name, email, passwordHash });
  }
  async markEmailAsVerified(email: string): Promise<void> {
    await this.userModel.updateOne(
      { email },
      { $set: { emailVerified: true } },
    );
  }
}
