import fs from "fs-extra";
import path from "path";
import * as emoji from "node-emoji";

const SOURCE_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Jan 13 2025";
const FILES_PATH = "/Users/teledemic/Downloads/Vermontopia Slack export Mar 17 2020 - Jan 13 2025/files";
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

let failedEmojis = new Map();
function ConvertEmojis(text) {
	return emoji.emojify(text.replace(/-/g, "_"), {
		format: (emoji, part, string) => {
			if (!part || !string) {
				// Emoji is not found, TODO fix here
				// console.log(emoji, part, string);
				switch (emoji) {
					case ":skin_tone_1:":
					case ":skin_tone_2:":
					case ":skin_tone_3:":
					case ":skin_tone_4:":
					case ":skin_tone_5:":
						return "";
					case ":virus:":
						return "🦠";
					case ":haircut:":
						return "💇";
					case ":woman_getting_haircut:":
						return "💇‍♀️";
					case ":woman_raising_hand:":
						return "🙋‍♀️";
					case ":squirrel:":
						return "🐿️";
					case ":massage:":
						return "💆";
					case ":eyebrows:":
					case ":face_with_raised_eyebrow:":
						return "🤨";
					case ":pig_happy:":
						return "🐷";
					case ":face_with_hand_over_mouth:":
						return "🤭";
					case ":dancedoge:":
						return "🐕‍🦺";
					case ":lower_left_paintbrush:":
						return "🖌️";
					case ":admission_tickets:":
						return "🎟️";
					case ":woman_with_bunny_ears_partying:":
						return "👯‍♀️";
					case ":woman_getting_massage:":
						return "💆‍♀️";
					case ":woozy_face:":
						return "🥴";
					case ":hugging_face:":
						return "🤗";
					case ":aw_yeah:":
						return "🤙";
					case ":smiling_face_with_3_hearts:":
						return "🥰";
					case ":fencer:":
						return "🤺";
					case ":bee:":
						return "🐝";
					case ":sports_medal:":
						return "🏅";
					case ":trump_dance:":
						return "🕺";
					case ":face_with_spiral_eyes:":
						return "😵‍💫";
					case ":hankey:":
						return "💩";
					case ":_1:":
						return "👎";
					case ":thinking_face:":
						return "🤔";
					case ":pleading_face:":
						return "🥺";
					case ":face_with_rolling_eyes:":
						return "🙄";
					case ":coolstory:":
						return "👍";
					case ":zany_face:":
						return "🤪";
					case ":rolling_on_the_floor_laughing:":
						return "🤣";
					case ":happy_dog:":
						return "🐶";
					case ":the_horns:":
						return "🤘";
					case ":dinosaurs:":
						return "🦖";
					case ":this_is_fine_fire:":
						return "🔥";
					case ":cheese_wedge:":
						return "🧀";
					case ":pinching_hand:":
						return "🤏";
					case ":partying_face:":
						return "🥳";
					case ":face_vomiting:":
						return "🤮";
					case ":face_with_monocle:":
						return "🧐";
					case ":ahhhhhhhh:":
						return "😱";
					case ":woman_gesturing_ok:":
						return "🙆‍♀️";
					case ":salute_canada:":
						return "🇨🇦";
					case ":excuse_me:":
						return "🙋";
					case ":face_with_cowboy_hat:":
						return "🤠";
					case ":smiling_face_with_tear:":
						return "🥲";
					case ":drum_with_drumsticks:":
						return "🥁";
					default:
						const count = failedEmojis.get(emoji) || 0;
						failedEmojis.set(emoji, count + 1);
				}
			}
			return emoji;
		}
	});
}

// TODO: reactions
function WriteMessage(output, user, ts, message, messageClass, reactions) {
	let reactionText = "";
	if (reactions && reactions.length) {
		for (const reaction of reactions) {
			const reactors = reaction.users.map(reactor => users.find(item => item.id === reactor).showname).join(", ");
			reactionText += `<div class="reaction" title="${reactors}">${ConvertEmojis(":" + reaction.name + ":")} ${reaction.count}</div>`;
		}
	}
	if (reactionText) reactionText = `<div class="reactions">${reactionText}</div>`;
	output.write(`	<div class="message-wrapper${messageClass ? " " + messageClass : ""}">
	<img class="user-pic" src="users/${user.img}">
	<div class="text">
		<div class="header">
			<div class="user-name">${user.showname}</div>
			<div class="time">${GetTime(ts)}</div>
		</div>
		<div class="message">${ConvertEmojis(message)}</div>
		${reactionText}
	</div>
</div>
`);
}

function WriteAttachment(output, attachment) {
	let content = "";
	if (attachment.image_url) {
		content = `<img src="${attachment.image_url}">`;
	} else if (attachment.video_html) {
		content = attachment.video_html.replace("autoplay=1", "autoplay=0");
	} else if (attachment.thumb_url) {
		content = `<img src="${attachment.thumb_url}">`;
	} else if (attachment.text) {
		content = attachment.text;
	} else {
		// If no text or title, bail, otherwise omit content
		if (!attachment.title) return;
	}
	if (content) content = `<div class="attachment-content">${content}</div>`;
	let byline = "";
	if (attachment.service_icon) byline += `<img src="${attachment.service_icon}">`;
	if (attachment.service_name) byline += `<span class="service-name">${attachment.service_name}</span>`;
	if (attachment.author_name) byline += `<span class="author-name">${attachment.author_name}</span>`;
	if (byline) byline = `<div class="attachment-byline">${byline}</div>`;
	let title = "";
	if (attachment.title) title = `<div class="attachment-title"><a href="${attachment.title_link}">${attachment.title}</a></div>`;
	output.write(`	<div class="attachment">
		<div class="attachment-header">
			${byline}
			${title}
		</div>
		${content}
	</div>
`);
}

