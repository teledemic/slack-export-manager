import fs from "fs-extra";
import path from "path";
import axios from "axios";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Aug 30 2022";
const FILES_PATH = "/Users/teledemic/Downloads/Vermontopia Slack Files";
const USER_FILES_PATH = "/Users/teledemic/Downloads/Vermontopia Slack Files/users";
const OUTPUT_PATH = "/Users/teledemic/Downloads/Vermontopia HTML";
const SLACK_NAME = "Vermontopia";

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

// Create destination directories
await fs.mkdir(OUTPUT_PATH, { recursive: true });
await fs.mkdir(path.join(OUTPUT_PATH, "users"), { recursive: true });
await fs.mkdir(path.join(OUTPUT_PATH, "files"), { recursive: true });
// Copy static files
await fs.copyFile("./html-source/style.css", path.join(OUTPUT_PATH, "style.css"));
await fs.copyFile("./html-source/script.js", path.join(OUTPUT_PATH, "script.js"));

const users = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "users.json")));
const channels = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "channels.json")));
// Generalize some user info
for (const user of users) {
	if (await fs.pathExists(path.join(USER_FILES_PATH, user.id + ".png"))) {
		await fs.copyFile(path.join(USER_FILES_PATH, user.id + ".png"), path.join(OUTPUT_PATH, "users", user.id + ".png"));
		user.img = user.id + ".png";
	} else if (await fs.pathExists(path.join(USER_FILES_PATH, user.id + ".jpg"))) {
		await fs.copyFile(path.join(USER_FILES_PATH, user.id + ".jpg"), path.join(OUTPUT_PATH, "users", user.id + ".jpg"));
		user.img = user.id + ".jpg";
	}
	user.showname = user.profile.display_name || user.real_name
}

console.log("Generating homepage");
const homepage = fs.createWriteStream(path.join(OUTPUT_PATH, "index.html"));
homepage.write(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	<title>${SLACK_NAME}</title>
	<link href="style.css" rel="stylesheet">
	<script src="script.js"></script>
</head>
<body>
	<div class="full-wrap">
		<div class="column sidebar">
			<div class="slack-name">${SLACK_NAME}</div>
			<hr>
			<div>Channels</div>
			<a class="channel-link" href="javascript:LoadChannel('activity-ideas')">activity-ideas</a>
		</div>
		<div class="column main">
			<iframe id="channel-frame" title="Transcript" />
		</div>
	</div>
</body>
</html>`);
homepage.close();

for (const channel of channels) {
	console.log("Generating channel " + channel.name);
	const output = fs.createWriteStream(path.join(OUTPUT_PATH, channel.name + ".html"));
	output.write(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	<title>${channel.name}</title>
	<link href="style.css" rel="stylesheet">
</head>
<body class="channel-transcript">
	<div class="channel-name">#activity-ideas</div>
`);
	const files = await fs.readdir(path.join(SOURCE_PATH, channel.name));
	files.sort();
	for (const file of files) {
		output.write(`	<div class="date-line">
		<div class="date">${GetLongDate(file)}</div>
	</div>
`);
		const json = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, channel.name, file), "utf-8"));
		for (const message of json) {
			if (message.subtype !== undefined || message.text === "") continue;
			if (message.text.includes("<@")) {
				for (const user of users) {
					message.text = message.text.split("<@" + user.id + ">").join("<span class='user-ref'>@" + user.showname + "</span>");
				}
			}
			message.text = message.text.replace(/\n/g, "<br>");
			const sender = users.find(item => item.id === message.user);
			output.write(`	<div class="message-wrapper">
		<img class="user-pic" src="users/${sender.img}">
		<div class="text">
			<div class="header">
				<div class="user-name">${sender.showname}</div>
				<div class="time">${GetTime(message.ts)}</div>
			</div>
			<div class="message">${message.text}</div>
		</div>
	</div>
`)
		}
	}
	output.write(`</body>
</html>`);
	output.close();
}
