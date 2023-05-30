import chalk from "chalk";
import inquirer from "inquirer";
import fs from "node:fs";
import path from "node:path";
import { BabyAGIConfig, LLMModels } from "@types";

export const makeConfigTemplate = (config?: BabyAGIConfig): BabyAGIConfig => {
  return {
    name: config?.name ?? "",
    objective: config?.objective ?? "",
    initialTask: config?.initialTask ?? "",
    llm: LLMModels.GPT4,
    root: "./",
  };
};

export const init = async (config: BabyAGIConfig = makeConfigTemplate()) => {
  const configPath = path.join(config.root, "babyagi.config.json");

  if (fs.existsSync(configPath)) {
    const questions = [
      {
        type: "confirm",
        name: "continue",
        message:
          "A babyagi.config.json file already exists in this location. The existing configuration will be overwritten. Do you want to continue? ",
        default: false,
      },
    ];

    const answers = await inquirer.prompt(questions);
    if (!answers.continue) {
      process.exit(0);
    }
  }

  const questions = [
    {
      type: "input",
      name: "name",
      message: chalk.yellow(`Enter the name of your agent:`),
      default: config.name,
    },
    {
      type: "input",
      name: "objective",
      message: chalk.yellow(`Enter your agent's objective:`),
      default: config.objective,
    },
  ];

  const { name, objective, initialTask, llm } = await inquirer.prompt(
    questions
  );

  const newConfig = makeConfigTemplate({
    ...config,
    name,
    objective,
    initialTask,
    llm,
  });

  fs.writeFileSync(
    path.join(newConfig.root, "babyagi.config.json"),
    JSON.stringify(newConfig, null, 2),
    "utf-8"
  );

  console.log(
    chalk.green(
      "smol-voyager initialized. Run `smol-voyager start` to start the agent."
    )
  );
};
