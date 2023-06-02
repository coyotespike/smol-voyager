import fs from "fs";

export function readFile(args: {
  fileName: string;
  location: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(`${args.location}/${args.fileName}`, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
