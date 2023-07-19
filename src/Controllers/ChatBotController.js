import CharacterAI from 'node_characterai';
const characterAI = new CharacterAI();

let chat = null;
const characterId = "6zp0pbT6ufDbOEk4uhQ1bLY14WfX7JkJchV247dBcnI"
characterAI.authenticateAsGuest().then(() => {
    characterAI.createOrContinueChat(characterId).then((c) => {
        chat = c;
    });
});


async function bardChat(msg) {
    return await chat.sendAndAwaitResponse(msg, true);
}

export default bardChat
