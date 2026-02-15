import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RequireBodyPipe implements PipeTransform {
  transform(value: unknown) {
    if (!value || Object.keys(value).length === 0) {
      throw new BadRequestException('Request body cannot be empty');
    }
    return value;
  }
}
