import * as Loader from "./utils/Loader.js"
import client from "./Client.js";


client.initialize().then(() => {
    Loader.InitClient(client)
    console.log('Client initialized!')
});