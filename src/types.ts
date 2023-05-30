export type BabyAGIConfig = {
  name: string;
  objective: string;
  initialTask: string;
  llm: LLMModels;
  root: string;
};

export enum LLMModels {
  GPT3 = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
  GPT432k = "gpt-4-32k",
}

export type LLMModelDetails = {
  name: LLMModels;
  inputCostPer1KTokens: number;
  outputCostPer1KTokens: number;
  maxLength: number;
};

export type Task = {
  taskId: number;
  taskName: string;
};

export type SubTask = {
  taskId: number;
  taskDescription: string;
  completed: boolean;
  toolsToUse: string[];
};

export type TaskList = Task[] | [];

export type AgentFunction<T = Task, R = Task> = (
  objective: string,
  taskList: TaskList,
  feedback: string,
  llm: any
) => Promise<R[]>;
