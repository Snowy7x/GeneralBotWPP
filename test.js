import CharacterAI from 'node_characterai';
const characterAI = new CharacterAI();

(async() => {
    await characterAI.authenticateAsGuest();

    const characterId = "8_1NyR8w1dOXmI1uWaieQcd147hecbdIK7CeEAIrdJw" // Discord moderator

    const chat = await characterAI.createOrContinueChat(characterId);
    const response = await chat.sendAndAwaitResponse('Hello discord mod!', true)

    console.log(response);
    // use response.text to use it in a string.
})();