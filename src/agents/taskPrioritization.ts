import { Task } from '@/types';
import * as LLMUtil from '../cli/utils/LLMUtil.js';

export default async function prioritizationAgent(thisTaskId: number, taskList: Task[], objective: string, llm: any) {
  const taskNames = taskList.map((t) => t.taskName);
  const next_taskId = thisTaskId + 1;
  const prompt = `
    You are a task prioritization AI tasked with cleaning the formatting of and reprioritizing the following tasks: ${taskNames}.
    Consider the ultimate objective of your team:${objective}.
    Do not remove any tasks. Return the result as a numbered list, like:
    #. First task
    #. Second task
    Start the task list with number ${next_taskId}.`;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  const newTasks = response.includes('\n') ? response.split('\n') : [response];
  const newTaskList = [];
  for (const task_string of newTasks) {
    const [id, name] = task_string.trim().split('.', 2);
    const taskId = parseInt(id.trim());
    const taskName = name.trim();
    newTaskList.push({ taskId, taskName });
  }
  return newTaskList;
}
