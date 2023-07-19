import Bard from "bard-ai";

let newConversation = null
// YgglpsO7Tk3rbswYjGJqTPu0lFlzbS0xnhyXMOIUytN90PKXiXr8Sil6HytrhbPJSjKAJg.
// YwhObmjaTcyw2p8qudC5M9-mkZczMQP4uwWd-OSEdWHo6wr7J4NrnXY-ansDkEwIsNiHMw.
Bard.init("YwhObmjaTcyw2p8qudC5M9-mkZczMQP4uwWd-OSEdWHo6wr7J4NrnXY-ansDkEwIsNiHMw.").then(() => {
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
