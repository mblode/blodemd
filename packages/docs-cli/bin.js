#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const [command, ...args] = process.argv.slice(2);

const printHelp = () => {
  console.log(
    "Atlas docs-cli\n\nCommands:\n  init [dir]      Scaffold a docs folder\n  validate [dir]  Validate docs.json\n  dev             Start the docs dev server (see instructions)\n"
  );
};

const ensureFile = async (filePath, content) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, content);
  }
};

switch (command) {
  case "init": {
    const target = args[0] ?? "docs";
    const root = path.resolve(process.cwd(), target);
    await fs.mkdir(root, { recursive: true });
    const docsJson = {
      name: "My Docs",
      navigation: {
        groups: [{ group: "Getting Started", pages: ["index"] }],
      },
    };

    await ensureFile(
      path.join(root, "docs.json"),
      `${JSON.stringify(docsJson, null, 2)}\n`
    );

    await ensureFile(
      path.join(root, "index.mdx"),
      "---\ntitle: Welcome\n---\n\nStart writing your docs here.\n"
    );

    console.log(`Docs scaffolded in ${root}`);
    break;
  }
  case "validate": {
    const target = args[0] ?? "docs";
    const root = path.resolve(process.cwd(), target);
    try {
      const raw = await fs.readFile(path.join(root, "docs.json"), "utf-8");
      JSON.parse(raw);
      console.log("docs.json is valid JSON.");
    } catch (error) {
      console.error("docs.json validation failed.");
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
    break;
  }
  case "dev": {
    console.log("Run `npm run dev --filter=docs` from the repo root.");
    console.log("Then open http://localhost:3001 to view the docs site.");
    break;
  }
  default:
    printHelp();
}
