import fs from 'fs';

export function createFile(args: {
  fileName: string;
  location: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${args.location}/${args.fileName}`, '', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`File ${args.fileName} created at ${args.location}`);
      }
    });
  });
}
