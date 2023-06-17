
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import * as Loader from "./utils/Loader.js";

const {Client, LocalAuth} = pkg;

const client = new Client({
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    },
    authStrategy: new LocalAuth()
})

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
})

client.on('ready', () => {
    console.log('Client is ready!')
})

client.on('message', async msg => {
    if (msg.author.includes("74479336")) {
        if (["snowy reload", "snowy restart", "snowy r", "s r"].includes(msg.body)) {
            Loader.Load(client)
            msg.reply("Reloaded all bots")
            return
        }

        if (["snowy get", "snowy g"].includes(msg.body)) {
            return msg.reply(msg.from)
        }

        /*if (msg.body === "print") {
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
        return*/
    }

    if (Loader.CanReply(msg)) {
        Loader.runAutoResponses(msg);
        Loader.runCommands(msg);
    }
});

export default client