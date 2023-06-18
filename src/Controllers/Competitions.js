import {CharacterNames} from "./Anime.js";
import client from "../Client.js";

class Competitions {
    competitions = [];
    client = null;

    constructor() {
        console.log("Competitions initialized");
    }

    /**
     *
     * @param {Message} message
     */

    onMessage(message) {
        let comp = this.competitions.find(c => c.group.id._serialized === message.from);
        if (comp) {
            comp.onMessage(message);
        }
    }

    onFinished(comp) {
        this.competitions.splice(this.competitions.indexOf(comp), 1);
    }

    hasCompetition(group){
        return this.competitions.find(c => c.group.id._serialized === group);
    }

    createCompetition(group, maxQuestions, type) {
        if (this.hasCompetition(group)) return null;
        let comp = new Competition(this, group, maxQuestions, type);
        this.competitions.push(comp);
        return comp;
    }
}

const QuestionTypes = {
    TEXT: "كتابة",
/*    IMAGE: "صور",*/
}

class Competition {
    /**
     * @type {GroupChat}
     */
    group = null;
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
        this.nextQuestion();
    }

    /**
     * @param {Message} message
     */
    async onMessage(message) {
        switch (this.type) {
            case QuestionTypes.TEXT:
                if (message.body === this.currentExpectedAnswer) {
                    if ((this.participants.find(p => p.contact.id._serialized === message.author))) {
                        this.participants.find(p => p.contact.id._serialized === message.author).points++;
                    } else {
                        let contact = await client.getContactById(message.author);
                        let p = new Participant(contact);
                        p.points++;
                        this.participants.push(p);
                    }
                    this.nextQuestion();
                }
        }
    }

    nextQuestion() {
        if (this.currentQuestion >= this.maxQuestions) {
            this.finish();
            return;
        }
        this.group.sendMessage(`السؤال رقم ${this.currentQuestion + 1} من ${this.maxQuestions}`);
        this.currentQuestion++;
        switch (this.type) {
            case QuestionTypes.TEXT:
                let q = this.question[Math.floor(Math.random() * this.question.length)];
                // remove the question from the list:
                this.question.splice(this.question.indexOf(q), 1);
                this.usedQuestions.push(q);
                this.currentExpectedAnswer = q;
                this.group.sendMessage(`*${q}*`);
                break;
        }
    }

    async finish() {
        // final message:
        let msg = "المسابقة انتهت!\n";
        msg += "النتائج:\n";
        for (let p of this.participants) {
            msg += `@${p.contact.id.user}: ${p.points}\n`;
        }
        await this.group.sendMessage(msg, {mentions: this.participants.map(p => p.contact)});
        this.manager.onFinished(this);
    }
}


class Participant {
    /**
     * @type {Contact}
     */
    contact = null;
    points = 0;

    constructor(user) {
        this.contact = user;
    }
}

export {Competitions, Competition, QuestionTypes}