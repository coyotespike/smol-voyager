import { hello as utilsHello } from "@utils";
import { hello as agentsHello } from "@agents";
console.log(utilsHello, agentsHello);

import fs from "node:fs/promises";
import { Command } from "commander";
import { spinnerError, stopSpinner } from "./cli/spinner.js";
import { init } from "./cli/commands/init/index.js";
// import { run } from "./cli/commands/run/index.js";
import { BabyAGIConfig } from "@types";

const program = new Command();
program.description("BabyAGI CLI Tool");
program.version("0.0.3");

program
  .command("init")
  .description(
    "Initialize project by creating a `babyagi.config.json` file in the current directory."
  )
  .action(async () => {
    try {
      const config: BabyAGIConfig = JSON.parse(
        await fs.readFile("./babyagi.config.json", "utf8")
      );
      init(config);
    } catch (e) {
      init();
    }
  });
