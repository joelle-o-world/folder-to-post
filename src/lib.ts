import { readdir } from "fs/promises";

class FolderToPost {
  readonly pathToFolder: string;
  directoryContents: string[];

  constructor(pathToFolder: string, settings = {}) {
    this.pathToFolder = pathToFolder;
  }

  async run() {
    // Check folder exists
    // Find the txt and md files
    const files = await this.findFiles();
    console.log(files);
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
      this.directoryContents = await readdir(this.pathToFolder);
    return this.directoryContents;
  }
}

export default FolderToPost;
