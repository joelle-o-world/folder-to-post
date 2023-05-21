import FolderToPost from "./lib";

const pathToFolder = process.argv[2];
const destination = __dirname;

const app = new FolderToPost(pathToFolder, { destination });

app.run().then(() => console.log("Done"));
