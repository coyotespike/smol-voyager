import { promisify } from "util";

// Convert the synchronous process.cwd() function into a Promise-based function
export const getCurrentDirectory = promisify((callback) => {
  const currentDirectory = process.cwd();
  callback(null, currentDirectory);
});
