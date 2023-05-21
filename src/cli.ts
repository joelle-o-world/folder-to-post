import FolderToPost from "./lib";

const pathToFolder = process.argv[2];

const app = new FolderToPost(pathToFolder);

app.run().then(() => console.log("Done"));
