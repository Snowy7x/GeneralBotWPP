import client from "../Client.js";
import {downloadMediaMessage} from "@whiskeysockets/baileys";
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter'

/**
 * @param {CustomMessage} message
 * @param {WAWebJS.Client} client
 * @param {string} stickerName
 * @returns {Promise<void>}
 */
async function MediaToSticker(message, client, stickerName = "SnowyBot"){
    let media, error = null;

    if (message.hasMedia) {
        media = await downloadMediaMessage(message.originalMessage, "buffer", {})

        const sticker = new Sticker(media, {
            pack: stickerName,
            author: "Snowy",
            type: StickerTypes.FULL,
        })

        message.reply(await sticker.toMessage())

    }else {
        error = "أرسل صورة أو فيديو لتحويلها إلى ملصق";
        message.reply(error);
    }
}

const IsAdmin = async (message) => {
    let groupMetadata = await client.groupMetadata(message.key.remoteJid)
    let {isAdmin} = groupMetadata.participants.find(member => member.id === client.user.id)
}

async function Kick(message) {
    console.log(message)
    if (!message.isGroup) return message.reply("هذا الأمر يعمل فقط في المجموعات")
    if (!message.meAdmin) return message.reply("أنا لست مشرفاً في هذه المجموعة")
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        console.log(message.message.extendedTextMessage.contextInfo.mentionedJid)
        let toKick = []
        let participants = message.message.extendedTextMessage.contextInfo.mentionedJid
        message.groupMetadata.participants.forEach((user) => {
            if (participants.includes(user.id)) {
                if (user.isAdmin || user.isSuperAdmin) {
                    return message.reply("لا يمكن طرد المشرفين")
                }
                toKick.push(user.id)
            }
        })
        await client.groupParticipantsUpdate(message.from, toKick, "remove")
        return message.reply("خرج كلب/كلاب من المجموعة")
    }else{
        return message.reply("منشن الكلب/الكلاب الذين تريد طردهم")
    }
}

/**
 *
 * @param {CustomMessage} msg
 * @param {boolean} includeAdmins
 * @param client
 * @returns {Promise<void>}
 * @constructor
 */
async function GroupMention(msg, client = null, includeAdmins = false){
    console.log(includeAdmins)
    const mentions = msg.groupMetadata.participants.map((user) => {
        if ((user.admin === "admin" || user.admin === "superadmin") && !includeAdmins) return;
        return user.id
    })

    const text = mentions.map((jid) => `@${jid.replace(/@.+/, '')}`).join('\n')

    await msg.reply( {
        text: text,
        mentions: mentions,
    });
}


export {MediaToSticker, IsAdmin, GroupMention, Kick}