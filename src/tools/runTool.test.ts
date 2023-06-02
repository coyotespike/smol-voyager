import runTool from "./runTool";
import fs from "fs";
import path from "path";

describe("runTool", () => {
  it("should run the createFile tool and return a success message", async () => {
    // Arrange
    const toolName = "createFile";
    const args = {
      fileName: "testFile.txt",
      location: "./",
    };
    const expectedMessage = `File ${args.fileName} created at ${args.location}`;

    // Act
    const result = await runTool(toolName, args);

    // Assert
    expect(result).toEqual(expectedMessage);

    // Cleanup
    fs.unlinkSync(path.join(args.location, args.fileName));
  });
});
