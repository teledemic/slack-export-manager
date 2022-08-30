import fs from "fs-extra";
import path from "path";
import axios from "axios";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Aug 30 2022";
const OUTPUT_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Aug 30 2022/files";

const dirs = await fs.readdir(SOURCE_PATH);
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
