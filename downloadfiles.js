import fs from "fs-extra";
import path from "path";
import axios from "axios";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Jun 24 2025";
const OUTPUT_PATH = SOURCE_PATH + "/files";

const dirs = await fs.readdir(SOURCE_PATH);
fs.ensureDirSync(OUTPUT_PATH);
for (const dir of dirs) {
	console.log("scanning channel " + dir);
	const stat = await fs.stat(path.join(SOURCE_PATH, dir));
	if (stat.isDirectory() && dir !== "files") {
		const files = await fs.readdir(path.join(SOURCE_PATH, dir));
		for (const file of files) {
			// console.log("scanning file " + file);
			const json = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, dir, file), "utf-8"));
			for (const message of json) {
				if (message.files) {
					for (const file of message.files) {
						const outputPath = path.join(OUTPUT_PATH, file.id + "." + file.filetype);
						if (!(await fs.pathExists(outputPath))) {
							if (file.url_private) {
								if (file.url_private.startsWith("https://docs.google.com")) continue;
								const response = await axios.get(file.url_private, { responseType: "arraybuffer" });
								await fs.writeFile(outputPath, response.data);
								console.log("Downloaded " + file.id + "." + file.filetype);
							}
						}
					}
				}
			}
		}
	}
}
