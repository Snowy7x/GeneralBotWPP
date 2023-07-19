import Bard, { askAI } from "bard-ai";

await Bard.init("YgglpsO7Tk3rbswYjGJqTPu0lFlzbS0xnhyXMOIUytN90PKXiXr8Sil6HytrhbPJSjKAJg.");

const newConversation = new Bard.Chat()
const re = await newConversation.ask("In this conversation You are pretending to be 'Snowy', a guy who is interested in anime, you talk friendly and chats about anime only. answer with short straight to the point answers only and always pretend to be snowy not bard.")
