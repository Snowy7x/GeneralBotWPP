import {MediaToSticker, IsAdmin, GroupMention, Kick} from "../utils/Commands.js";
import {AraNumberToEng, Format} from "../utils/Format.js";
import {Editor} from "../Controllers/Images.js";
import {GetAnimeByName, Seasons, Status, Types} from "../Controllers/Anime.js";
import {QuestionTypes} from "../Controllers/Competitions.js";
import GetRandomWallpapers from "../Controllers/Others.js";
import {SendMessage} from "../Client.js";
import {GetMangaByName, getMangaChapter} from "../Controllers/Manga.js";
import {downloadMediaMessage} from "@whiskeysockets/baileys";

class User {
    author = null
    isAdmin= false
    group= null
    lastCmdTime= null
    lastCmd= null

    constructor(author, isAdmin, group) {
        this.author = author;
        this.isAdmin = isAdmin;
        this.group = group;
    }

    setLastCmd(cmd) {
        this.lastCmd = cmd;
        this.lastCmdTime = Date.now();
    }
}

class Bot {
    name = "Snowy";
    prefixes = [];
    /** @type {[] | string} */
    groups = [];
    autoResponses = [];
    defaultResponse = ""
    commands = [];
    groupIds = [];
    client = null
    forms = []
    formsCommand = []
    adminGroups = []
    publicGroups = []
    formsHelp = ""
    sheets = []
    /**
     * @type {Competitions}
     */
    comps = null
    users = []

    /**
     *
     * @param {string} name
     * @param {string[]} prefixes
     * @param {object} settings
     */
    constructor(name, prefixes, settings) {
        this.name = name;
        this.groups = settings.groups;
        this.autoResponses = settings.autoResponses;
        this.prefixes = prefixes;
        this.commands = settings.commands.map(c => {
            return {
                gIds: c.gIds,
                command: c.command,
                alies: c.alies || [c.command],
                description: c.description || "",
                type: c.type || "text",
                response: c.response || [],
                failResponse: c.failResponse || "Something wrong happened!",
                usage: c.usage || "",
                onlyAdmin: c.hasOwnProperty("onlyAdmin") ? c.onlyAdmin : false,
                showInList: c.hasOwnProperty("showInList") ? c.showInList : true,
                params: c.params || [],
                args: c.args || [],
                sendTheRest: c.hasOwnProperty("sendTheRest") ? c.sendTheRest : false,
                includeAll: c.hasOwnProperty("includeAll") ? c.includeAll : false,
            }
        });
        this.defaultResponse = settings.defaultResponse
        this.publicGroups = this.groups.filter(g => g.public !== "").map(g => g.public);
        this.adminGroups = this.groups.filter(g => g.admin !== "").map(g => g.admin);
        this.groupIds = [...this.publicGroups, ...this.adminGroups];

        if (settings.hasForms) {
            this.forms = settings.forms;
            this.formsCommand = settings.formsCommand
        }

        if (settings.sheets) {
            this.sheets = settings.sheets
        }

    }

    /**
     *
     * @param {CustomMessage} msg
     */
    async runAutoResponses(msg) {
        const autoR = this.autoResponses.find(a => a.trigger.includes(msg.body));
        if (autoR) {
            const gName = this.GetGroupCat(msg.from)
            if (autoR.gIds === "all" || autoR.gIds.includes(msg.from) || autoR.gIds === gName || autoR.gIds.includes(gName)) {
                let reply = autoR.response[Math.floor(Math.random() * autoR.response.length)]
                let auth = (await msg.getContact()).pushname
                reply = Format(reply, {
                    sender: auth
                })
                await msg.reply(reply)
            }
        }
    }

