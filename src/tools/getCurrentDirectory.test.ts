import { getCurrentDirectory } from "./getCurrentDirectory";

describe("getCurrentDirectory", () => {
  it("should return the current working directory", async () => {
    const currentDirectory = process.cwd();
    const result = await getCurrentDirectory();
    expect(result).toEqual(currentDirectory);
  });
});
