/*
import smartestchatbot  from 'smartestchatbot';

const client = new smartestchatbot.Client("MTAxOTY4MTk5MDY2NTg3MTM2.nwssuc.AnRPDvG8KBMRDh8AlqIVKzOqAdo");

client.chat({message:"Do you know anime naruto?", name:"SmartestChatbot", owner:"Snowy", user: "Islam"}, "ar").then(reply => {
console.log(reply);
// The module will reply based on the message!
});*/

import fs from "fs";

const forms = {
    episode: `─━── 「حلقة」─━── 
{content}
‏─━─「⊱𝑨𝒊𝒓𝒆𝒔 𖡹 𝑵𝒆𝒘𝒔📬」─━─
اللقب :|-جارفيس
`,
    news: `─━── 「خبر」─━── 
{content}
‏─━─「⊱𝑨𝒊𝒓𝒆𝒔 𖡹 𝑵𝒆𝒘𝒔📬」─━─
اللقب :|-جارفيس`
}

fs.writeFileSync("./forms.json", JSON.stringify(forms, null, 4))