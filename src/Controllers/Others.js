import pkg from "@kazesolo/random-anime";

const {AnimeWallpaper} = pkg;

const wall = new AnimeWallpaper();


async function GetWallpapers(search, count) {

    const results = await wall.getAnimeWall4({
        title: search,
        type: "sfw",
        page: Math.floor(Math.random() * 3) + 1
    }).catch(e => [])

    let wallpapers = results.map(wallpaper => wallpaper.image)
    // Get random count of wallpapers
    wallpapers = wallpapers.sort(() => Math.random() - Math.random()).slice(0, count)
    return wallpapers
}

async function GetRandomWallpapers(title, count, lastPage = 0) {

    let page = Math.floor(Math.random() * 3) + 1
    if (lastPage !== 0) {
        page = lastPage-1
    }
    const results = await wall.getAnimeWall4({
        title: title, type: "sfw", page: page
    }).catch(e => [])

    if (results.length < count) {
        if (page > 1) {
            return GetRandomWallpapers(title, count, page)
        }
    }

    if (results.length > count) {
        // randomize the results
        results.sort(() => Math.random() - Math.random())
        return results.slice(0, count).map(wallpaper => wallpaper.image)
    }

    return results.map(wallpaper => wallpaper.image)
}


// GetRandomWallpapers("namikaze minato", 5).then(console.log)


export default GetRandomWallpapers