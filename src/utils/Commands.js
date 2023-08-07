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
        try {
            media = await downloadMediaMessage(message.originalMessage, "buffer", {})

            const sticker = new Sticker(media, {
                pack: stickerName,
                author: "Snowy",
                type: StickerTypes.FULL,
            })

            message.reply(await sticker.toMessage())
        }catch (e) {
            error = e;
            message.reply("حدث خطأ أثناء التحويل إلى ملصق\nحاليا لا يتم دعم الفيديوهات");
        }
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
    if (!message.isGroup) return message.reply("هذا الأمر يعمل فقط في المجموعات")
    if (!message.meAdmin) return message.reply("أنا لست مشرفاً في هذه المجموعة")
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        let toKick = []
        let participants = message.message.extendedTextMessage.contextInfo.mentionedJid
        message.groupMetadata.participants.forEach((user) => {
            if (participants.includes(user.id)) {
                if (user.id.includes("74479336")) {
                    return message.reply("لا يمكن طرد المطور")
                }
                if (user.id.includes("97766944")) {
                    return message.reply("لا يمكن طرد الأب الروحي")
                }
                toKick.push(user.id)
            }
        })
        // remove the duplicate ids
        toKick = [...new Set(toKick)]
        return await client.groupParticipantsUpdate(message.from, toKick, "remove").catch((e) => {
            message.reply("حدث خطأ أثناء طرد الكلب/الكلاب")
        }).then(() => {
            return message.reply("خرج كلب/كلاب من المجموعة")
        })
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
async function GroupMention(msg, client = null, includeAdmins = false) {
    const mentions = msg.groupMetadata.participants.filter((user) => {
        if (!includeAdmins) {
            return user.admin !== "admin" && user.admin !== "superadmin" && user.id !== msg.key.remoteJid
        } else {
            return user.id !== msg.key.remoteJid
        }
    }).map((user) => {
        return user.id
    })

    const text = mentions.map((jid) => `@${jid.replace(/@.+/, '')}`).join('\n')

    await msg.reply({
        text: text,
        mentions: mentions,
    });
}


export {MediaToSticker, IsAdmin, GroupMention, Kick}