import {CharacterNames} from "./Anime.js";
import client, {SendMessage} from "../Client.js";
import {isSimilarWord} from "../utils/Format.js";
import fs from "fs";

class Competitions {
    competitions = [];
    client = null;

    constructor() {
        console.log("Competitions initialized");

        // check if the cache folder exists:
        if (!fs.existsSync("./cache")) {
            fs.mkdirSync("./cache");
        }

        // check if the competition.json file exists:
        if (!fs.existsSync("./cache/competition.json")) {
            fs.writeFileSync("./cache/competition.json", "{}");
        }

        // load the competitions from the cache:
        fs.readFile("./cache/competition.json", async (err, file) => {
            if (err) console.log(err);
            let jsonFile = JSON.parse(file);
            for (let group in jsonFile) {
                let comp = jsonFile[group];
                let competition = new Competition(this, comp.group, comp.maxQuestions, comp.type, comp.cat);
                this.competitions.push(competition);
                await competition.continue(comp.usedQuestions, comp.currentQuestion, comp.participants, comp.cat);
            }
        });
    }

    /**
     *
     * @param {CustomMessage} message
     */

    onMessage(message) {
        if (!message.isGroup) return;
        if (this.competitions.length === 0) return;
        let comp = this.competitions.find(c => c.group === message.from);
        if (comp) {
            comp.onMessage(message);
        }
    }

    onFinished(comp) {
        this.competitions.splice(this.competitions.indexOf(comp), 1);

        // remove the competition from the cache:
        fs.readFile("./cache/competition.json", (err, file) => {
            if (err) console.log(err);
            let jsonFile = JSON.parse(file);
            delete jsonFile[comp.group];
            fs.writeFile("./cache/competition.json", JSON.stringify(jsonFile), (err) => {
                if (err) console.log(err);
            });
        });
    }

    hasCompetition(group){
        return this.competitions.find(c => c.group === group);
    }

    createCompetition(group, maxQuestions, type, cat = "anime") {
        if (this.hasCompetition(group)) return null;
        let comp = new Competition(this, group, maxQuestions, type, cat);
        this.competitions.push(comp);
        return comp;
    }

    getCompetition(group){
        return this.competitions.find(c => c.group === group);
    }

    forceFinish(group){
        let comp = this.competitions.find(c => c.group === group);
        if (comp) {
            comp.finish();
        }
    }

    async cacheCompetition(comp){
        // get the json file:
        await fs.readFile("./cache/competition.json", async (err, file) => {
            if (err) console.log(err);
            // parse it:
            let jsonFile = JSON.parse(file);
            // save it to the json file:
            let json = {
                group: comp.group,
                cat: comp.cat,
                maxQuestions: comp.maxQuestions,
                type: comp.type,
                currentQuestion: comp.currentQuestion,
                usedQuestions: comp.usedQuestions,
                participants: comp.participants,
            }

            jsonFile[comp.group] = json;
            // write it to the file:
            await fs.writeFile("./cache/competition.json", JSON.stringify(jsonFile), (err) => {
                if (err) console.log(err);
            });
        });
    }
}

const QuestionTypes = {
    TEXT: "كتابه",
/*    IMAGE: "صور",*/
}

class Competition {
    /**
     * @type {string}
     */
    group = "";
    cat = "anime";
    maxQuestions = 0;
    questions = [];
    currentQuestion = 0;
    usedQuestions = [];
    currentExpectedAnswer = null;

    /**
     * @type {Participant[]}
     */
    participants = [];

    /**
     * @type {QuestionTypes[]}
     */
    type = null;

    /**
     * @type {Competitions}
     */
    manager = null;

    constructor(manager, group, maxQuestions, type, cat) {
        this.manager = manager;
        this.group = group;
        this.maxQuestions = maxQuestions;
        this.type = type;
        this.cat = cat;

        switch (type) {
            case QuestionTypes.TEXT:
                this.question = CharacterNames[cat];
                break;
        }
    }

