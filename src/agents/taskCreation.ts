import { Task } from '@/types';
import * as LLMUtil from '../cli/utils/LLMUtil.js';

export default async function taskCreationAgent(
  objective: string,
  result: { data: string },
  task_description: string,
  taskList: string[],
  llm: any,
): Promise<Task[]> {
  let taskId = 1;
  const prompt = `
    You are a task creation AI that uses the result of an execution agent to create new tasks with the following objective: ${objective},
    The last completed task has the result: ${result}.
    This result was based on this task description: ${task_description}. These are incomplete tasks: ${taskList.join(
    ', ',
  )}.
    Based on the result, create new tasks to be completed by the AI system that do not overlap with incomplete tasks.
    Return the tasks as an array.`;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  const newTasks: string[] = response.includes('\n') ? response.split('\n') : [response];

  return newTasks.map((taskName) => ({ taskId: taskId++, taskName }));
}
