import { Task } from '@/types';
import * as LLMUtil from '../cli/utils/LLMUtil';

export default async function Architect(objective: string, taskList: string[], llm: any): Promise<Task[]> {
  let taskId = 1;
  const prompt = `
    You are an expert software architect and senior developer. Your job is to create detailed tasks to achieve the following objective: ${objective}.

    You should create tasks that are as detailed and minimal as possible, with a TDD approach.

    If the task list below already has tasks you created, you should ask for feedback on the tasks you created and incorporate the feedback into your tasks.

    When the task list is approved, you should send it to the tech lead for implementation.

    The task list is as follows:
    ${taskList.join(', ')}

    Return the tasks as an array.
    `;

  const response = await LLMUtil.createCompletion({
    model: llm,
    prompt,
  });

  const newTasks: string[] = response.includes('\n') ? response.split('\n') : [response];

  return newTasks.map((taskName) => ({ taskId: taskId++, taskName }));
}
