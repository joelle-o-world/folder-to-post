#!/usr/bin/env ts-node

import FolderToPost from "./lib";
import { Command } from "commander";

const pathToFolder = process.argv[2];
const destination = __dirname;

const cli = new Command()
  .argument("<path-to-folder>", "folder to convert into a blog post")
  .requiredOption("-o, --output <path-to-html>")
  .action(async (path, options) => {
    const app = new FolderToPost(pathToFolder, { outputPath: options.output });
    await app.run();
    console.log("done");
  });

cli.parse();

// const app = new FolderToPost(pathToFolder, { destination });

// app.run().then(() => console.log("Done"));
