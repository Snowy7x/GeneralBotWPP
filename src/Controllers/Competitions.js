import {CharacterNames} from "./Anime.js";
import client, {SendMessage} from "../Client.js";
import {isSimilarWord} from "../utils/Format.js";

class Competitions {
    competitions = [];
    client = null;

    constructor() {
        console.log("Competitions initialized");
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
    }

    hasCompetition(group){
        return this.competitions.find(c => c.group === group);
    }

    createCompetition(group, maxQuestions, type) {
        if (this.hasCompetition(group)) return null;
        let comp = new Competition(this, group, maxQuestions, type);
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

    constructor(manager, group, maxQuestions, type) {
        this.manager = manager;
        this.group = group;
        this.maxQuestions = maxQuestions;
        this.type = type;

        switch (type) {
            case QuestionTypes.TEXT:
                this.question = CharacterNames
                break;
        }
    }

    start() {
        this.nextQuestion(null);
    }

    /**
     * @param {CustomMessage} message
     */
    async onMessage(message) {
        console.log(message.author + ": " + message.body)
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
                    console.log("Correct answer!");
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
            text = ("هنا\nالسؤال رقم " + (this.currentQuestion + 1) + " من " + this.maxQuestions);
            isReply = true
        }
        else text = "السؤال رقم " + (this.currentQuestion + 1) + " من " + this.maxQuestions
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
        }else{
            await SendMessage(this.group, text);
        }
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