// Create destination directories
await fs.ensureDir(OUTPUT_PATH);
await fs.ensureDir(path.join(OUTPUT_PATH, "users"));
await fs.ensureDir(path.join(OUTPUT_PATH, "files"));
// Copy static files, but skip if they exist
await fs.copyFile("./html-source/style.css", path.join(OUTPUT_PATH, "style.css"));
await fs.copyFile("./html-source/script.js", path.join(OUTPUT_PATH, "script.js"));
console.log("Copying files");
await fs.copy(FILES_PATH, path.join(OUTPUT_PATH, "files"), { overwrite: false, errorOnExist: false });
await fs.copy(USER_FILES_PATH, path.join(OUTPUT_PATH, "users"), { overwrite: false, errorOnExist: false });

const users = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "users.json")));
let channels = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, "channels.json")));
channels = channels.sort((a, b) => (a.name > b.name) ? 1 : -1);
const sourcefiles = await fs.readdir(path.join(OUTPUT_PATH, "files"));
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
	<link href="style.css" rel="preload stylesheet">
	<script src="script.js"></script>
</head>
<body>
	<div class="full-wrap">
		<div class="column sidebar">
			<div class="slack-name">${SLACK_NAME}</div>
			<hr>
			<div>Channels</div>
`);
for (const channel of channels) {
	homepage.write(`			<div class="channel-link${channel.is_archived ? " archived" : ""}"><a href="javascript:LoadChannel('${channel.name}')">${channel.name}</a></div>`);
}
homepage.write(`		</div>
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
	<div class="channel-name">#${channel.name}</div>
	<div class="channel-description">${channel.purpose.value}</div>
`);
	const files = await fs.readdir(path.join(SOURCE_PATH, channel.name));
	files.sort();
	for (const file of files) {
		if (file === "canvas_in_the_conversation.json") continue;
		output.write(`	<div class="date-line">
		<div class="date">${GetLongDate(file)}</div>
	</div>
`);
		const json = JSON.parse(await fs.readFile(path.join(SOURCE_PATH, channel.name, file), "utf-8"));
		for (const message of json) {
			let sender = users.find(item => item.id === message.user);
			// Hacky workaround for bot
			if (!sender) sender = { showname: "Vermontopia Bot", img: "U01RH62R550.png" };
			if (message.subtype === undefined || message.subtype === "thread_broadcast") {
				// User mentions
				if (!message.text) message.text = "";
				if (message.text.includes("<@")) {
					for (const user of users) {
						message.text = message.text.split("<@" + user.id + ">").join("<span class='user-ref'>@" + user.showname + "</span>");
					}
				}

				// Newlines
				message.text = message.text.replace(/\n/g, "<br>");
				// Links
				message.text = message.text.replace(/<http[^|]*\|([^>]*)>/g, "<a href='$1'>$1</a>");
				// Attached files
				if (message.files && message.files.length) {
					for (const file of message.files) {
						// Search the files folder because the info may be gone from slack
						const sourcefile = sourcefiles.find(item => item.startsWith(file.id));
						if (sourcefile) {
							if (sourcefile.endsWith("jpg") || sourcefile.endsWith("png") || sourcefile.endsWith("gif")) {
								message.text += `<img src="files/${sourcefile}">`;
							} else if (sourcefile.endsWith("mp4") || sourcefile.endsWith("mov")) {
								message.text += `<video controls src="files/${sourcefile}" />`;
							} else {
								message.text += `<a class="file-link" href="files/${sourcefile}">${sourcefile}</a>`
							}
						} else {
							// Deleted files, I think (mode: 'tombstone')
						}
					}
				}
				WriteMessage(output, sender, message.ts, message.text, undefined, message.reactions);
				if (message.attachments && message.attachments.length) {
					for (const attachment of message.attachments) {
						WriteAttachment(output, attachment);
					}
				}
			} else if (message.subtype === "channel_join") {
				WriteMessage(output, sender, message.ts, "joined the channel", "system", message.reactions);
			} else if (message.subtype === "bot_message" || message.subtype === "channel_archive" || message.subtype === "channel_unarchive") {
				WriteMessage(output, sender, message.ts, message.text, undefined, message.reactions);
			} else if (message.subtype === "tombstone" || message.subtype === "channel_topic" || message.subtype === "channel_purpose" || message.subtype === "channel_name") {
				// Ignore deleted messages, topic changes
			} else {
				// Unhandled messages
				console.log(message);
			}
		}
	}
	// One more date line for padding
	output.write(`	<div class="date-line"></div>`);
	output.write(`</body>
</html>`);
	output.close();
}
// Display failed emoji counts
// const failedEmojisSortedByCount = Array.from(failedEmojis).sort((a, b) => (a[1] < b[1]) ? 1 : -1);
// console.log(failedEmojisSortedByCount);
