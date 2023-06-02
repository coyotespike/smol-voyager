import fs from "fs";
import path from "path";

import { TaskList, SubTaskList, SubTask } from "@types";
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
  subTaskList: SubTaskList | null,
  feedback: string,
  llm: any
): Promise<SubTask[]> {
  const taskListString = taskList
    .map((task) => `Task ${task.taskId}: ${task.taskName}`)
    .join("\n");

  const instructionPrompt = `
    You are a senior developer and tech lead. Your job is to guide your team to complete a series of tasks. Here's a breakdown of the tasks:

    ${taskListString}

    Your team has been provided with NodeTS functions (aka tools) to accomplish these tasks:

    ${toolListString}

    IMPORTANT: You can ONLY use the tools listed above or any new tools that you create as part of your tasks. Do not include or use tools that do not exist yet unless you include a task to create them.

    Using existing tools like createFile, you can write code to create new tools that will allow you to accomplish more complex tasks.

    Your job is to plan how to use these existing tools, and when necessary, create new functions or tools, to accomplish each task.

    Break down each task step by step. Think carefully.

    Your team will report to you when they have completed a task. Ensure you check their work by including tasks that verify the correctness of their work.

    Respond with your instructions to your team following this example format:

    [
      {"taskId": 1, "taskDescription": "Create a testing file", "complete": false, "canComplete": true, "toolsToUse": ["createFile"]}
    ]

    If the task cannot be accomplished with existing tools, then include steps to create the tools needed. For example, if you needed to install dependencies, but have no function to perform this:
    [
      {"taskId": 1, "taskDescription": "Write a function to install dependencies", "complete": false, "canComplete": true, "toolsToUse": ["createFile"]},
      {"taskId": 2, "taskDescription": "Use the function to install the dependencies", "complete": false, "canComplete": false, "toolsToUse": ["installDependencies"]}
    ]
    The second task has canComplete: false, because you cannot complete the task until you have completed the first task and created the "installDependencies" function.

    Remember, toolsToUse must be a subset of the tools provided or you've created in previous tasks.`;

  const reflexionPrompt = `
    Here are the tasks you previously produced:

    ${JSON.stringify(subTaskList)}

    You have received the following feedback on this task list: ${feedback}

    Your objective is to improve the task list based on this feedback. Respond with your new task list in the same format as above.`;

  const prompt = feedback.length
    ? instructionPrompt + reflexionPrompt
    : instructionPrompt;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  try {
    const parsedResponse = JSON.parse(response);
    if (Array.isArray(parsedResponse)) {
      return parsedResponse;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(error, response);
    return [];
  }
}
