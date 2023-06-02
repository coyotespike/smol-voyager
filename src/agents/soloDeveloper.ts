import fs from "fs";
import path from "path";
import chalk from "chalk";

import contextAgent from "./contextAgent";

import { LLMUtil } from "@utils";
import { Action, PreviousAttempt } from "@types";

export default async function SoloDeveloper(
  objective: string,
  previousAttempt: PreviousAttempt[] | null,
  vectorStore: any,
  llm: any
): Promise<{ taskComplete: boolean; actions: Action[] }> {
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

  const identityAndContextPrompt = `
    You are a senior developer. Your objective is to ${objective}.

    Take into account these previously completed tasks, if any: ${context}.`;

  const reflexionPrompt = `
   To solve this task, you previously attempted to ${previousAttempt}.

   What went wrong? What went right? What did you learn? Take this into account when solving this task. Include a key in your response called "reflexion", whose value is a string describing your reflexion.`;

  const toolsPrompt = `
    You have the following tools (node TypeScript functions to call) at your disposal: ${tools}.

    Each time you use a tool, you should check that the action you performed was successful. Take another action to check, then report whether the action was successful.

    If the task cannot be completed with the tools available, based on their names and descriptions, then respond like this:

    {"taskComplete": false, actions: [{ "toolToUse": <tool json object with arguments>, "task": "Write a test file", "thought": "In order to write in a test file, I must create a tool that can write to a file, named 'writeFile', with arguments 'fileName' and 'content'"}]}

    If you have tools sufficient to complete the task, respond like this:

    {"taskComplete": false, actions: [{ "toolToUse": <tool json object with arguments>, "task": "Write a test file", "thought": "I need to create a test file and write a test in it"}]}

    If the task is now complete, respond with a JSON object containing your previous actions and the taskComplete flag set to true.

    Remember, toolToUse must be a subset of the tools provided or tools you have just created.

    Respond only in valid JSON.`;

  const prompt = previousAttempt
    ? identityAndContextPrompt + reflexionPrompt + toolsPrompt
    : identityAndContextPrompt + toolsPrompt;

  const response = await LLMUtil.createCompletion({
    prompt,
    model: llm,
    max_tokens: 2000,
  });

  console.log(chalk.bold(chalk.magenta("\n*****RESPONSE*****\n")));
  console.log(response);

  const actions = JSON.parse(response);
  return actions;
}
