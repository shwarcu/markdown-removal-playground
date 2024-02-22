import fs from 'node:fs';

export function getTestFileContent(filePath: string) {
  return fs.readFileSync(`./tests/${filePath}`, 'utf-8');
}
