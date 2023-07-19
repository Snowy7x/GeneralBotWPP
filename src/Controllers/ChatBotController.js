import Bard from "bard-ai";

await Bard.init("YgglpsO7Tk3rbswYjGJqTPu0lFlzbS0xnhyXMOIUytN90PKXiXr8Sil6HytrhbPJSjKAJg.");

const newConversation = new Bard.Chat()
console.log("Bard is ready to chat!")

async function bardChat(question) {
    return await newConversation.ask(question)
}

export default bardChat
