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
    You are a senior developer and tech lead. Your job is to guide your team to complete a series of tasks. Here's a breakdown of the tasks:

    ${taskListString}

    Your team has been provided with certain pre-built functions or tools to accomplish these tasks:

    ${toolListString}

    Your job is to plan how to use these existing tools, and when necessary, create new functions or tools, to accomplish each task.

    Break down each task step by step, clearly identifying:

    What the task is and its description.
    Whether the task can be completed with the current tools.
    If not, what new functions or tools need to be created.
    Which tools are to be used for each task.
    For each step, decide which tools to use and in what order. Use only the tools provided in that tool list or the ones you've created.

    Your team will report to you when they have completed a task. Ensure you check their work by including tasks that verify the correctness of their work.

    Respond with your instructions to your team following this example format:

    [{taskId: 1, taskDescription: "Create a testing file", complete: false, canComplete: true, toolsToUse: ["createFile"]}]

    Remember, toolsToUse must be a subset of the tools provided or the tools you've decided to create.

    If the task cannot be accomplished with these tools, then include steps to create the tools needed. For example, if you needed to install dependencies, but have no function to perform this:

    [{taskId: 1, taskDescription: "Write a function to install dependencies", complete: false, canComplete: true, toolsToUse: ["createFile"]}, {taskId: 2, taskDescription: "Use the function to install the dependencies", complete: false, canComplete: false, toolsToUse: ["installDependencies"]}]
    The second task has canComplete: false, because you cannot complete the task until you have completed the first task and created the "installDependencies" function.
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
