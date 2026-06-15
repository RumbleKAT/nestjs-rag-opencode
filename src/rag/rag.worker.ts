import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Note: This worker runs in a separate thread.
// It performs the HTTP call to the OpenCode SDK.

const baseURL = 'http://192.168.45.248:1234/v1';
const modelName = 'google/gemma-4-12b-qat';

interface WorkerData {
  systemPrompt: string;
  userPrompt: string;
}

export default async function runOpenCodeSDK(data: WorkerData): Promise<string> {
  const { systemPrompt, userPrompt } = data;
  try {
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000, // 2 minutes
      }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`OpenCode SDK Request failed in worker: ${error.message}`);
  }
}
