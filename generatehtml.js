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

function ordinal(n) {
	var s = ["th", "st", "nd", "rd"];
	var v = n % 100;
	return (s[(v - 20) % 10] || s[v] || s[0]);
}
function GetLongDate(filename) {
	const parts = filename.slice(0, -5).split("-");
	const date = new Date(parts[0], parts[1] - 1, parts[2]);
	return date.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" }) + ordinal(date.getDate()) + " " + date.getFullYear();
}

function GetTime(timestamp) {
	const date = new Date(Number(timestamp) * 1000);
	return date.toLocaleTimeString();
}

for (const channel of channels) {
	console.log("Generating channel " + channel.name);
	const output = fs.createWriteStream(path.join(OUTPUT_PATH, channel.name + ".html"));
	const files = await fs.readdir(path.join(SOURCE_PATH, channel.name));
	files.sort();
	for (const file of files) {
		output.write(`			<div class="date-line">
		<div class="date">${GetLongDate(file)}</div>
	</div>
`);
		const json = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, channel.name, file), "utf-8"));
		for (const message of json) {
			if (message.subtype !== undefined || message.text === "") continue;
			if (message.text.includes("<@")) {
				for (const user of users) {
					message.text = message.text.split(user.id).join(user.real_name);
				}
			}
			const sender = users.find(item => item.id === message.user);
			output.write(`			<div class="message-wrapper">
			<div class="user-pic"></div>
			<div class="text">
				<div class="header">
					<div class="user-name">${sender.real_name}</div>
					<div class="time">${GetTime(message.ts)}</div>
				</div>
				<div class="message">${message.text}</div>
			</div>
		</div>
`)
		}
	}
	output.close();
}
