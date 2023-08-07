import axios from "axios";
import fs from "fs";

const formData = new FormData();
let imagePath = "./R.jpg";

// convert local image to buffer
let base64 = fs.readFileSync(imagePath, {encoding: 'base64'});
let buffer = Buffer.from(base64, 'base64');

let imageBlob = new Blob([buffer], {type: "image/jpeg"});

formData.append("image", imageBlob);

axios.post("https://api.trace.moe/search", {
    body: formData
}).then(r => {
    console.log(r);
}).catch(e => {
    console.log(e);
})