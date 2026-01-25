import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);

  runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(`Running FFmpeg: ffmpeg ${args.join(' ')}`);

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.stdout.on('data', (data) => {
        this.logger.debug(data);
      });

      ffmpeg.stderr.on('data', (data) => {
        // FFmpeg logs progress in stderr
        this.logger.debug(data);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  }

  async transcodeToHLS(
    inputPath: string,
    outputFolder: string,
    resolution: string,
  ) {
    const args = [
      '-i',
      inputPath,
      '-profile:v',
      'baseline',
      '-level',
      '3.0',
      '-s',
      resolution,
      '-start_number',
      '0',
      '-hls_time',
      '10',
      '-hls_list_size',
      '0',
      '-f',
      'hls',
      `${join(outputFolder, 'index.m3u8')}`,
    ];

    await this.runFFmpeg(args);
  }

  async generateThumbnail(inputPath: string, outputPath: string) {
    const args = [
      '-i',
      inputPath,
      '-ss',
      '00:00:02',
      '-vframes',
      '1',
      outputPath,
    ];

    await this.runFFmpeg(args);
  }
}
