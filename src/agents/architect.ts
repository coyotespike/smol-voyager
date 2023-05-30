import { Task } from "@types";
import * as LLMUtil from "../cli/utils/LLMUtil";

export default async function Architect(
  objective: string,
  taskList: Task[],
  feedback: string,
  llm: any
): Promise<Task[]> {
  let taskId = 1;
  const taskListString = taskList
    .map((task) => `Task ${task.taskId}: ${task.taskName}`)
    .join(", ");
  console.log(taskListString);

  const prompt = `
    You are an expert software architect and senior developer. Your job is to create detailed tasks to achieve the following objective: ${objective}.

    You should create tasks that are as detailed and minimal as possible, with a TDD approach.

    If you are given a task list and feedback below, you should incorporate the feedback and update the task list accordingly.

    If you are given no task list, you should create a task list from scratch.

    The task list, if any, is as follows:
    ${taskListString}

    Feedback on the task list, if any, is as follows:
    ${feedback}

    Return the new tasks or updated tasks as an array: ["Task 1: ", "Task 2: "].
    `;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  let newTasks: string[];

  // Check if response is a stringified JSON array
  try {
    const parsedResponse = JSON.parse(response);
    if (Array.isArray(parsedResponse)) {
      newTasks = parsedResponse;
    } else {
      throw new Error();
    }
  } catch (error) {
    // If response is not a stringified JSON array, split it into lines
    newTasks = response.includes("\n") ? response.split("\n") : [response];
  }

  return newTasks.map((taskName) => ({ taskId: taskId++, taskName }));
}