    /**
     *
     * @param {CustomMessage} msg
     * @param {string} commandName
     * @param {string[]} args
     * @returns {Promise<void>}
     */
    async runCommands(msg, commandName, args) {
        try {
            if (commandName === " " || commandName === "") {
                commandName = args.shift()
            }

            // Add a timeout to the commands to prevent spamming
            // The timeout is 30 second
            let user = this.users.find(u => u.author === msg.from)
            if (user && user.lastCmdTime !== null) {
                let now = new Date()
                let diff = now - user.lastCmdTime
                if (diff < 30000) {
                    await msg.reply("يجب عليك الانتظار 30 ثانية بين كل أمر")
                    return
                }
            }

            if (this.formsCommand.includes(commandName)) {
                // OLD WAY
                /*if (this.adminGroups.includes(msg.from)) {
                    if (!args[0] || args.join("").length < 1) return await msg.reply(this.formsHelp)
                    let form = this.forms.find(f => f.name === args.join(" "))
                    if (form) {
                        await msg.reply(form.form)
                    }else {
                        await msg.reply("الاستمارة غير موجودة")
                        await msg.reply(this.formsHelp)
                    }
                }*/

                // new way
                /**
                 * Sheets format:
                 * [
                 *  groups: ["id1", "id2"],
                 *  replacements: [
                 *     "toReplace": "replaceWith
                 *  ]
                 *  sheets: [
                 *     "sheetName": "sheet"
                 *  ]
                 * ]
                 */

                    // check if in suitable group
                    // 1: Get the group name from the groups array
                let group = this.groups.find(g => g.admin === msg.from || g.public === msg.from)
                // 2: Get the form sheets from the sheets array
                let sheets = this.sheets.find(s => s.groups.includes(msg.from))
                // 3: Check if the sheets is valid
                if (!sheets) {
                    await msg.reply("لا يوجد استمارات متاحة لهذه المجموعة")
                    return
                }

                let hasTypes = sheets.hasOwnProperty("types");
                let forms = []
                this.formsHelp = "الاستمارات المتاحة: \n"
                let i = 0;
                if (hasTypes) {
                    for (let sheet in sheets.sheets) {
                        if (hasTypes) {
                            this.formsHelp += `*${sheets.types[sheet]}*\n`
                            for (let actualSheet in sheets.sheets[sheet]) {
                                forms.push({
                                    index: i,
                                    name: actualSheet,
                                    form: sheets.sheets[sheet][actualSheet]
                                })
                                this.formsHelp += `${i}: *${actualSheet}*\n`
                                i++
                            }
                        }
                    }
                }else{
                    for (let sheet in sheets.sheets) {
                        forms.push({
                            index: i,
                            name: sheet,
                            form: sheets.sheets[sheet]
                        })

                        this.formsHelp += `${i}: *${sheet}*\n`
                        i++
                    }
                }

                let sheetName = args.join(" ")
                if (!sheetName || sheetName.length < 1) {
                    await msg.reply(this.formsHelp)
                    return
                }
                let formToSend = null
                // check if numeric
                if (!isNaN(sheetName)) {
                    let form = forms.find(f => f.index === parseInt(sheetName))
                    if (form) {
                        formToSend = form.form
                    }
                } else {
                    // 4: Check if the form is valid
                    formToSend = sheets.sheets[sheetName]
                }
                if (!formToSend || formToSend.length < 1) {
                    await msg.reply("الاستمارة غير موجودة")
                    await msg.reply(this.formsHelp)
                    return
                }
                // 5: Replace the form with the replacements
                const replacements = sheets.replacements[group.name];
                for (let id in replacements) {
                    if (formToSend.includes(id)) {
                        // replace all the ids with the replacements
                        formToSend = formToSend.replaceAll(`{${id}}`, replacements[id])
                    }
                }

                // 6: Send the form
                await msg.reply(formToSend)
                return;
            }

            let command = this.commands.find(c => c.alies.includes(commandName));
            let max = 0;

            // try get a command with spaces
            while (!command && max < args.length) {
                commandName += " " + args[max]
                command = this.commands.find(c => c.alies.includes(commandName));
                max++;
            }

            if (command) {
                let gName = this.GetGroupCat(msg.from)
                if (command.gIds === "all" || command.gIds.includes(msg.from) || command.gIds.includes(gName)) {
                    try {
                        if (this.comps && this.comps.hasCompetition(msg.from)) {
                            if (command && command.type !== "comp") {
                                await msg.reply("يوجد مسابقة جارية، يرجى الانتظار حتى انتهاء المسابقة")
                                return
                            }
                        }
                        const chat = msg.from
                        let isAdmin = msg.isGroupAdmin;
                        if (command.onlyAdmin && !isAdmin) {
                            await msg.reply("فقط للأدمن")
                            return
                        }
                        // Add the user to the users array
                        if (!this.users.find(u => u.author === msg.from)) {
                            let user = new User(
                                msg.author,
                                isAdmin,
                                chat
                            );
                            user.setLastCmd(command)
                            this.users.push(user)
                        } else {
                            let user = this.users.find(u => u.author === msg.from)
                            user.setLastCmd(command)
                        }
                            console.log("Command type: " + command.type)
                        switch (command.type) {
                            case "comp":
                                return msg.reply("هذا الأمر موقوف حاليا")
                                switch (commandName) {
                                    case "مسابقة":
                                    case "مسابقه":
                                        if (args.length < 1) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        if (!msg.isGroup) {
                                            await msg.reply("هذا الأمر للمجموعات فقط")
                                            return
                                        }

                                        if (this.comps.hasCompetition(msg.from)) {
                                            await msg.reply("لديك مسابقة قيد التقديم")
                                            return
                                        }

                                        let types = ""
                                        for (let type in QuestionTypes) {
                                            types += QuestionTypes[type] + ", "
                                        }
                                        types = types.substring(0, types.length - 2)

                                        let comType = this.getArg(command, args, "type")

                                        if (!comType) {
                                            await msg.reply("الأنواع المتاحة: " + types)
                                            return
                                        }

                                        // check if the type is valid
                                        if (Object.values(QuestionTypes).indexOf(comType) < 0) {
                                            await msg.reply("الأنواع المتاحة: " + types)
                                            return
                                        }

                                        let questionsCount = this.getArg(command, args, "questions")
                                        if (!questionsCount) {
                                            await msg.reply("يجب تحديد عدد الأسئلة")
                                            return
                                        }
                                        if (isNaN(questionsCount)) {
                                            await msg.reply("عدد الأسئلة يجب أن يكون رقم")
                                            return
                                        }
                                        questionsCount = parseInt(questionsCount)
                                        if (questionsCount < 1) {
                                            await msg.reply("عدد الأسئلة يجب أن يكون أكبر من 0")
                                            return
                                        }

                                        if (questionsCount > 300) {
                                            await msg.reply("عدد الأسئلة يجب أن يكون أقل من 300")
                                            return
                                        }

                                        let comp = this.comps.createCompetition(chat, questionsCount, comType);
                                        if (comp) {
                                            await msg.reply("تم بدأ المسابقة")
                                            comp.start()
                                        } else {
                                            await msg.reply("لم أسطتع بدأ مسابقة في هذه المجموعة")
                                        }
                                        break;
                                    case "انهي":
                                    case "انهى":
                                    case "انهاء":
                                        if (!msg.isGroup) {
                                            msg.reply("هذا الأمر للمجموعات فقط")
                                        }

                                        if (!msg.isGroupAdmin) {
                                            msg.reply("فقط للأدمن")
                                        }

                                        if (!this.comps.hasCompetition(msg.from)) {
                                            msg.reply("لا يوجد مسابقة قيد التقديم")
                                            return
                                        }

                                        this.comps.forceFinish(msg.from)
                                        msg.reply("تم إنهاء المسابقة")

                                        break;
                                }
                                break;
                            case "sticker":
                                await MediaToSticker(msg, this.client, this.name)
                                break;
                            case "help":
                                let helpList = "الأوامر المتاحة: \n"

                                helpList += this.commands.filter(c => {
                                    if (c.gIds === "all" || c.gIds.includes(msg.from) || c.gIds === gName || c.gIds.includes(gName)) {
                                        if (isAdmin) return true
                                        return !c.onlyAdmin
                                    }
                                    return false
                                }).map(c => {
                                    return c.usage + " - " + c.description + "\n"
                                }).join("\n")
                                await msg.reply(helpList)
                                break;
                            case "mention":
                                let includeAdmins = this.hasParam(command, args, "includeAdmins")
                                await GroupMention(msg, this.client, includeAdmins)
                                break;
                            case "mention admins":
                                await GroupMention(msg, this.client, true)
                                break;
                            case "dm":
                                // TODO: Check for mentions.
                                if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                                    let mentions = msg.message.extendedTextMessage.contextInfo.mentionedJid

                                    let text = Array.isArray(command.response) ? command.response[Math.floor(Math.random() * command.response.length)] : command.response
                                    if (command.sendTheRest) {
                                        let r = this.getArg(command, args, "msg")
                                        if (!text) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        // replace all mentions
                                        for (let mention of mentions) {
                                            r = r.replaceAll("@" + mention.split("@")[0], "")
                                        }
                                        text = Format(text, {
                                            "msg": r
                                        })
                                    }
                                    for (let mention of mentions) {
                                        SendMessage(mention, {
                                            text: text,
                                        })
                                    }
                                }

                                await msg.reply("تم!")
                                break
                            case "edit":
                                let m = this.getAllArgsToValues(command, args)
                                let type = commandName
                                let value = m["value"]
                                if (!value && type !== "الوان") {
                                    await msg.reply("لم يتم تحديد قيمة التعديل, القيمة ستكون 60 بشكل افتراضي")
                                    value = 60
                                }
                                // check if value is number
                                if (isNaN(value) && type !== "الوان") {
                                    await msg.reply("القيمة غير صحيحة")
                                    return
                                }
                                if (type !== "الوان") {
                                    value = parseInt(value)
                                    if (value < 1) {
                                        await msg.reply("القيمة يجب أن تكون أكبر من 0")
                                        return
                                    }

                                    if (value > 100) {
                                        await msg.reply("القيمة يجب أن تكون أقل من 100")
                                        return
                                    }
                                }
                                await Editor(type, msg, value)
                                break;
                            case "anime":
                                switch (commandName) {
                                    case "أنمي":
                                    case "anime":
                                    case "انمي":
                                        // TODO: Get the anime by name.
                                        let animeName = this.getArg(command, args, "animeName")
                                        if (!animeName) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        msg.reply("جاري البحث...")
                                        let anime;
                                        try {
                                            anime = await GetAnimeByName(animeName)
                                        } catch (e) {
                                            anime = null
                                        }
                                        if (!anime) {
                                            await msg.reply("لم يتم العثور على الأنمي")
                                            return
                                        }
                                        let form = command.response
                                        form = Format(form, {
                                            "animeName": anime.anime_name,
                                            "animeDesc": anime.anime_description,
                                            "animeYear": anime.anime_release_year,
                                            "animeStatus": Status[anime.anime_status],
                                            "animeEpisodes": anime.episodes?.count,
                                            "ageRating": anime.anime_age_rating,
                                            "animeRating": anime.anime_rating,
                                            "animeGenre": anime.anime_genres,
                                            "animeType": Types[anime.anime_type],
                                            "animeSeason": anime.anime_season.length > 0 ? Seasons[anime.anime_season] : "غير معروف",
                                        });
                                        await msg.reply({
                                            caption: form,
                                            image: {url: anime.anime_banner_image_url ?? anime.anime_cover_image_full_url ?? anime.anime_cover_image_url}
                                        })
                                        break;

                                    case "بحث":
                                        // TODO: ...
                                        break

                                    case "حلقات":
                                        // TODO: ...
                                        break

                                }
                                break;
                            case "manga":
                                switch (commandName) {
                                    case "مانجا":
                                    case "manga":
                                        // TODO: Get the anime by name.
                                        let mangaName = this.getArg(command, args, "mangaName")
                                        if (!mangaName) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        msg.reply("جاري البحث...")
                                        let manga;
                                        try {
                                            manga = await GetMangaByName(mangaName)
                                        } catch (e) {
                                            manga = null
                                        }
                                        if (!manga) {
                                            await msg.reply("لم يتم العثور على المانجا")
                                            return
                                        }
                                        let form = command.response
                                        form = Format(form, {
                                            "mangaName": manga.title,
                                            "mangaDesc": manga.sum,
                                            "mangaChapters": manga.chapters ?? manga.last_chapter ?? "غير معروف",
                                            "mangaAuthors": manga.authors.join(", "),
                                            "mangaRating": manga.rating,
                                            "mangaGenre": manga.categories.join(", "),
                                            "mangaType": manga.type,
                                            "lastChapter": manga.last_chapter ?? "غير معروف",
                                        });

                                        await msg.reply({
                                            caption: form,
                                            image: {url: manga.img}
                                        })
                                        break;

                                    case "بحث":
                                        // TODO: ...
                                        break

                                    case "شابتر":
                                    case "chapter":
                                        // TODO: ...
                                        let mangaName2 = this.getArg(command, args, "mangaName")
                                        if (!mangaName2) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        let chapter = this.getArg(command, args, "chapter")
                                        if (!chapter) {
                                            await msg.reply(command.usage)
                                            return
                                        }
                                        if (isNaN(chapter)) {
                                            let chapter = AraNumberToEng(chapter)
                                            if (isNaN(chapter)) {
                                                await msg.reply("رقم الشابتر غير صحيح")
                                                return
                                            }
                                        }
                                        msg.reply("جاري البحث...")
                                        let result = await getMangaChapter(mangaName2, chapter)
                                        if (result.code !== 200) {
                                            await msg.reply("لم يتم العثور على الشابتر")
                                            return
                                        } else {
                                            await msg.reply({
                                                caption: result.message,
                                                image: {url: result.img}
                                            })
                                        }
                                        break
                                }
                                break;
                            case "image":
                                let search = this.getArg(command, args, "search")
                                if (!search) {
                                    await msg.reply(command.usage)
                                    return
                                }
                                let wallpapers = await GetRandomWallpapers(search, 4)
                                if (!wallpapers || wallpapers.length === 0) {
                                    await msg.reply("لم يتم العثور على صور")
                                    return
                                }

                                for (let wallpaper of wallpapers) {
                                    msg.reply({
                                        image: {url: wallpaper}
                                    })
                                }
                                break;
                            case "kick":
                                // kick
                                await Kick(msg)
                                break;
                            case "replacement":
                                let text_ = Array.isArray(command.response) ? command.response[Math.floor(Math.random() * command.response.length)] : command.response;

                                if (args.length > 0) {
                                    let m = this.getAllArgsToValues(command, args)
                                    if (m["mention"]){
                                        if (msg.originalMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                                            msg.originalMessage.message?.imageMessage?.contextInfo?.mentionedJid) {
                                            let mentions = msg.originalMessage.message?.extendedTextMessage?.contextInfo.mentionedJid || msg.originalMessage.message?.imageMessage?.contextInfo.mentionedJid
                                            if (mentions.length > 0) {
                                                m["mention"] = "@"+mentions[0].split("@")[0]
                                            }
                                        }else {
                                            m["mention"] = ""
                                        }
                                    }
                                    text_ = Format(text_, m)
                                }

                                if (command.includeAll) {
                                    if (msg.hasMedia) {
                                        let media = await downloadMediaMessage(msg.originalMessage, "buffer", {})
                                        await SendMessage(msg.from, {
                                            caption: text_,
                                            image: media,
                                            mentions: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || msg.message?.imageMessage?.contextInfo?.mentionedJid
                                        })
                                        return;
                                    }else {
                                        await SendMessage(msg.from, {
                                            text: text_,
                                            mentions: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || msg.message?.imageMessage?.contextInfo?.mentionedJid
                                        })
                                    }
                                }else {
                                    await SendMessage(msg.from, {
                                        text: text_,
                                        mentions: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || msg.message?.imageMessage?.contextInfo?.mentionedJid
                                    })
                                }
                                break;
                            case "text":
                            default:
                                console.log("Text")
                                let response = Array.isArray(command.response) ? command.response[Math.floor(Math.random() * command.response.length)] : command.response;
                                if (args.length > 0) {
                                    let m = this.getAllArgsToValues(command, args)
                                    response = Format(response, m)
                                }

                                if (command.includeAll) {
                                    /*let chat = await msg.getChat()
                                    let media = null
                                    if (msg.hasMedia) {
                                        media = await msg.downloadMedia();
                                    }
                                    let mentions = await msg.getMentions();
                                    await chat.sendMessage(response, {
                                        media: media,
                                        mentions: mentions
                                    })
                                    return;*/
                                }
                                await msg.reply(response);
                                break;
                        }
                    } catch (e) {
                        await msg.reply(command.failResponse);
                        console.log(e)
                    }
                }
            } else {
                await msg.reply(this.defaultResponse)
            }
        } catch (e) {
            // reply with default message:
            await msg.reply(this.defaultResponse)
            console.log(e)
        }
    }

    hasParam(command, args, toFind) {
        for (let param of command.params) {
            if (param.hasOwnProperty(toFind)) {
                for (let a of param.alies) {
                    if (args.includes(a)) {
                        return true;
                    }
                }
            }
        }
        return false
    }

    getArg(command, args, expected) {
        let a = command.args.find(x => x.name === expected)
        if (a) {
            if (a.index === "all") {
                if (args.length > 0) {
                    return args.join(" ")
                }
            } else if (a.index === "all-1") {
                if (args.length > 0) {
                    return args.slice(0, args.length - 1).join(" ")
                }
            }else if (a.index === "last" || a.index === -1) {
                if (args.length > 0) {
                    return args[args.length - 1]
                }
            } else if (args[a.index]) {
                return args[a.index]
            }
        }

        return null
    }

    getAllArgsToValues(command, args) {
        let map = {}
        for (let a of command.args) {
            if (a.index > args.length - 1) break;
            map[a.name] = args[a.index]
        }

        return map;
    }

    /**
     *
     * @param {CustomMessage} msg
     * @param {string} prefix
     * @returns {boolean}
     */
    canReply(msg, prefix = "") {
        if (prefix === "" && this.prefixes.length > 0) {
            prefix = this.prefixes[0]
        }
        return this.groupIds.includes(msg.from) && this.prefixes.includes(prefix)
    }

    /**
     *
     * @returns {*[]}
     */
    getGroupsIds() {
        return this.groupIds;
    }

    InitClient(cl, comps) {
        this.client = cl;
        this.comps = comps;
    }

    GetGroupCat(msgFrom) {
        if (this.adminGroups.includes(msgFrom)) return "admin";
        if (this.groupIds.includes(msgFrom)) return "public";
        return "unknown";
    }

}

export default Bot;