import fs from "fs-extra";
import path from "path";
import axios from "axios";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Aug 30 2022";
const FILES_PATH = "/Users/teledemic/Downloads/Vermontopia Slack Files";
const OUTPUT_PATH = "/Users/teledemic/Downloads/Vermontopia HTML";

const users = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "users.json")));
const channels = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "channels.json")));

console.log("Generating homepage");
// TODO: homepage

for (const channel of channels) {
	console.log("Generating channel " + channel.name);
	// let html = 
	const files = await fs.readdir(path.join(SOURCE_PATH, dir));
	files.sort();
	for (const file of files) {
	}
}
