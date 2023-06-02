import path from "path";

async function runTool(toolName: string, args: any) {
  try {
    // Dynamically import the tool's module
    const toolModule = await import(
      path.join(__dirname, `./tools/${toolName}`)
    );

    // Call the tool's function with the provided arguments
    const result = await toolModule[toolName](args);

    // Return the result
    return result;
  } catch (error) {
    console.error(`Failed to run tool "${toolName}": ${error}`);
    throw error;
  }
}

export default runTool;
