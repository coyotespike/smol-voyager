import runTool from "@tools";
import { SoloDeveloper } from "@agents";

export default async function SoloDevLoop(
  objective: string,
  vectorStore: any,
  llm: any
) {
  let { taskComplete, actions } = await SoloDeveloper(
    objective,
    null,
    vectorStore,
    llm
  );

  while (!taskComplete) {
    let previousAttempt = [];
    for (let action of actions) {
      let tool = action.toolToUse;
      let { success, result } = await runTool(tool.name, tool.arguments);
      previousAttempt.push({ action, result, success });
    }
    console.log("previousAttempt", previousAttempt);
    const newResult = await SoloDeveloper(
      objective,
      previousAttempt,
      vectorStore,
      llm
    );

    taskComplete = newResult.taskComplete;
    actions = newResult.actions;
  }

  return actions;
}
