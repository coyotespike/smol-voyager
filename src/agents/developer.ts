import fs from "fs";
import path from "path";

import contextAgent from "./contextAgent";

import { LLMUtil } from "@utils";

import runTool from "@tools";

export default async function Developer(
  objective: string,
  task: string,
  vectorStore: any,
  llm: any
): Promise<string> {
  // This path actually refers to the relative path for the compiled JS files inside dist/
  // Rather than the relative path for the TS files
  const tools = fs.readFileSync(
    path.join(__dirname, "./tools/tools.json"),
    "utf-8"
  );

  const context = await contextAgent({
    query: objective,
    topResultsNum: 5,
    vectorStore,
  });

  console.log("context", context);

  const prompt = `
    You are a senior developer. Your team's objective is to ${objective}.

    Take into account these previously completed tasks: ${context}.

    You have the following tools (node TypeScript functions to call) at your disposal: ${tools}.

    If you do not have a tool, you can create it using the createTool tool.

    Each time you use a tool, you should check that the action you performed was successful. Take another action to check, then report whether the action was successful.

    You may create any tools necessary to help you check the success of your actions, as well.

    Your task: ${task}

    Respond in JSON: { "tool": "tool_name", "args": "args"}

    Response:
  `;
  return LLMUtil.createCompletion({
    prompt,
    model: llm,
    max_tokens: 2000,
  });
}
