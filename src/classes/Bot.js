import {MediaToSticker, IsAdmin, GroupMention} from "../utils/Commands.js";
import {Format} from "../utils/Format.js";
import {Editor} from "../Controllers/Images.js";

class Bot {
    name = "Snowy";
    prefixes = [];
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
     *
     * @param {string} name
     * @param {string[]} prefixes
     * @param {object} settings
     */
    constructor(name, prefixes, settings, client) {
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
     * @param {Message} msg
     */
    async runAutoResponses(msg) {
        const autoR = this.autoResponses.find(a => a.trigger.includes(msg.body));
        if (autoR) {
            if (autoR.gIds === "all" || autoR.gIds.includes(msg.from)  || autoR.gIds.includes(this.GetGroupCat(msg.from))) {
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
     * @param {Message} msg
     * @param {string} commandName
     * @param {string[]} args
     * @returns {Promise<void>}
     */
    async runCommands(msg, commandName, args) {
        try {
            if (commandName === " " || commandName === "") {
                commandName = args.shift()
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

                let forms = []
                this.formsHelp = "الاستمارات المتاحة: \n"
                let i = 0;
                for (let sheet in sheets.sheets) {
                    forms.push({
                        index: i,
                        name: sheet,
                        form: sheets.sheets[sheet]
                    })

                    this.formsHelp += `${i}: *${sheet}*\n`
                    i++
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
                }else {
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
            while (!command && max < args.length) {
                commandName += " " + args[max]
                command = this.commands.find(c => c.alies.includes(commandName));
                max++;
            }
            if (command) {
                if (command.gIds === "all" || command.gIds.includes(msg.from) || command.gIds.includes(this.GetGroupCat(msg.from))) {
                    try {
                        const chat = await msg.getChat();
                        let isAdmin = chat.isGroup ? IsAdmin(chat, msg.author) : true;
                        if (command.onlyAdmin && !isAdmin && chat.isGroup) {
                            await msg.reply("فقط للأدمن")
                            return
                        }
                        switch (command.type) {
                            case "sticker":
                                await MediaToSticker(msg, this.client, this.name)
                                break;
                            case "help":
                                let helpList = this.commands.filter(c => {
                                    if (c.gIds === "all" || c.gIds.includes(msg.from)  || command.gIds.includes(this.GetGroupCat(msg.from))) {
                                        if (isAdmin) return true
                                        return !c.onlyAdmin
                                    }
                                    return false
                                }).map(c => {
                                    return c.usage + " - " + c.description
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
                                const mentions = await msg.getMentions();
                                /** @var Chat[] chats */
                                let chats = []
                                // TODO: If none try get from quote msg.
                                if (mentions.length < 1) {
                                    if (msg.hasQuotedMsg) {
                                        let quote = await msg.getQuotedMessage()
                                        let contact = await quote.getContact()
                                        let c = await contact.getChat()
                                        chats.push(c)
                                    }
                                } else {
                                    for (let contact of mentions) {
                                        let c = await contact.getChat()
                                        chats.push(c)
                                    }
                                }
                                // TODO: Send warning in dm.
                                let message = Array.isArray(command.response) ? command.response[Math.floor(Math.random() * command.response.length)] : command.response
                                if (command.sendTheRest) {
                                    let r = this.getArg(command, args, "msg")
                                    if (!message) {
                                        await msg.reply(command.usage)
                                        return
                                    }
                                    message = Format(message, {
                                        "msg": r
                                    })
                                }
                                for (let c of chats) {
                                    await c.sendMessage(message)
                                }
                                await msg.reply("تم!")
                                break
                            case "edit":
                                // TODO: Check if the user is admin
                                if (!isAdmin && chat.isGroup) {
                                    await msg.reply("فقط للأدمن")
                                    return
                                }
                                let m = this.getAllArgsToValues(command, args)
                                let type = commandName
                                let value = m["value"]
                                if (!value && type !== "الوان") {
                                    await msg.reply("لم يتم تحديد قيمة التعديل, القيمة ستكون 60 بشكل افتراضي")
                                    value = 60
                                }
                                // check if value is number
                                if (isNaN(value)) {
                                    await msg.reply("القيمة غير صحيحة")
                                    return
                                }
                                await Editor(type, msg, value)
                                break;
                            case "anime":
                                break;
                            case "manga":
                                break;
                            case "image":
                                break;
                            case "kick":
                                // kick
                                const ppl = await msg.getMentions();
                                if (ppl.length < 1) {
                                    if (msg.hasQuotedMsg) {
                                        let quote = await msg.getQuotedMessage()
                                        let contact = await quote.getContact()
                                        if (quote.author === msg.author) {
                                            await chat.removeParticipant(contact.id._serialized)
                                            await msg.reply(command.response)
                                            return
                                        }
                                    }
                                    await msg.reply("الرجاء وضع المنشن")
                                    return
                                }else{
                                    for (let contact of ppl) {
                                        if (contact.id._serialized === msg.author) {
                                            await chat.removeParticipant(contact.id._serialized)
                                            await msg.reply(command.response)
                                            return
                                        }
                                    }
                                }
                                break;
                            case "text":
                            default:
                                let response = Array.isArray(command.response) ? command.response[Math.floor(Math.random() * command.response.length)] : command.response;
                                if (args.length > 0) {
                                    let m = this.getAllArgsToValues(command, args)
                                    response = Format(response, m)
                                }

                                if (command.includeAll) {
                                    let chat = await msg.getChat()
                                    let media = null
                                    if (msg.hasMedia) {
                                        media = await msg.downloadMedia();
                                    }
                                    let mentions = await msg.getMentions();
                                    await chat.sendMessage(response, {
                                        media: media,
                                        mentions: mentions
                                    })
                                    return;
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
            }else if (args[a.index]) {
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
     * @param {Message} msg
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

    InitClient(cl) {
        this.client = cl;
    }

    GetGroupCat(msgFrom) {
        if (this.adminGroups.includes(msgFrom)) return "admin";
        if (this.groupIds.includes(msgFrom)) return "group";
        return "unknown";
    }

}

export default Bot;