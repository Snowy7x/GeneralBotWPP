const fs = require("fs")
let e = `╔╦═══•< ✥⋄♠️⋄✥>•═══╦╗

‏✨[ ᏔᎬᏞᏨᏫᎷᎬ \\/ مرحہٰبٰٰا ]✨

『{username}』
『{mention}』

نرحب بك/ي أجمل ترحيب في

❝ اكينا🍁ناخت ♠️❞
‏ꕥ ━━━━━━ ֎ ━━━━━━ ꕥ
القوانين⭕️:
https://cutt.us/8kVOs

‏ꕥ ━━━━━━ ֎ ━━━━━━ ꕥ
〖A̷k̷i̷n̷a̷♠️𝗡𝗮𝗰𝗵𝘁〗
╚╩═══•< ✥⋄♠️⋄✥>•═══╩╝`
let json = {
    r: e
}

fs.writeFile("./forms.json", JSON.stringify(json), function(err) {
    if (err) {
        console.log(err)
    }else {
        console.log("Saved")
    }
})

