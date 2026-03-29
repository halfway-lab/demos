import { OutlineNode } from '../types';

function nodeToMarkdown(node: OutlineNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  const heading = '#'.repeat(Math.min(node.level + 1, 6));
  let markdown = `${indent}${heading} ${node.title}\n`;
  
  if (node.content) {
    markdown += `${indent}${node.content}\n`;
  }
  
  markdown += '\n';
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      markdown += nodeToMarkdown(child, depth + 1);
    }
  }
  
  return markdown;
}

export function exportToMarkdown(rootNode: OutlineNode): string {
  return nodeToMarkdown(rootNode);
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
