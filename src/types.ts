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
  canComplete: boolean;
  toolsToUse: string[];
};

export type TaskList = Task[] | [];
export type SubTaskList = SubTask[] | [];

export type AgentFunction<T = Task, R = Task> = (
  objective: string,
  taskList: TaskList,
  feedback: string,
  llm: any,
  subTaskList?: SubTaskList | null
) => Promise<R[]>;

type Argument = {
  required: boolean;
  name: string;
  value: string;
};
export type Tool = {
  name: string;
  description: string;
  arguments: Argument[];
};

export type Action = {
  toolToUse: Tool;
  task: string;
  thought: string;
};

export type PreviousAttempt = {
  action: Action;
  result: any;
};
