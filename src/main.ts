import { getTestFileContent } from './utils';
import { renderMarkdownToPlaintext } from './markdown';

const markdown = getTestFileContent('image.md');
const result = renderMarkdownToPlaintext(markdown);
console.log('=============== Result ===============');
console.log(result);
