import fs from "fs";

export function writeFile(args: {
  fileName: string;
  location: string;
  content: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${args.location}/${args.fileName}`, args.content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`File ${args.fileName} written at ${args.location}`);
      }
    });
  });
}
