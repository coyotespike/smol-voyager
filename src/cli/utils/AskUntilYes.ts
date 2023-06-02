import inquirer from "inquirer";

import { SubTaskList, TaskList } from "@types";
import { Architect, TechLead } from "@agents";

export async function loopArchitect(
  objective: string,
  initialTaskList: TaskList,
  initialFeedback: string,
  llm: any
) {
  let shouldContinue = true;
  let taskList = await Architect(
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
      taskList = await Architect(objective, taskList, feedback, llm);
    }
  }

  return taskList;
}
export async function loopTechLead(
  objective: string,
  initialTaskList: TaskList,
  llm: any
): Promise<SubTaskList> {
  let shouldContinue = true;
  let taskList = await TechLead(objective, initialTaskList, null, "", llm);

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
      taskList = await TechLead(
        objective,
        initialTaskList,
        taskList,
        feedback,
        llm
      );
    }
  }

  return taskList;
}
