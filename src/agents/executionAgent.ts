import fs from 'fs';
import contextAgent from './contextAgent';
import * as LLMUtil from '../cli/utils/LLMUtil.js';

export default async function executionAgent(
  objective: string,
  task: string,
  vectorStore: any,
  llm: any,
  toolsFile: string,
): Promise<string> {
  const toolsData = fs.readFileSync(toolsFile);
  const tools = JSON.parse(toolsData.toString());

  const context = await contextAgent({
    query: objective,
    topResultsNum: 5,
    vectorStore,
  });

  const prompt = `
    You are an AI who performs one task based on the following objective: ${objective}.
    Take into account these previously completed tasks: ${context}.

    You have the following tools at your disposal: ${JSON.stringify(tools)}

    If you do not have a tool, you can create it using the createTool tool.

    Respond in JSON: { "tool": "tool_name", "args": "args"}

    Your task: ${task}
    Response:
  `;
  return LLMUtil.createCompletion({
    prompt,
    model: llm,
    max_tokens: 2000,
  });
}
