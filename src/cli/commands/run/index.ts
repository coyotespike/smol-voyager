import path from "node:path";
import fs from "node:fs";
import chalk from "chalk";

import { BabyAGIConfig, Task, SubTask } from "@types";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { HNSWLib } from "@langchain/hnswlib";
import { askUntilYes } from "@utils";

import {
  Architect,
  TechLead,
  executionAgent,
  prioritizationAgent,
  taskCreationAgent,
} from "@agents";

export const run = async ({
  objective,
  initialTask,
  llm,
  root,
}: BabyAGIConfig) => {
  const vectorStorePath = path.join(root, "data");
  const vectorStoreExists = fs.existsSync(
    path.join(vectorStorePath, "args.json")
  );
  const vectorStore = await (async () => {
    if (vectorStoreExists) {
      return await HNSWLib.load(vectorStorePath, new OpenAIEmbeddings());
    }

    const store = await HNSWLib.fromDocuments(
      [{ pageContent: "text", metadata: { test: true } }],
      new OpenAIEmbeddings()
    );

    await store.save(vectorStorePath);
    return store;
  })();

  let taskList: Task[] = await askUntilYes<Task, Task>(
    Architect,
    objective,
    [],
    "",
    llm
  );
  console.log(
    `${chalk.bold(chalk.magenta("Architect completed high-level planning"))}`
  );

  let subtaskList: SubTask[] = await askUntilYes<Task, SubTask>(
    TechLead,
    objective,
    taskList,
    "",
    llm
  );

  console.log(chalk.bold(chalk.magenta("\n*****OBJECTIVE*****\n")));
  console.log(objective);
  console.log(`${chalk.bold(chalk.magenta("\nInitial Task:"))} ${initialTask}`);

  while (true) {
    if (taskList.length > 0) {
      // Print the task list
      console.log(chalk.bold(chalk.magenta("\n*****TASK LIST*****\n")));
      for (const t of taskList) {
        console.log(`${t.taskId}: ${t.taskName}`);
      }

      // Step 1: Pull the first task
      const task = taskList.shift();
      if (!task) {
        throw new Error("Task is undefined");
      }

      console.log(chalk.bold(chalk.greenBright("\n*****NEXT TASK*****\n")));
      console.log(`${task.taskId}: ${task.taskName}`);

      // Send to execution function to complete the task based on the context
      const result = await executionAgent(
        objective,
        task.taskName,
        vectorStore,
        llm,
        "../tools/tools.json"
      );

      const thisTaskId = task.taskId;
      console.log(chalk.bold(chalk.magenta("\n*****TASK RESULT*****\n")));
      console.log(result);

      // Step 2: Enrich result and store in Vector Store
      const enriched_result = { data: result };
      const result_id = `result_${task.taskId}`;
      await vectorStore.addDocuments([
        {
          pageContent: enriched_result.data,
          metadata: { result_id, task: task.taskName, result },
        },
      ]);
      await vectorStore.save(vectorStorePath);

      // Step 3: Create new tasks and reprioritize task list
      const newTasks = await taskCreationAgent(
        objective,
        enriched_result,
        task.taskName,
        taskList.map((t) => t.taskName),
        llm
      );

      for (const newTask of newTasks) {
        taskList.push(newTask);
      }
      taskList = await prioritizationAgent(
        thisTaskId,
        taskList,
        objective,
        llm
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
  }
};

export default {
  run,
};
