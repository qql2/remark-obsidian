import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Node } from "unist";

export interface EmbedNode extends Node {
  type: "obsidianEmbed";
  value: string;
  data?: {
    embedType: "wikilink" | "image";
    target?: string;
    alt?: string;
  };
}

/**
 * Remark plugin to parse Obsidian embedding formats:
 * - ![[filename]] - Wikilink embedding (parsed from text nodes)
 * - ![[link|altname]] - Wikilink embedding with alt text
 * - ![alt](url) - Image embedding (converted from image nodes)
 */
export const remarkObsidian: Plugin = function () {
  return (tree: Node) => {
    // Convert image nodes to embed nodes (![alt](url) format)
    visit(tree, "image", (node: any, index: number | null, parent: any) => {
      if (!parent || index === null) return;

      const embedNode: EmbedNode = {
        type: "obsidianEmbed",
        value: node.alt ? `![${node.alt}](${node.url})` : `![](${node.url})`,
        data: {
          embedType: "image",
          target: node.url,
          alt: node.alt,
        },
        position: node.position,
      };

      parent.children[index] = embedNode;
    });

    // Then, parse ![[filename]] format from text nodes
    visit(tree, "text", (node: any, index: number | null, parent: any) => {
      if (!parent || index === null) return;

      const text = node.value as string;

      // Match ![[filename]] format
      const wikilinkRegex = /!\[\[([^\]]+)\]\]/g;
      const matches: Array<{
        match: RegExpMatchArray;
        start: number;
        end: number;
      }> = [];

      let match;
      while ((match = wikilinkRegex.exec(text)) !== null) {
        matches.push({
          match,
          start: match.index,
          end: match.index + match[0].length,
        });
      }

      if (matches.length === 0) return;

      // Sort matches by start position (descending) to replace from end to start
      matches.sort((a, b) => b.start - a.start);

      // Replace matches with embed nodes
      const nodes: any[] = [];
      let lastIndex = text.length;
      const textPosition = node.position;

      // Helper function to calculate position from offset within text node
      const calculatePosition = (
        basePosition: any,
        offset: number
      ): { line: number; column: number; offset: number } => {
        if (!basePosition || !basePosition.start) {
          return { line: 1, column: 1, offset: 0 };
        }

        const baseOffset = basePosition.start.offset || 0;
        const baseLine = basePosition.start.line || 1;
        const baseColumn = basePosition.start.column || 1;

        // Count newlines before this offset within the text content
        const textBeforeOffset = text.slice(0, offset);
        const newlineCount = (textBeforeOffset.match(/\n/g) || []).length;
        const lastNewlineIndex = textBeforeOffset.lastIndexOf("\n");

        const line = baseLine + newlineCount;
        const column =
          lastNewlineIndex === -1
            ? baseColumn + offset
            : offset - lastNewlineIndex;

        return {
          line,
          column,
          offset: baseOffset + offset,
        };
      };

      for (const { match, start, end } of matches) {
        // Add text node after the match
        if (end < lastIndex) {
          const textAfter = text.slice(end, lastIndex);
          if (textAfter) {
            const afterStartPos = calculatePosition(textPosition, end);
            const afterEndPos = calculatePosition(textPosition, lastIndex);
            nodes.unshift({
              type: "text",
              value: textAfter,
              position: {
                start: afterStartPos,
                end: afterEndPos,
              },
            });
          }
        }

        // Create embed node for wikilink with position
        const embedStartPos = calculatePosition(textPosition, start);
        const embedEndPos = calculatePosition(textPosition, end);

        // Parse wikilink content: extract target and optional alt text
        // Format: ![[target]] or ![[target|alt]]
        const content = match[1];
        const pipeIndex = content.indexOf("|");
        const target = pipeIndex === -1 ? content : content.slice(0, pipeIndex);
        const alt = pipeIndex === -1 ? undefined : content.slice(pipeIndex + 1);

        const embedNode: EmbedNode = {
          type: "obsidianEmbed",
          value: match[0],
          data: {
            embedType: "wikilink",
            target,
            ...(alt && { alt }),
          },
          position: {
            start: embedStartPos,
            end: embedEndPos,
          },
        };

        nodes.unshift(embedNode);

        lastIndex = start;
      }

      // Add remaining text before first match
      if (lastIndex > 0) {
        const textBefore = text.slice(0, lastIndex);
        if (textBefore) {
          const beforeStartPos = textPosition
            ? textPosition.start
            : { line: 1, column: 1, offset: 0 };
          const beforeEndPos = calculatePosition(textPosition, lastIndex);
          nodes.unshift({
            type: "text",
            value: textBefore,
            position: {
              start: beforeStartPos,
              end: beforeEndPos,
            },
          });
        }
      }

      // Replace the original text node with new nodes
      if (nodes.length > 0) {
        parent.children.splice(index, 1, ...nodes);
      }
    });
  };
};

export default remarkObsidian;
