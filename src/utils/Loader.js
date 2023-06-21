import path from 'path';
import fs from 'fs';
import Bot from "../classes/Bot.js";
import {Competitions} from "../Controllers/Competitions.js";

// relative to the index.js file, not the Loader.js file
let currFolder = path.resolve();
if (!currFolder.endsWith("utils")) {
    console.error('Loader.js must be in the utils folder!', currFolder);
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

// Prepare all the groups with their respective data
const bots = []

Load();


function Load(client = null) {
    groups.forEach(group => {
        /// old require: const groupData = require(path.join(groupsFolder, group));
        /// new import:
        const groupData = JSON.parse(fs.readFileSync(path.join(groupsFolder, group), 'utf8'));
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
        });

        bot.client = client;
        bots.push(bot);
        ids.push(...bot.getGroupsIds());
    });

    console.log(`Loaded ${bots.length} bots`);
}

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
function runAutoResponses(msg) {
    /*for (let bot of bots) {
        if (bot.canReply(msg)) {
            bot.runAutoResponses(msg);
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

function InitClient(client, competitions) {
    for (let bot of bots) {
        bot.InitClient(client, competitions)
    }
}

export {
    CanReply,
    runAutoResponses,
    runCommands,
    InitClient,
    Load
}