import {Alphacoders} from "awse";

const getWallpapers = async (animeName) => {
    var english = /^[A-Za-z0-9]*$/;
    if (!english.test(animeName)) {
        return {
            error: "يسمح فقط بالحروف الانجليزية والارقام حاليا :("
        }
    }
    let result = await Alphacoders.get({
        search: animeName,
        pages: Math.floor(Math.random() * 5),
        type: "Mobile"
    })
    result = result.randomRange(10)
    return result
}

export default getWallpapers