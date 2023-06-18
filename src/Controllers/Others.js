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

async function GetRandomWallpapers(count) {
    const results = await wall.getAnimeWall3().catch(e => [])

    let wallpapers = results.map(wallpaper => wallpaper.image)
    // Get random count of wallpapers
    wallpapers = wallpapers.sort(() => Math.random() - Math.random()).slice(0, count)
    return wallpapers
}

GetRandomWallpapers(5).then(console.log)

export default GetWallpapers