// Edit Images ;)
import Jimp from "jimp";
import client from "../Client.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;

async function Editor(type, message, value = 60) {
    value = parseInt(value)
    let mediaMessage = message
    // check if message is a view once message

    
    if (mediaMessage.hasMedia) {
        let media = await mediaMessage.downloadMedia().catch(err => {
            console.log("Editor Manager[31] Error: ", err)
            message.reply("ارجع ارسل االصورة ما قدرت احمل الموجودة")
        })
        Jimp.read(new Buffer.from(media.data, 'base64')).then(res => {
            const send = async (data, from) => {
                let editedMedia = await new MessageMedia(media.mimetype, data, "Edited_" + media.filename)
                client.sendMessage(from, editedMedia).then(res => {
                    message.reply("ارسلتها عالخاص")
                    mediaMessage.delete(true)
                })
            }
            switch (type) {
                default:
                case "تغبيش":
                    res.blur(value).getBase64(Jimp.AUTO, async (err, res) => {
                        await send(res.replace(/^data:image\/[a-z]+;base64,/, ""), message.author)
                    })
                    break;
                case "زووم":
                    res.pixelate(value).getBase64(Jimp.AUTO, async (err, res) => {
                        await send(res.replace(/^data:image\/[a-z]+;base64,/, ""), message.author)
                    })
                    break;
                case "الوان":
                    res.greyscale().getBase64(Jimp.AUTO, async (err, res) => {
                        await send(res.replace(/^data:image\/[a-z]+;base64,/, ""), message.author)
                    })
                    break;
            }
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