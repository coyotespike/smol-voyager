import inquirer from "inquirer";

import { AgentFunction, Task } from "@types";

export default async function askUntilYes(
  agentFunction: AgentFunction,
  objective: string,
  initialTaskList: Task[] | [],
  initialFeedback: string,
  llm: any
) {
  let shouldContinue = true;
  let taskList = await agentFunction(
    objective,
    initialTaskList,
    initialFeedback,
    llm
  );

  while (shouldContinue) {
    console.log(taskList);
    const { confirmation } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmation",
        message:
          "Does this plan look good? Type y to continue, n to provide feedback.",
        default: false,
      },
    ]);

    shouldContinue = !confirmation;
    if (shouldContinue) {
      // Your logic when the user wants to continue
      const { feedback } = await inquirer.prompt([
        {
          type: "input",
          name: "feedback",
          message: "Provide your feedback:",
        },
      ]);

      // Call your Agent function
      taskList = await agentFunction(objective, taskList, feedback, llm);
    }
  }

  console.log("Loop ended.");
  return taskList;
}
export type Task = {
  taskId: number;
  taskName: string;
};
