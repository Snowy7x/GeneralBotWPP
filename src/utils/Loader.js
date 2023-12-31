import path from 'path';
import fs from 'fs';
import Bot from "../classes/Bot.js";
import client, {CreateMessage, SendMessage, Store} from "../Client.js";

// relative to the index.js file, not the Loader.js file
let currFolder = path.resolve();
if (!currFolder.endsWith("utils")) {
    if (currFolder.endsWith('src')) {
        currFolder = path.join(currFolder, 'utils');
    } else {
        currFolder = path.join(currFolder, 'src', 'utils');
    }
}
console.log(currFolder);
if (!fs.existsSync(path.join(currFolder, '../../Groups'))) {
    console.error('Groups folder not found!');
    process.exit(1);
}
// '../../Groups' is the path to the groups folder relative to the Loader.js file
const groupsFolder = path.join(currFolder, '../../Groups');
const groups = fs.readdirSync(groupsFolder).filter(file => file.endsWith('.json'));
const prefixes = [];
const ids = [];
const newsMap = []

// Prepare all the groups with their respective data
const bots = []

Load();

function Load(client = null) {
    groups.forEach(group => {
        /// old require: const groupData = require(path.join(groupsFolder, group));
        /// new import:
        const groupData = JSON.parse(fs.readFileSync(path.join(groupsFolder, group), 'utf8'));
        // Create the news map
        if (groupData.hasOwnProperty("newsSources") && groupData.hasOwnProperty("newsTarget")  && groupData.hasOwnProperty("newsForms")) {
            newsMap.push({
                name: groupData.botName.toString(),
                sources: groupData.newsSources,
                targets: groupData.newsTarget,
                finalTargets: groupData?.newsFinalTarget || [],
                forms: groupData.newsForms,
                from: groupData.hasOwnProperty("newsFromIncludes") ? groupData.newsFromIncludes : null,
            })
        }

        // Create the bot
        const autoResponses = groupData.autoResponses;
        const commands = groupData.commands;
        prefixes.push(...groupData.commandPrefixes)

        const groupsData = [];

        for (let groupName in groupData.groups) {
            let gData = groupData.groups[groupName];

            //let group = new Group(groupName, gData);
            groupsData.push({
                name: groupName,
                ...gData
            });
        }

        console.log(`Loaded ${groupsData.length} groups for ${groupData.botName}`);

        let bot = new Bot(groupData.botName.toString(), groupData.commandPrefixes, {
            groups: groupsData,
            autoResponses,
            commands,
            defaultResponse: groupData.defaultResponse,
            hasForms: groupData.hasForms,
            formsCommand: groupData.formsCommand,
            forms: groupData.forms,
            sheets: groupData.sheets,
            cat: groupData.cat,
        });

        bot.client = client;
        bots.push(bot);
        ids.push(...bot.getGroupsIds());
    });
    LoadPermissions();

    console.log(`Loaded ${bots.length} bots`);
}

import chatBotController from "../Controllers/ChatBotController.js";
import {downloadMediaMessage} from "@whiskeysockets/baileys";

/**
 *
 * @param {CustomMessage} msg
 * @returns {boolean}
 */
function CanReply(msg) {
    return ids.includes(msg.key.remoteJid);
}

/**
 *
 * @param {CustomMessage} msg
 */
async function runAutoResponses(msg) {
    // Check if the message is a command
    /*const prefix = prefixes.find(p => msg.body.startsWith(p));
    if (prefix) {
        return;
    }*/

    // Check if the message is a reply or have a mention to the bot
    /*const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    let uId = client.user.id.split(":")[0] + "@s.whatsapp.net"
    if (!mentions || !mentions.includes(uId) || mentions.length > 1) {
        return;
    }
    msg.body = msg.body.replaceAll("@" + uId.split("@")[0], "").trim()*/

    // the message is a reply or have a mention to the bot
    // now run the chatbot to reply
    /*await client.sendPresenceUpdate("composing", msg.from)
    const answer = await chatBotController(msg.body)
    if (answer) {
        try {
            await msg.reply(answer?.toString())
            await client.sendPresenceUpdate("available", msg.from)
        } catch {
        }
    }*/
}

/**
 *
 * @param {CustomMessage} msg
 */
function runCommands(msg) {
    // check if message starts with a prefix from the prefixes array
    const prefix = prefixes.find(p => msg.body.startsWith(p));
    if (prefix) {
        // remove the prefix from the message
        const command = msg.body.slice(prefix.length);
        // split the command into an array of strings
        const args = command.split(' ');
        // get the command name
        let commandName = args.shift().toLowerCase();
        if ((commandName === " " || commandName === "") && args.length > 0) {
            commandName = args.shift().toLowerCase();
        }

        for (let bot of bots) {
            if (bot.canReply(msg, prefix)) {
                bot.runCommands(msg, commandName, args);
            }
        }
    }

}


