import { Plugin } from "unified";
/**
 * Remark plugin to parse Obsidian embedding formats:
 * - ![[filename]] - Wikilink embedding (parsed from text nodes)
 * - ![[link|altname]] - Wikilink embedding with alt text
 * - ![alt](url) - Image embedding (converted from image nodes)
 */
export declare const remarkObsidian: Plugin;
export default remarkObsidian;
