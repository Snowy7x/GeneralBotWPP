import pkg from '@whiskeysockets/baileys';
const {default: makeWASocket, useMultiFileAuthState} = pkg;


import {resolve} from "path";
import pino from "pino";
import * as Loader from "./utils/Loader.js";
import {normalizeArabicWord} from "./utils/Format.js";
import {Competitions} from "./Controllers/Competitions.js";


const { state, saveCreds } = await useMultiFileAuthState(resolve("cache", "auth-info-multi"))
const com = new Competitions();

/** @type {import("@whiskeysockets/baileys").WASocket}*/
const client = makeWASocket({
    logger: pino({level: 'silent'}),
    printQRInTerminal: true,
    auth: state,
    defaultQueryTimeoutMs: undefined,
    syncFullHistory: true,
})

client.ev.on("creds.update", async () => {
    console.log("Logged in")
    await saveCreds()
})

client.ev.on("connection.update", async e => {
    if (e.isOnline) {
        console.log("Connected")
        // remove letter at the index
        console.log("Client ID: ", client.user.id)
        Loader.InitClient(client, com)
    }
    if (e.connection) {
        console.log(e)
    }
})


client.ev.on("messages.upsert", async e => {

    /**
     * @type {CustomMessage}
     */
    const message = e.messages[0]
    // clone the message
    const ogMessage = {...message}
    if (message.key.fromMe) return;
    if (!message.message) return;
    message.originalMessage = ogMessage
    message.isGroup = message.key.remoteJid.endsWith("@g.us")
    message.groupMetadata = null
    message.ogBody = ""
    message.from = message.key.remoteJid
    message.author = message.isGroup ? message.key.participant : message.key.remoteJid
    message.meAdmin = false

    if (message.isGroup) {
        let groupMetadata = await client.groupMetadata(message.key.remoteJid)
        message.groupMetadata = groupMetadata
        let me = groupMetadata.participants.find(member => {
            let user = client.user.id.split("@")[0]
            if (user.includes(":")) {
                user = user.split(":")[0]
            }
            return member.id.includes(user)
        })
        if (me) {
            message.meAdmin = me.admin === "admin" || me.admin === "superadmin"
        }

        let p = groupMetadata.participants.find(member => {
            return member.id === message.key.participant
        })
        if (p) {
            message.isGroupAdmin = p.admin === "admin" || p.admin === "superadmin"
        } else {
            message.isGroupAdmin = false
        }
    } else {
        message.isGroupAdmin = true
    }

    if (message.message.hasOwnProperty("viewOnceMessageV2")) {
        message.message = message.message.viewOnceMessageV2.message
        message.isViewOnce = true
    } else {
        message.isViewOnce = false
    }

    message.hasMedia = message.message.hasOwnProperty("imageMessage") || message.message.hasOwnProperty("videoMessage")
    if (message.hasMedia) {
        if (message.message.imageMessage) {
            message.mediaType = "image"
        }else if (message.message.videoMessage) {
            message.mediaType = "video"
        }
        message.media = message.message.imageMessage ?? message.message.videoMessage
        if (message.media.caption) {
            message.ogBody = message.media.caption
        }
    }

    message.hasText = message.message.hasOwnProperty("conversation") || message.message.hasOwnProperty("extendedTextMessage")
    if (message.hasText) {
        message.ogBody = message.message?.conversation || message.message.extendedTextMessage.text
    }

    message.body = normalizeArabicWord(message.ogBody)


    message.reply = async (content) => {
        if (typeof content === "string") {
            content = {
                text: content
            }
        }
        await SendMessage(message.from, content, {
            quoted: message.originalMessage,
        })
    }

    com.onMessage(message)

    if (message.author && message.author.includes("74479336")) {
        if (["snowy reload", "snowy restart", "snowy r", "s r"].includes(message.body)) {
            Loader.Load(client)
            return message.reply("Reloaded all bots")
        }

        if (["snowy get", "snowy g"].includes(message.body)) {
            return message.reply(message.from)
        }
    }

    Loader.Run(message)

})

/**
 * @param {string | null} to
 * @param {import("@whiskeysockets/baileys").AnyMessageContent | string} content
 * @returns {Promise<proto.WebMessageInfo>}
 * @param {import("@whiskeysockets/baileys").SendMessageOptions} options
 * @constructor
 */

const SendMessage = async (to, content, options = {}) => {
    if (typeof content === "string") {
        content = {
            text: content
        }
    }
    return await client.sendMessage(to, content, options)
}

/*client.on('message', async msg => {
    if (msg.author && msg.author.includes("74479336")) {
        if (["snowy reload", "snowy restart", "snowy r", "s r"].includes(msg.body)) {
            Loader.Load(client)
            msg.reply("Reloaded all bots")
            return
        }

        if (["snowy get", "snowy g"].includes(msg.body)) {
            return msg.reply(msg.from)
        }

        /!*if (msg.body === "print") {
            console.log(forms)
            return;
        }

        if (count % 2 === 0) {
            cForm.form = msg.body;
            console.log(cForm)
            forms.push({
                ...cForm
            })
            cForm.name = ""
            cForm.form = ""
        }else {
            cForm.name = msg.body;
        }
        count++;
        return*!/
    }

    if (Loader.CanReply(msg)) {
        Loader.runAutoResponses(msg);
        Loader.runCommands(msg);
    }
});*/

export default client
export {SendMessage}