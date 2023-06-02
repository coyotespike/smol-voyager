import fs from "fs";
import path from "path";

import contextAgent from "./contextAgent";

import { LLMUtil } from "@utils";
import { Action, PreviousAttempt, SubTask } from "@types";

export default async function Developer(
  objective: string,
  task: SubTask,
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

  console.log("context", context);

  const identityAndContextPrompt = `
    You are a senior developer. Your team's objective is to ${objective}.

    Take into account these previously completed tasks, if any: ${context}.

    Your task: ${task}.`;

  const reflexionPrompt = `
   To solve this task, you previously attempted to ${JSON.stringify(
     previousAttempt
   )}.

   What went wrong? What went right? What did you learn? Take this into account when solving this task.`;

  const toolsPrompt = `
    You have the following tools (node TypeScript functions to call) at your disposal: ${tools}.

    Each time you use a tool, you should check that the action you performed was successful. Take another action to check, then report whether the action was successful.

    You may create any tools necessary to help you check the success of your actions, as well. Remember you can only use the tools you have available to you.

    Example response: {taskComplete: False, actions: [{ "toolToUse": <tool json object with arguments>, "task": "Write a test file", "thought": "I need to create a test file and write a test in it"}]}

    Remember, toolToUse must be a subset of the tools provided or tools you have just created.

    If the task is now complete, respond with a JSON object containing your previous actions and the taskComplete flag set to True.

    Respond only in JSON.`;

  const prompt = previousAttempt
    ? identityAndContextPrompt + reflexionPrompt + toolsPrompt
    : identityAndContextPrompt + toolsPrompt;

  const response = await LLMUtil.createCompletion({
    prompt,
    model: llm,
    max_tokens: 2000,
  });

  console.log("response", response);

  const actions = JSON.parse(response);
  return actions;
}
