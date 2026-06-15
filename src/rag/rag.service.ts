import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectQueue('ragQueue') private readonly ragQueue: Queue,
  ) {}

  async askAsync(query: string): Promise<string> {
    const job = await this.ragQueue.add('ask', { query });
    return job.id as string;
  }

  async askSync(query: string): Promise<any> {
    const job = await this.ragQueue.add('ask', { query });
    this.logger.log(`Waiting for Job ID: ${job.id}`);
    
    // Use wait-until mechanism. Since bullmq doesn't have a direct awaiter,
    // we poll the job status or we could use Redis pub/sub. Polling for simplicity here.
    const result = await this.waitForJob(job.id as string);
    return result;
  }

  async getJobResult(jobId: string): Promise<any> {
    const job = await this.ragQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    if (state === 'completed') {
      return { status: 'completed', result: job.returnvalue };
    } else if (state === 'failed') {
      return { status: 'failed', error: job.failedReason };
    } else {
      return { status: state };
    }
  }

  private async waitForJob(jobId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const job = await this.ragQueue.getJob(jobId);
        if (!job) return;

        const state = await job.getState();
        if (state === 'completed') {
          clearInterval(interval);
          resolve(job.returnvalue);
        } else if (state === 'failed') {
          clearInterval(interval);
          reject(new Error(job.failedReason));
        }
      }, 500); // Check every 500ms
    });
  }
}
