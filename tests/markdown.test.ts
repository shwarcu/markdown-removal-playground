import { describe, expect, it, test } from 'vitest';

import { renderMarkdownToPlaintext } from '../src/markdown';
import { getTestFileContent } from '../src/utils';

const testFiles = [
  {
    markdown: 'bold-and-italic.md',
    text: 'bold-and-italic.txt',
  },
  {
    markdown: 'code-block.md',
    text: 'code-block.txt',
  },
  {
    markdown: 'empty.md',
    text: 'empty.txt',
  },
  {
    markdown: 'link.md',
    text: 'link.txt',
  },
  {
    markdown: 'with-html.md',
    text: 'with-html.txt',
  },
  {
    markdown: 'bold-and-italic.md',
    text: 'bold-and-italic.txt',
  },
  {
    markdown: 'code.md',
    text: 'code.txt',
  },
  {
    markdown: 'link.md',
    text: 'link.txt',
  },
  {
    markdown: 'list.md',
    text: 'list.txt',
  },
  {
    markdown: 'strikethrough.md',
    text: 'strikethrough.txt',
  },
  {
    markdown: 'image.md',
    text: 'image.txt',
  },
];

for (const file of testFiles) {
  it(`handles ${file.markdown}`, () => {
    const markdown = getTestFileContent(file.markdown);
    const text = getTestFileContent(file.text);

    expect(renderMarkdownToPlaintext(markdown)).toBe(text);
  });
}
