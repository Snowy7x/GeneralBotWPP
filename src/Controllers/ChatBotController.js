import Bard from "bard-ai";

let newConversation = null
Bard.init("YgglpsO7Tk3rbswYjGJqTPu0lFlzbS0xnhyXMOIUytN90PKXiXr8Sil6HytrhbPJSjKAJg.").then(() => {
    newConversation = new Bard.Chat()
    newConversation.ask("You will be Snowy and you will answer only short answers only. respond with 'Ok' if you are ready").then((re) => {
        console.log("Bard is ready to chat!: " + re)
    })
})

console.log("Bard is ready to chat!")

async function bardChat(question) {
    return await newConversation.ask(question).then((re) => {
        return re.replaceAll("Bard", "Snowy").replaceAll("بارد", "سِنُوُيٍ")
    })
}

export default bardChat
