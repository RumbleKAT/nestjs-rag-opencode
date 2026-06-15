import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { WikiService } from '../wiki/wiki.service';
import { OpenCodeService } from '../opencode/opencode.service';

export const RagState = Annotation.Root({
  query: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  context: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  resultJson: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

@Processor('ragQueue')
@Injectable()
export class RagProcessor extends WorkerHost {
  private readonly logger = new Logger(RagProcessor.name);
  private appGraph: any;

  constructor(
    private readonly wikiService: WikiService,
    private readonly openCodeService: OpenCodeService,
  ) {
    super();
    this.buildGraph();
  }

  private buildGraph() {
    const retrieveNode = async (state: typeof RagState.State) => {
      this.logger.log(`[Retrieve] Querying documents for: ${state.query}`);
      const docs = await this.wikiService.searchSimilarDocuments(state.query);
      const contextStr = docs.map(d => `Source [${d.id}] ${d.title}:\n${d.content}`).join('\n\n');
      return { context: contextStr };
    };

    const generateNode = async (state: typeof RagState.State) => {
      this.logger.log(`[Generate] Generating answer using OpenCode SDK in Worker Pool`);
      const resultJson = await this.openCodeService.runServing(state.query, state.context);
      return { resultJson };
    };

    const workflow = new StateGraph(RagState)
      .addNode('retrieve', retrieveNode)
      .addNode('generate', generateNode)
      .addEdge('__start__', 'retrieve')
      .addEdge('retrieve', 'generate')
      .addEdge('generate', '__end__');

    this.appGraph = workflow.compile();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing RAG job ${job.id}: ${job.data.query}`);

    try {
      const initialState = {
        query: job.data.query,
        context: '',
        resultJson: '',
      };

      const finalState = await this.appGraph.invoke(initialState);
      
      // Parse the JSON. The model is instructed to output STRICT JSON.
      // We might need to sanitize it in case the model adds markdown code block backticks.
      let cleanedJsonStr = finalState.resultJson.trim();
      if (cleanedJsonStr.startsWith('```json')) {
        cleanedJsonStr = cleanedJsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedJsonStr.startsWith('```')) {
        cleanedJsonStr = cleanedJsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanedJsonStr);
      } catch (e) {
        this.logger.warn(`Failed to parse LLM response as JSON. Raw: ${cleanedJsonStr}`);
        parsedResult = {
          answer: cleanedJsonStr,
          citations: [],
          sources: []
        };
      }

      return parsedResult;
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}`, error.stack);
      throw error;
    }
  }
}
