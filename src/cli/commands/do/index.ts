import path from "node:path";
import fs from "node:fs";
import inquirer from "inquirer";
import chalk from "chalk";

import { BabyAGIConfig } from "@types";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { HNSWLib } from "@langchain/hnswlib";

import { SoloDevLoop } from "@utils";

export const soloDev = async ({
  objective,
  initialTask,
  llm,
  root,
}: BabyAGIConfig) => {
  console.log(root);
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

  console.log(chalk.bold(chalk.magenta("\n*****OBJECTIVE*****\n")));
  console.log(objective);
  let userSaysComplete = false;

  let taskId = 0;
  while (!userSaysComplete) {
    // Step 1: Send to execution function to complete the task based on the context
    const result = await SoloDevLoop(objective, vectorStore, llm);

    console.log(chalk.bold(chalk.magenta("\n*****TASK RESULT*****\n")));
    console.log(result);

    // Step 2: Enrich result and store in Vector Store
    const enriched_result = { data: JSON.stringify(result) };
    const result_id = `result_${taskId++}`;
    await vectorStore.addDocuments([
      {
        pageContent: enriched_result.data,
        metadata: { result_id, task: objective },
      },
    ]);
    await vectorStore.save(vectorStorePath);

    // Step 3: Check if the task is complete
    const { confirmation } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmation",
        message:
          "Do you have more tasks to complete? (If not, we will start the next iteration)",
        default: false,
      },
    ]);

    let userSaysComplete = confirmation;
    if (!userSaysComplete) {
      const { feedback } = await inquirer.prompt([
        {
          type: "input",
          name: "objective",
          message: "Provide a new task",
        },
      ]);
      objective = feedback;
    }
  }
};

export default {
  soloDev,
};
