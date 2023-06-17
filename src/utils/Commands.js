/**
 * @param {Message} message
 * @param {WAWebJS.Client} client
 * @param {string} stickerName
 * @returns {Promise<void>}
 */
async function MediaToSticker(message, client, stickerName = "SnowyBot"){
    let media, error = null;

    if (message.hasMedia){
        await message.reply("لحظات")
        media = await message.downloadMedia().catch(err => {
            console.log("General [12]: Error", err)
            error = "ما قدرت احمل الوسائط"
        })
    }else{
        if (message.hasQuotedMsg){
            const ndMessage = await message.getQuotedMessage().catch(err => {
                console.log("Commands [18]: Error", err)
            })
            if (ndMessage && ndMessage.hasMedia){
                await message.reply("لحظات")
                media = await ndMessage.downloadMedia().catch(err => {
                    //console.log("General [21]: Error", err)
                    error = "وسائط قديمة ارسلها مرا ثانيه :)"
                })
            }
        }
    }

    if (media){
        client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerAuthor: "Snowy",
            stickerName: stickerName
        }).catch(err => {
            console.log("Commands [36]: Error", err)
        }).then(() => message.reply("تم"))
    }else{
        await message.reply(error ?? "ارفق صورة/فيديو او منشنه مع الأمر")
    }
}

const IsAdmin = (chat, authorId) => {
    for (let participant of chat.participants) {
        if (participant.id._serialized === authorId) {
            return participant.isAdmin;
        }
    }
}

async function Kick(message) {
    await message.getChat().then(async chat => {
        await message.getContact().then(async contact => {
            if (IsAdmin(chat, message.author)) {
                await message.getMentions().then(async contacts => {
                    if (contacts.length > 0) {
                        if (contacts[0].isMe || contacts[0].number.includes("74479336") || contacts[0].number.includes("30446848")) {
                            message.reply("ما تقدر تطرده :)")
                            return;
                        }
                        await chat.removeParticipants([contacts[0].id._serialized]).then(
                            () => {
                                message.reply("غادر كلب المجموعه")
                            }
                        ).catch(err => {
                            message.reply("همممم مدري وش صار غلط بس مقدرت اطرده.")
                        })
                    } else {
                        message.reply("منشن شخص يا عثل")
                    }
                })
            } else {
                message.reply(`The kick command can only be used by group admins.`);
            }
        })
    });
}

/**
 *
 * @param {Message} message
 * @param {boolean} includeAdmins
 * @param client
 * @returns {Promise<void>}
 * @constructor
 */
async function GroupMention(msg, client = null, includeAdmins = false){
    const chat = await msg.getChat();

    let text = "";
    let mentions = [];

    for(let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        if (!includeAdmins && participant.isAdmin) continue;
        mentions.push(contact);
        text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
}


export {MediaToSticker, IsAdmin, GroupMention, Kick}