import { Task } from "@types";
import runTool from "@tools";
import { Developer } from "@agents";

export default async function LoopUntilComplete<T = Task, R = Task>(
  objective: string,
  task: string,
  vectorStore: any,
  llm: any
) {
  let { taskComplete, actions } = await Developer(
    objective,
    task,
    null,
    vectorStore,
    llm
  );

  while (!taskComplete) {
    let previousAttempt = [];
    for (let action of actions) {
      let tool = action.toolToUse;
      let result = await runTool(tool.name, tool.arguments);
      previousAttempt.push({ action, result });
    }
    const newResult = await Developer(
      objective,
      task,
      previousAttempt,
      vectorStore,
      llm
    );

    taskComplete = newResult.taskComplete;
    actions = newResult.actions;
  }

  return actions;
}
