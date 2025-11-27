import { Plugin } from 'unified';
import { Node } from 'unist';

interface EmbedNode extends Node {
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
declare const remarkObsidian: Plugin;

export { remarkObsidian as default, remarkObsidian };
export type { EmbedNode };
