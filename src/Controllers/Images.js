// Edit Images ;)
import Jimp from "jimp";
import client, {SendMessage} from "../Client.js";
import {downloadMediaMessage} from "@whiskeysockets/baileys";

async function Editor(type, message, value = 60) {
    value = parseInt(value)
    let mediaMessage = message
    // check if message is a view once message
    
    if (mediaMessage.hasMedia) {
        const media = await downloadMediaMessage(message.originalMessage, "buffer", {})

        Jimp.read(media).then(res => {
            const send = async (data, from) => {
                await SendMessage(from, {
                    image: data,
                    mimetype: "image/jpeg",
                }).catch(e => {
                    console.log("Error while sending image")
                })
            }
            switch (type) {
                default:
                case "تغبيش":
                    res.blur(value).getBase64(Jimp.AUTO, async (err, res) => {
                        if (err) return message.reply("حدث خطأ أثناء تغبيش الصورة")
                        const buffer = Buffer.from(res.replace(/^data:image\/[a-z]+;base64,/, ""), "base64")
                        await send(buffer, message.author)

                    })
                    break;
                case "زووم":
                    res.pixelate(value).getBase64(Jimp.AUTO, async (err, res) => {
                        if (err) return message.reply("حدث خطأ أثناء التزويم الصورة")
                        const buffer = Buffer.from(res.replace(/^data:image\/[a-z]+;base64,/, ""), "base64")
                        await send(buffer, message.author)
                    })
                    break;
                case "الوان":
                    res.greyscale().getBase64(Jimp.AUTO, async (err, res) => {
                        if (err) return message.reply("حدث خطأ أثناء تحويل الصورة إلى أبيض وأسود")
                        const buffer = Buffer.from(res.replace(/^data:image\/[a-z]+;base64,/, ""), "base64")
                        await send(buffer, message.author)
                    })
                    break;
            }
        }).catch(e => {
            console.log("Error: ")
        })
    }else{
        await message.reply("ارسل الصورة مع الامر")
    }

}

const grayscale = async (data) => {
    return (await new Promise((resolve, reject) => {
        Jimp.read(data).then(res => {
            res.greyscale().getBase64(Jimp.AUTO, async (err, res) => {
                resolve(res.replace(/^data:image\/[a-z]+;base64,/, ""))
            })
        }).catch(err => {
            reject(err)
        })
    }))
}

export {Editor, grayscale}