import path from "node:path";
import fs from "node:fs";
import chalk from "chalk";

import { BabyAGIConfig, Task, SubTask } from "@types";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { HNSWLib } from "@langchain/hnswlib";
import { loopArchitect, loopTechLead } from "@utils";

import LoopUntilComplete from "src/cli/utils/LoopUntilComplete";

// TODO initialTask is no longer used
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

  let taskList: Task[] = await loopArchitect(objective, [], "", llm);
  console.log(
    `${chalk.bold(chalk.magenta("Architect completed high-level planning"))}`
  );

  let subtaskList: SubTask[] = await loopTechLead(objective, taskList, llm);

  console.log(chalk.bold(chalk.magenta("\n*****OBJECTIVE*****\n")));
  console.log(objective);
  console.log(`${chalk.bold(chalk.magenta("\nInitial Task:"))} ${initialTask}`);

  while (subtaskList.length) {
    // Print the task list
    console.log(chalk.bold(chalk.magenta("\n*****TASK LIST*****\n")));
    for (const t of subtaskList) {
      console.log(`${t.taskId}: ${t.taskDescription}`);
    }

    // Step 1: Pull the first task
    const task = subtaskList.shift();
    if (!task) {
      throw new Error("Task is undefined");
    }

    console.log(chalk.bold(chalk.greenBright("\n*****NEXT TASK*****\n")));
    console.log(`${task.taskId}: ${task.taskDescription}`);

    // Send to execution function to complete the task based on the context
    const result = await LoopUntilComplete(objective, task, vectorStore, llm);

    console.log(chalk.bold(chalk.magenta("\n*****TASK RESULT*****\n")));
    console.log(result);

    // Step 2: Enrich result and store in Vector Store
    const enriched_result = { data: result };
    const result_id = `result_${task.taskId}`;
    await vectorStore.addDocuments([
      {
        pageContent: enriched_result.data,
        metadata: { result_id, task: task.taskDescription, result },
      },
    ]);
    await vectorStore.save(vectorStorePath);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
  }
};

export default {
  run,
};
