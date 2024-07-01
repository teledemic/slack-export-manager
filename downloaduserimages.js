import fs from "fs-extra";
import path from "path";
import axios from "axios";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Jul 1 2024";
const OUTPUT_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Jul 1 2024/files/users";

const users = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "users.json")));
for (const user of users) {
	if (!user.profile.image_72) throw new Error("No image for " + user.name);
	const url = user.profile.image_72;
	const ext = user.profile.image_72.slice(-3);
	const outputPath = path.join(OUTPUT_PATH, user.id + "." + ext);
	const response = await axios.get(url, { responseType: "arraybuffer" });
	await fs.writeFile(outputPath, response.data);
	console.log("Downloaded " + user.id + "." + ext);
}