/**
 *
 * @param {CustomMessage} msg
 * @param {Object} news
 */
async function runNews(msg, news) {
    // content of the message
    if (news.from && news.from.length > 0) {
        let isOk = false;
        for (let from of news.from) {
            if (msg.author.includes(from)) {
                isOk = true;
                break;
            }
        }
        if (!isOk) return;
    }

    if (msg.body < 2) return;

    const forbiddenWords = ["مانجا", "مانهوا", "مانها", "قراءة ممتعة", "chapter"];
    if (forbiddenWords.some(w => msg.ogBody.toLowerCase().includes(w))) return;
    let form = msg.ogBody.includes("مشاهده ممتعه") || msg.ogBody.includes("مشاهدة ممتعة") ? news.forms["episode"] : news.forms["news"];
    let content = form.replace("{content}", msg.ogBody);

    let media = null;
    if (msg.hasMedia) {
        media = await downloadMediaMessage(msg.originalMessage, "buffer", {})
    }

    let sentMsg = null;

    // send the message to the target groups
    if (msg.ogBody.includes("مشاهده ممتعه") || msg.ogBody.includes("مشاهدة ممتعة")) {
        for (let target of news.finalTargets) {
            // if (target === msg.from) continue;
            if (media) {
                const options = {
                    caption: content,
                }
                if (msg.mediaType === "video") {
                    options.video = media;
                } else if (msg.mediaType === "image") {
                    options.image = media;
                }
                sentMsg = await SendMessage(target, options);
            } else {
                sentMsg = await SendMessage(target, {
                    text: content,
                });
            }
        }
    }else {
        for (let target of news.targets) {
            // if (target === msg.from) continue;
            if (media) {
                const options = {
                    caption: content,
                }
                if (msg.mediaType === "video") {
                    options.video = media;
                } else if (msg.mediaType === "image") {
                    options.image = media;
                }
                sentMsg = await SendMessage(target, options);
            } else {
                sentMsg = await SendMessage(target, {
                    text: content,
                });
            }
        }
    }

    // check if folder exists
    if (!fs.existsSync(path.join(currFolder, "../Data"))) {
        fs.mkdirSync(path.join(currFolder, "../Data"));
    }

    // check if file exists
    if (!fs.existsSync(path.join(currFolder, "../Data/news.json"))) {
        fs.writeFileSync(path.join(currFolder, "../Data/news.json"), "{}");
    }

    // save the message to the news.json file
    fs.readFile(path.join(currFolder, "../Data/news.json"), "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let newsMap = JSON.parse(data);
        newsMap[sentMsg.key.id] = {
            msgId: sentMsg.key.id,
            name: news.name,
            from: msg.author,
            content: content,
            sent: msg.ogBody.includes("مشاهده ممتعه") || msg.ogBody.includes("مشاهدة ممتعة"),
        };

        fs.writeFile(path.join(currFolder, "../Data/news.json"), JSON.stringify(newsMap), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
}

/**
 * @param {CustomMessage} message
 * @return {Promise<void>}
 * @constructor
 */
async function TryLoadNewsMsg(message) {
    // check if folder exists
    if (!fs.existsSync(path.join(currFolder, "../Data"))) {
        fs.mkdirSync(path.join(currFolder, "../Data"));
    }

    // check if file exists
    if (!fs.existsSync(path.join(currFolder, "../Data/news.json"))) {
        fs.writeFileSync(path.join(currFolder, "../Data/news.json"), "[]");
    }

    // read all the loaded news
    fs.readFile(path.join(currFolder, "../Data/news.json"), "utf8", async (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let newsList = JSON.parse(data);

        // forward the message
        let m = message.originalMessage
        let fMsg = m.message[Object.keys(m.message)[0]]
        let ctx = fMsg?.contextInfo
        if (!ctx) return;
        let quoted = ctx?.quotedMessage
        let id = ctx?.stanzaId
        if (!quoted) return;
        quoted.message = quoted

        quoted.key = {
            id: id,
            remoteJid: message.key.remoteJid,
            participant: ctx.participant,
            fromMe: true
        }
        let newMsg = await CreateMessage(quoted)
        let content = newMsg.body;

        // Check if the message is already loaded
        let newsListElement = newsList[id];
        console.log(`Found Quoted Message[${id}]: ${newsListElement}`)
        if (!newsListElement) return;
        if (newsListElement.sent) return;
        console.log("Found News: " + newsListElement.name)

        // Get the news
        let news = newsMap.find(n => n.name === newsListElement.name);
        if (!news) return;


        let media = null;
        if (newMsg.hasMedia) {
            media = await downloadMediaMessage(newMsg.originalMessage, "buffer", {})
        }
        for (let target of news.finalTargets) {
            if (media) {
                const options = {
                    caption: content,
                }
                if (newMsg.mediaType === "video") {
                    options.video = media;
                }else if (newMsg.mediaType === "image") {
                    options.image = media;
                }
                console.log(target, options)
                await SendMessage(target, options);
            }else {
                console.log(target, content)
                await SendMessage(target, {
                    text: content,
                });
            }
        }

        // remove the message from the news.json file
        newsListElement.sent = true;
        newsList[newsListElement.msgId] = newsListElement;
        fs.writeFile(path.join(currFolder, "../Data/news.json"), JSON.stringify(newsList), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    // Check if the message is already loaded

    // Get the news
    /*let news = newsMap.find(n => n.name === msg.news);
    if (!news) return;

    // Resend the same message to the target groups
    let content = msg.body;
    let media = null;
    if (msg.hasMedia) {
        media = await downloadMediaMessage(msg.originalMessage, "buffer", {})
    }

    for (let target of news.finalTargets) {
        if (target === msg.from) continue;
        if (media) {
            const options = {
                caption: content,
            }
            if (msg.mediaType === "video") {
                options.video = media;
            }else if (msg.mediaType === "image") {
                options.image = media;
            }
            console.log(target, options)
            await SendMessage(target, options);
        }else {
            console.log(target, content)
            await SendMessage(target, {
                text: content,
            });
        }
    }*/
}


/**
 *
 * @param {CustomMessage} msg
 */
async function Run(msg) {
    if (CanReply(msg)) {
        await runAutoResponses(msg);
        runCommands(msg);
    } else {
        for (let news of newsMap) {
            if (news.sources.includes(msg.from)) {
                await runNews(msg, news);
            }
            if (news.targets.includes(msg.from)) {
                await TryLoadNewsMsg(msg);
            }
        }
    }
}

function InitClient(client, competitions) {
    for (let bot of bots) {
        bot.InitClient(client, competitions)
    }
}

function LoadPermissions() {

    // check if the permissions file exists
    let permissions = null;
    try {
        permissions = fs.readFileSync(path.join(currFolder, '../../permissions.json'), 'utf8');
    }catch (e) {
        console.log('permissions.json file not found, creating one');
    }
    if (!permissions) {
        // Create the permissions file

        // Create empty data;
        const data = {};
        for (let bot of bots) {
            data[bot.name] = {};
            for (let group of bot.groups) {
                data[bot.name][group.name] = {};
                for (let command of bot.commands) {
                    data[bot.name][group.name][command.command] = {};
                }
            }
        }

        fs.writeFileSync(path.join(currFolder, '../../permissions.json'), JSON.stringify(data, null, 2));
    }else {
        // Check if has all bots and groups
        const data = JSON.parse(permissions);
        for (let bot of bots) {
            if (!data[bot.name]) {
                data[bot.name] = {};
            }
            for (let group of bot.groups) {
                if (!data[bot.name][group.name]) {
                    data[bot.name][group.name] = {};
                }
                for (let command of bot.commands) {
                    if (!data[bot.name][group.name][command.command]) {
                        data[bot.name][group.name][command.command] = {};
                    }
                }
            }
        }
    }
}

function HasPermission(botName, groupName, commandName, userId) {
    const permissions = JSON.parse(fs.readFileSync(path.join(currFolder, '../../permissions.json'), 'utf8'));
    return permissions[botName][groupName][commandName].hasOwnProperty(userId);
}

function AddPermission(botName, groupName, commandName, userId) {
    const permissions = JSON.parse(fs.readFileSync(path.join(currFolder, '../../permissions.json'), 'utf8'));
    permissions[botName][groupName][commandName] = {
        ...permissions[botName][groupName][commandName],
        [userId]: true
    }
    fs.writeFileSync(path.join(currFolder, '../../permissions.json'), JSON.stringify(permissions, null, 2));
}

function RemovePermission(botName, groupName, commandName, userId) {
    const permissions = JSON.parse(fs.readFileSync(path.join(currFolder, '../../permissions.json'), 'utf8'));
    delete permissions[botName][groupName][commandName][userId];
    fs.writeFileSync(path.join(currFolder, '../../permissions.json'), JSON.stringify(permissions, null, 2));
}

export {
    CanReply,
    Run,
    InitClient,
    TryLoadNewsMsg,
    Load,

    HasPermission,
    AddPermission,
    RemovePermission
}