import fs from "fs";
import path from "path";

import { TaskList, SubTask } from "@types";
import { LLMUtil } from "@utils";

// This path actually refers to the relative path for the compiled JS files inside dist/
// Rather than the relative path for the TS files
const tools = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./tools/tools.json"), "utf-8")
);

// Create a string that lists the tools, separated by commas
const toolListString = tools.map((tool: any) => tool.name).join(", ");

export default async function TechLead(
  objective: string,
  taskList: TaskList,
  feedback: string,
  llm: any
): Promise<SubTask[]> {
  const taskListString = taskList
    .map((task) => `Task ${task.taskId}: ${task.taskName}`)
    .join("\n");

  const prompt = `
    You are a senior developer and tech lead. Your job is to lead your team to accomplish the following task:

    ${taskListString}

    You also have the following tools at your disposal:

    ${toolListString}

    Break this task down step by step so your team knows exactly what to do.

    For each step, decide which tools to use and in what order. Use only the tools provided in that tool list.

    Your team will report to you when they have completed a task. Ensure you check their work by including tasks that verify the correctness of their work.

    Respond with your instructions to your team in the following format:
    {reasoning: "Let's think step by step: ", subTasks: [{taskId: 1, taskDescription: "", complete: False, toolsToUse: []}]}

    Remember, toolsToUse must be a subset of the tools provided.

    If the task cannot be accomplished with these tools, then return only steps to create the tools needed. Respond in the requested format.

    If you do not have sufficient tools to create the tools needed, then you are unable to complete the task.

    If you are unable to complete the task, respond with "I am unable to complete the task, for the following reasons: " and list the reasons.

    `;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  console.log(response);

  let newTasks;

  try {
    const parsedResponse = JSON.parse(response);
    if (
      parsedResponse &&
      typeof parsedResponse === "object" &&
      Array.isArray(parsedResponse.subTasks)
    ) {
      newTasks = parsedResponse;
    } else {
      throw new Error();
    }
  } catch (error) {
    newTasks = response.includes("\n") ? response.split("\n") : [response];
  }

  return newTasks;
}
