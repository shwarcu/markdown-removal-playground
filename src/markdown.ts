import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmStrikethrough } from "micromark-extension-gfm-strikethrough";
import { gfmStrikethroughFromMarkdown } from "mdast-util-gfm-strikethrough";
import type { Text, Root, Link, Node, Parent, RootContent, InlineCode, Code } from "mdast";

const enum KnownNodeType {
  root = "root",
  paragraph = "paragraph",
  heading = "heading",
  text = "text",
  emphasis = "emphasis",
  strong = "strong",
  delete = "delete",
  link = "link",
  image = "image",
  inlineCode = "inlineCode",
  code = "code",
  break = "break",
  linkReference = "linkReference",
  imageReference = "imageReference",
  definition = "definition",
  html = "html",
  list = "list",
  listItem = "listItem",
  blockquote = "blockquote",
  thematicBreak = "thematicBreak",
  table = "table",
  tableRow = "tableRow",
  tableCell = "tableCell",
  yaml = "yaml",
  footnoteDefinition = "footnoteDefinition",
  footnoteReference = "footnoteReference",
}

type AstNode = Root | RootContent | null;
type NodeTypeName = keyof typeof KnownNodeType;
type Renderer = (node: AstNode, parent: AstNode, entering: boolean, output: string[]) => void;

const renderers: Record<NodeTypeName, Renderer> = {
  root: renderNoop,
  text: renderText,
  link: renderLink,
  inlineCode: renderInlineCode,
  blockquote: renderBlock,
  list: renderBlock,
  listItem: renderBlock,
  heading: renderHeading,
  code: renderCode,
  paragraph: renderBlock,
  delete: renderStrikethrough,
  emphasis: renderNoop,
  strong: renderNoop,
  image: renderNoop,
  linkReference: renderNoop,
  imageReference: renderNoop,
  definition: renderNoop,
  break: renderNoop,
  html: renderNoop,
  thematicBreak: renderNoop,
  table: renderNoop,
  tableRow: renderNoop,
  tableCell: renderNoop,
  yaml: renderNoop,
  footnoteDefinition: renderNoop,
  footnoteReference: renderNoop,
};

const strikethroughPhrase = "strikethrough: ";
const roundBracketStart = "(";
const roundBracketEnd = ")";
const squareBracketStart = "[";
const squareBracketEnd = "]";
const newline = "\n";

export function renderMarkdownToPlaintext(markdown: string) {
  const tree = fromMarkdown(markdown, {
    extensions: [gfmStrikethrough()],
    mdastExtensions: [gfmStrikethroughFromMarkdown()],
  });
  return renderTree(tree).join("");
}

function renderTree(tree: Root) {
  const output: string[] = [];
  traverse(tree, null, renderNode, output);

  return output;
}

function traverse(node: AstNode, parent: AstNode, nodeRenderer: Renderer, output: string[]) {
  if (!node) {
    return;
  }
  if (node.type !== KnownNodeType.root) {
    nodeRenderer(node as RootContent, parent, true, output);
  }

  if (hasChildren(node)) {
    (node as Parent).children.forEach((child) => {
      traverse(child, node, nodeRenderer, output);
    });
  }

  if (node.type !== KnownNodeType.root) {
    nodeRenderer(node as RootContent, parent, false, output);
  }
}

function renderNode(node: AstNode, parent: AstNode, entering: boolean, output: string[]) {
  if (!node) {
    return;
  }
  const renderer = renderers[node.type];
  if (renderer) {
    renderer(node, parent, entering, output);
  } else {
    console.warn("No renderer for ", node.type);
  }
}

function hasChildren(node: AstNode): boolean {
  if (!node) {
    return false;
  }

  return (node as Parent).children !== undefined && (node as Parent).children.length !== null;
}

function isBlock(node: Node): boolean {
  return (
    node.type === KnownNodeType.root ||
    node.type === KnownNodeType.paragraph ||
    node.type === KnownNodeType.heading ||
    node.type === KnownNodeType.list ||
    node.type === KnownNodeType.listItem ||
    node.type === KnownNodeType.blockquote ||
    node.type === KnownNodeType.code ||
    node.type === KnownNodeType.inlineCode ||
    node.type === KnownNodeType.html ||
    node.type === KnownNodeType.thematicBreak ||
    node.type === KnownNodeType.table ||
    node.type === KnownNodeType.tableRow
  );
}

function isParent(node: AstNode): boolean {
  if (!node) {
    return false;
  }
  return isBlock(node);
}

function hasPrevSibling(node: AstNode, parent: AstNode): boolean {
  if (!parent || !isParent(parent)) {
    return false;
  }
  const index = (parent as Parent).children.indexOf(node as RootContent);
  return index > 0;
}

function hasNextSibling(node: AstNode, parent: AstNode): boolean {
  if (!parent || !isParent(parent)) {
    return false;
  }
  const index = (parent as Parent).children.indexOf(node as RootContent);
  return index < (parent as Parent).children.length - 1;
}

// Blocks

function renderBlock(node: AstNode, parent: AstNode, entering: boolean, out: string[]) {
  const hasPrevSiblingNode = hasPrevSibling(node, parent);
  const hasNextSiblingNode = hasNextSibling(node, parent);
  if ((entering && hasPrevSiblingNode) || (!entering && hasNextSiblingNode)) {
    out.push(newline);
  }
}

function renderHeading(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  return renderBlock(node, parent, entering, out);
}

function renderCode(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  renderBlock(node, parent, entering, out);

  if (entering) {
    out.push((node as Code).value);
  }
}

// Inlines

function renderText(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  if (entering) {
    out.push((node as Text).value);
  }
}

function renderLink(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  if (entering) {
    const l = node as Link;
    out.push(squareBracketStart);
  }

  if (!entering) {
    const l = node as Link;
    out.push(squareBracketEnd);
    out.push(roundBracketStart);
    out.push(l.url);
    out.push(roundBracketEnd);
  }
}

function renderStrikethrough(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  if (entering) {
    out.push(roundBracketStart);
    out.push(strikethroughPhrase);
  } else {
    out.push(roundBracketEnd);
  }
}

function renderInlineCode(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {
  if (entering) {
    out.push((node as InlineCode).value);
  }
}

function renderNoop(node: AstNode, parent: AstNode | null, entering: boolean, out: string[]) {}
