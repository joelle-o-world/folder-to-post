import { copyFile, readFile, readdir, writeFile } from "fs/promises";
import { basename, dirname } from "path";
import { extname, resolve } from "path";

class FolderToPost {
  readonly pathToFolder: string;
  private directoryContents: string[];
  readonly outputPath: string;
  readonly outputFolder: string;

  constructor(pathToFolder: string, settings: { outputPath: string }) {
    this.pathToFolder = pathToFolder;
    this.outputPath = settings.outputPath;
    this.outputFolder = dirname(this.outputPath);
  }

  async run() {
    // Check folder exists
    // Find the txt and md files
    const files = await this.markupFiles();
    const combined = FolderToPost.combineMarkup(...files);

    this.write(combined);
  }

  async findFilesWithExtension(extension: string) {
    const regex = new RegExp(`\\.(${extension})$`, "i");
    return (await this.listFiles()).filter((filename) => regex.test(filename));
  }
  async findTextFiles() {
    return this.findFilesWithExtension("txt");
  }

  async findMarkdownFiles() {
    return this.findFilesWithExtension("md");
  }
  async findImageFiles() {
    return this.findFilesWithExtension("jpe?g|png");
  }

  async findFiles() {
    return {
      text: await this.findTextFiles(),
      markdown: await this.findMarkdownFiles(),
      images: await this.findImageFiles(),
    };
  }

  async listFiles() {
    if (!this.directoryContents)
      this.directoryContents = (await readdir(this.pathToFolder))
        // Remove hidden files
        .filter((filename: string) => !/^_/.test(filename))
        // Remove .DS_Store
        .filter((filename: string) => filename !== ".DS_Store");
    return this.directoryContents;
  }

  async listFilesWithAbsolutePaths() {
    return (await this.listFiles()).map((filename) =>
      resolve(this.pathToFolder, filename)
    );
  }

  async markupFiles(): Promise<Markup[]> {
    const paths = await this.listFilesWithAbsolutePaths();
    return await Promise.all(
      paths.map(async (path) => ({
        path,
        ...(await this.markupFile(path)),
      }))
    );
  }

  markupFile(path: string) {
    const extension = extname(path);
    switch (extension.toLowerCase()) {
      case ".txt":
        return this.markupTextFile(path);
      case ".jpeg":
      case ".jpg":
      case ".png":
        return this.markupImage(path);
      default:
        throw new Error(
          `Don't know how to markup file with extension '${extension}': ${path}`
        );
    }
  }

  async markupTextFile(path: string): Promise<Markup> {
    const content = await readFile(path, { encoding: "utf-8" });
    return {
      html: "<p>" + content.replace(/\n/g, "<br/>") + "</p>",
      assets: [],
    };
  }

  async markupImage(path: string): Promise<Markup> {
    const asset = basename(path);
    return {
      html: `<img src="${asset}" />`,
      assets: [{ src: path, dest: asset }],
    };
  }

  static combineMarkup(...markups: Markup[]): Markup {
    return {
      html: markups.map((m) => m.html).join("\n\n"),
      assets: markups.reduce(
        (accumulatior, current) => [...accumulatior, ...current.assets],
        []
      ),
    };
  }

  // TODO: Make the argument a class prop i think
  write(markup: Markup) {
    return Promise.all([this.writeHtml(markup), this.copyAssets(markup)]);
  }
  async writeHtml(markup: Markup) {
    const path = this.outputPath;
    await writeFile(path, markup.html);
  }
  async copyAssets(markup: Markup) {
    await Promise.all(
      markup.assets.map(({ src, dest }) =>
        copyFile(src, resolve(this.outputFolder, dest))
      )
    );
  }
}

interface Markup {
  html: string;
  assets: { src: string; dest: string }[];
}

export default FolderToPost;
