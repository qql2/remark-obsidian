import { remark } from "remark";
import { remarkObsidian } from "../src/remark-obsidian";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname for ES modules compatibility
const getDirname = () => {
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    // Fallback for CommonJS (though tsx should handle this)
    return __dirname;
  }
};

const testDir = getDirname();

interface TestCase {
  name: string;
  file: string;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: "test1",
    file: "test1.md",
    description: "Basic Wikilink Embedding",
  },
  {
    name: "test2",
    file: "test2.md",
    description: "Image Embedding",
  },
  {
    name: "test3",
    file: "test3.md",
    description: "Multiple Embeds",
  },
  {
    name: "test4",
    file: "test4.md",
    description: "Mixed Content",
  },
  {
    name: "test5",
    file: "test5.md",
    description: "Edge Cases",
  },
  {
    name: "test6",
    file: "test6.md",
    description: "Wikilink with Alt Text",
  },
];

function runTest(testCase: TestCase) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Test: ${testCase.name} - ${testCase.description}`);
  console.log("=".repeat(60));

  const filePath = join(testDir, testCase.file);
  const markdown = readFileSync(filePath, "utf-8");

  console.log("\nInput Markdown:");
  console.log("-".repeat(60));
  console.log(markdown);

  const processor = remark().use(remarkObsidian);
  const ast = processor.parse(markdown);
  processor.runSync(ast);

  console.log("\nParsed AST:");
  console.log("-".repeat(60));
  console.log(JSON.stringify(ast, null, 2));

  // Count embed nodes
  const embedNodes: any[] = [];
  function findEmbeds(node: any) {
    if (node.type === "obsidianEmbed") {
      embedNodes.push(node);
    }
    if (node.children) {
      node.children.forEach(findEmbeds);
    }
  }
  findEmbeds(ast);

  console.log("\nFound Embed Nodes:");
  console.log("-".repeat(60));
  embedNodes.forEach((node, index) => {
    console.log(`\nEmbed ${index + 1}:`);
    console.log(`  Type: ${node.type}`);
    console.log(`  Value: ${node.value}`);
    console.log(`  Embed Type: ${node.data?.embedType}`);
    console.log(`  Target: ${node.data?.target}`);
    if (node.data?.alt) {
      console.log(`  Alt: ${node.data.alt}`);
    }
    if (node.position) {
      console.log(`  Position:`);
      console.log(
        `    Start: line ${node.position.start.line}, column ${node.position.start.column}, offset ${node.position.start.offset}`
      );
      console.log(
        `    End: line ${node.position.end.line}, column ${node.position.end.column}, offset ${node.position.end.offset}`
      );
    } else {
      console.log(`  Position: MISSING`);
    }
  });

  console.log(`\nTotal embeds found: ${embedNodes.length}`);
}

console.log("Running Remark Obsidian Plugin Tests");
console.log("=".repeat(60));

testCases.forEach(runTest);

console.log("\n" + "=".repeat(60));
console.log("All tests completed!");
console.log("=".repeat(60));
