import * as Loader from "./utils/Loader.js"
import client from "./Client.js";
import {Competitions} from "./Controllers/Competitions.js";


client.initialize().then(() => {
    const competitions = new Competitions();
    client.on('message', async msg => {
        competitions.onMessage(msg);
    });
    Loader.InitClient(client, competitions)
    console.log('Client initialized!')
});