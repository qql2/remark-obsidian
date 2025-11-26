# remark-obsidian

A [remark](https://github.com/remarkjs/remark) plugin to parse Obsidian embedding formats in markdown files.

## Installation

```bash
npm install @qql2/remark-obsidian
# or
pnpm add @qql2/remark-obsidian
# or
yarn add @qql2/remark-obsidian
```

## Usage

```javascript
import { remark } from 'remark';
import { remarkObsidian } from '@qql2/remark-obsidian';

const markdown = `
# My Document

This is a wikilink embed: ![[example-file]]

And here's an image: ![Alt text](https://example.com/image.png)
`;

const processor = remark().use(remarkObsidian);
const ast = processor.parse(markdown);
processor.runSync(ast);

console.log(ast);
```

## Supported Formats

This plugin supports the following Obsidian embedding formats:

### 1. Wikilink Embedding

Basic wikilink format:
```markdown
![[filename]]
```

Wikilink with alt text:
```markdown
![[link|altname]]
```

Examples:
- `![[example-file]]` - Basic wikilink
- `![[folder/file.md]]` - Wikilink with path
- `![[document.pdf]]` - Wikilink with extension
- `![[file|Display Name]]` - Wikilink with alt text
- `![[folder/file|Custom Alt]]` - Wikilink with path and alt text

### 2. Image Embedding

Standard markdown image format (converted to embed):
```markdown
![alt text](url)
```

Examples:
- `![Alt text](https://example.com/image.png)` - Image with alt text
- `![](image.png)` - Image without alt text

## AST Node Structure

The plugin converts embedding formats into `obsidianEmbed` nodes with the following structure:

```typescript
interface EmbedNode {
  type: "obsidianEmbed";
  value: string; // Original markdown string
  data: {
    embedType: "wikilink" | "image";
    target: string; // File path or URL
    alt?: string; // Alt text (if present)
  };
  position: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}
```

### Example AST Output

For the markdown:
```markdown
![[example-file|Display Name]]
```

The plugin generates:
```json
{
  "type": "obsidianEmbed",
  "value": "![[example-file|Display Name]]",
  "data": {
    "embedType": "wikilink",
    "target": "example-file",
    "alt": "Display Name"
  },
  "position": {
    "start": { "line": 1, "column": 1, "offset": 0 },
    "end": { "line": 1, "column": 35, "offset": 34 }
  }
}
```

## API

### `remarkObsidian()`

A remark plugin that parses Obsidian embedding formats.

**Returns:** A remark plugin function.

## Examples

### Basic Usage

```javascript
import { remark } from 'remark';
import { remarkObsidian } from '@qql2/remark-obsidian';

const markdown = `
# Document

![[my-file]]
![Image](https://example.com/img.png)
`;

const processor = remark().use(remarkObsidian);
const ast = processor.parse(markdown);
processor.runSync(ast);
```

### Processing Embed Nodes

```javascript
import { remark } from 'remark';
import { remarkObsidian } from '@qql2/remark-obsidian';
import { visit } from 'unist-util-visit';

const markdown = `
![[file1]]
![[file2|Alt Text]]
![Image](image.png)
`;

const processor = remark().use(remarkObsidian);
const ast = processor.parse(markdown);
processor.runSync(ast);

// Process embed nodes
visit(ast, 'obsidianEmbed', (node) => {
  console.log('Embed Type:', node.data.embedType);
  console.log('Target:', node.data.target);
  if (node.data.alt) {
    console.log('Alt:', node.data.alt);
  }
});
```

### Integration with Other Plugins

```javascript
import { remark } from 'remark';
import { remarkObsidian } from '@qql2/remark-obsidian';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const markdown = `
![[example]]
![Image](image.png)
`;

const processor = remark()
  .use(remarkObsidian)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = processor.processSync(markdown);
```

## License

MIT

## Author

qql2