    async start() {
        this.currentQuestion = 1;
        await SendMessage(this.group, {
            text: `المسابقة بدأت!
النوع: ${this.type}`,
        })
        let text = "السؤال رقم " + (this.currentQuestion) + " من " + this.maxQuestions
        switch (this.type) {
            case QuestionTypes.TEXT:
                let q = this.question[Math.floor(Math.random() * this.question.length)];
                while (this.usedQuestions.includes(q) || q.length <= 1) {
                    q = this.question[Math.floor(Math.random() * this.question.length)];
                }

                // remove the question from the list:
                this.question.splice(this.question.indexOf(q), 1);
                this.usedQuestions.push(q);
                this.currentExpectedAnswer = q;
                text += `\n\n*${q}*`;
                break;
        }
        SendMessage(this.group, text);
    }

    async continue(usedQuestions, currentQuestion, participants, cat) {
        await SendMessage(this.group, {
            text: "المسابقة مستمرة!"
        });
        this.usedQuestions = usedQuestions;
        this.currentQuestion = currentQuestion;
        this.participants = participants;
        this.cat = cat;
        this.nextQuestion();
    }

    /**
     * @param {CustomMessage} message
     */
    async onMessage(message) {
        switch (this.type) {
            case QuestionTypes.TEXT:
                if (isSimilarWord(message.body, this.currentExpectedAnswer)) {
                    if ((this.participants.find(p => p.contact === message.author))) {
                        this.participants.find(p => p.contact === message.author).points++;
                    } else {
                        let p = new Participant(message.author);
                        p.points++;
                        this.participants.push(p);
                    }
                    this.nextQuestion(message);
                }
        }
    }

    async nextQuestion(message) {
        if (this.currentQuestion >= this.maxQuestions) {
            await this.finish();
            return;
        }
        this.currentQuestion++;
        let text = "";
        let isReply = false
        if (message) {
            text = ("هنا\nالسؤال رقم " + (this.currentQuestion) + " من " + this.maxQuestions);
            isReply = true
        } else text = "السؤال رقم " + (this.currentQuestion) + " من " + this.maxQuestions
        switch (this.type) {
            case QuestionTypes.TEXT:
                let q = this.question[Math.floor(Math.random() * this.question.length)];
                while (this.usedQuestions.includes(q) || q.length <= 1) {
                    q = this.question[Math.floor(Math.random() * this.question.length)];
                }

                // remove the question from the list:
                this.question.splice(this.question.indexOf(q), 1);
                this.usedQuestions.push(q);
                this.currentExpectedAnswer = q;
                text += `\n\n*${q}*`;
                break;
        }

        if (isReply) {
            await message.reply(text);
        } else {
            await SendMessage(this.group, text);
        }

        // Cache the competition:
        await this.manager.cacheCompetition(this);
    }

    async finish() {
        // final message:
        let msg = "*المسابقة انتهت!*\n";
        msg += "مجموع الأسئلة: " + this.currentQuestion + "\n";
        msg += "النتائج:\n";

        this.participants.sort((a, b) => b.points - a.points);
        if (this.participants.length > 0) msg += "\nالأول: @" + this.participants[0].contact.split("@")[0] + " - " + this.participants[0].points;
        if (this.participants.length > 1) msg += "\nالثاني: @" + this.participants[1].contact.split("@")[0] + " - " + this.participants[1].points;
        if (this.participants.length > 2) msg += "\nالثالث: @" + this.participants[2].contact.split("@")[0] + " - " + this.participants[2].points;
        if (this.participants.length > 3) {
            msg += "\n\nالمشاركين:\n";
            for (let p of this.participants) {
                msg += `@${p.contact.split("@")[0]} - ${p.points}\n`;
            }
        }

        await SendMessage(this.group, {
            text: `${msg}`,
            mentions: this.participants.map(p => p.contact)
        });

        this.manager.onFinished(this);
    }
}


class Participant {
    /**
     * @type {string}
     */
    contact = "";
    points = 0;

    constructor(user) {
        this.contact = user;
    }
}

export {Competitions, Competition, QuestionTypes}