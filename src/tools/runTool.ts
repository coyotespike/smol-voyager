import path from "path";

async function runTool(toolName: string, args: any) {
  try {
    // Dynamically import the tool's module
    // Written to work with compiled JS in dist/
    const modulePath = path.join(__dirname, `./tools/${toolName}.js`);
    const toolModule = await import(modulePath);

    // Transform the args array into an object
    const argsObject = args.reduce((obj: any, arg: any) => {
      obj[arg.name] = arg.value;
      return obj;
    }, {});

    console.log(`Running tool "${toolName}" with args:`, argsObject);

    // Call the tool's function with the transformed arguments
    const result = await toolModule[toolName](argsObject);

    // Return the result
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to run tool "${toolName}": ${error}`);
    return { success: false, result: error, error: true };
  }
}

export default runTool;
