// API for Manga :)
import axios from 'axios';

const headers = {
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.1.2; G011A Build/N2G48H)',
    'Connection': 'Keep-Alive',
    'Cookie': 'XSRF-TOKEN=eyJpdiI6Im02TkhrTDFVeXRCbnlPeFB6MkwzNWc9PSIsInZhbHVlIjoicFRBTFp1amZMdTIyUXRhUVRaN1pYZmRjc200YXZmOVJEVjllTGdiMHM5UmhWa2Qyd1JTTzRoQm1nRzRFTUFOZmhYNG9ManRsNUh4R0pKcFZ4VVVxaWc9PSIsIm1hYyI6IjE4YTMxZWU2MDcwM2JmMThiZWE3NjQyYjdjNDdlZjIxMzE4ZTFlNTExNGY1ZTA5Mzc4ODA3ODUyOGRkMTAwNDAifQ%3D%3D; laravel_session=eyJpdiI6Imo1WUNvTlwvNDRyTFVKSFpwUnBubmxnPT0iLCJ2YWx1ZSI6IlwvRGJvYTQ4VHRJM0lkWEQyZW1kTFFNTmhJRUM0YnlWWE93MFlLWTMzTVZhaXl1SU1LdlBLbXVXWnk4TWtpalJYRWdrWEtTaWgrOFlJUE5mYUFOSDZBQT09IiwibWFjIjoiMzdlOTAxMjE2YjgxNGNhODM0N2ZmMTEwNmJjMDllNTFmODcxOWE5Y2U4NzQyODBlMDQyNzlmY2MzNWQ4MDA3MyJ9; XSRF-TOKEN=eyJpdiI6IjFNbXpRbVwvYU10dXhLb0VNSTIrclZnPT0iLCJ2YWx1ZSI6Imp1ZDBvS3lNMkl2QlpFQW9nRG9yMGd3SXJqeUYrVUZjUmhIVnNWOWpvMU55b0pZYU9wNG55OUFySGtXMTM0RkhxS1BzOGR1QVN6ckpzcWgwN2ZvTnNBPT0iLCJtYWMiOiI4YzcxZmM4NTZmMjljODJmYTVmOGI0MWI2ZTVmNzAzYTQ2YjIxNTA3OGU0YWI2ZWYyMjk3NzYwNzk0ODk5ZDNmIn0%3D; laravel_session=eyJpdiI6InA3c3RBcXNoVTMrNUQ1MjdDRUF1dVE9PSIsInZhbHVlIjoiVEU1XC9kUjBlMjRKMDIrU3hXa0JjME5BZkRmeHQxXC8yRzkybEhhSXZqV3B3MHdTdUFSQ040UWVjeXpFWkY4MWJ1ak9qK2trdG56eFhJV0NEOThES2NxUT09IiwibWFjIjoiZGMyNmYzMzcwMjRlYmEyZTZjOGQ5OGExN2Q4ZjljZmE4M2Y3ZDVlNDQ2NjJlMmE2Y2QzZmE0MDdhM2Q2N2NiZCJ9'
}

async function SearchManage(mangaName) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://onma.top/api/v3/advanced-search?name=${mangaName}&API_key=23r1rdrYtOP0Ghgetyt6fc2`,
        headers: headers
    };

    return axios.request(config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
        });

}

async function GetMangaBySlug(mangaSlug) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://onma.me/api/v3/manga-info/${mangaSlug}?API_key=23r1rdrYtOP0Ghgetyt6fc2`,
        headers: headers
    };

    return await axios.request(config)
        .then((response) => {
            return response.data?.data?.infoManga[0];
        })
        .catch((error) => {
            console.log(error);
        });

}


async function GetMangaByName(mangaName) {
    mangaName = encodeURI(mangaName)
    let data;
    var config = {
        method: 'post',
        url: `https://api.gmanga.me/api/quick_search?query=${mangaName}&includes=["Manga"]`,
    };

    await axios(config).then(function (response) {
        let mangas = response.data[0].data;
        let manga = mangas[0]
        let sim = similarity(manga.title.toLowerCase(), mangaName.toLowerCase());
        for (let i = 1; i < mangas.length; i++) {
            let m = mangas[i];
            let s = similarity(m.title.toLowerCase(), mangaName.toLowerCase());
            if (s > sim) {
                manga = m;
                sim = s;
            }
        }

        let cats = [];
        for (let cat of manga.categories) {
            cats.push(cat.name)
        }

        let authors = [];
        for (let auth of manga.authors) {
            authors.push(auth.name)
        }
        data = {
            id: manga.id,
            title: manga.title,
            title_ar: manga.arabic_title,
            sum: manga.summary,
            url: `https://gmanga.me/mangas/${manga.id}`,
            img: `https://media.gmanga.me/uploads/manga/cover/${manga.id}/${manga.cover}`,
            chapters: manga.chaps,
            rating: manga.rating,
            type: manga.type.title,
            authors: authors,
            categories: cats,
            last_chapter: manga.latest_chapter,
        };
    })
        .catch(function (error) {
            console.log("Error happened: " + error);
        });

    return data;
}

const getMangaChapter = async (mangaName, chapter) => {
    let result = {
        code: 0,
        img: null,
        message: "Unexpected error",
    };
    await GetMangaByName(mangaName).then(async r => {
        if (r == null || r === "") {
            result.code = 404;
            result.message = "ما لقيت المانجا باللسته عندي (جرب تكتب الاسم بالانجليزي او الياباني)!!"
        } else {
            //https://gmanga.me/mangas/32/naruto/400/
            await axios.get("https://gmanga.me/mangas/" + r.id + "/" + r.title.toLowerCase().replaceAll(" ", "-") + "/" + chapter)
                .then(res => {
                    if (res.data.includes("الصفحة غير موجودة")) {
                        result.code = 404;
                        result.message = "ما لقيت الفصل اتأكد من رقم الفصل وارجع ارسل الأمر!"
                    } else {
                        result.code = 200;
                        result.img = r.img;
                        result.message = `مانجا: ${r.title}
الفصل رقم: ${chapter}

رابط القراءة: ${"https://gmanga.me/mangas/" + r.id + "/" + r.title.toLowerCase().replaceAll(" ", "-") + "/" + chapter}`
                    }
                }).catch(e => {
                    console.log("GetMangaChapter Error: " + e);
                    result.code = 400;
                    result.message = "ما قدرت اجيب الفصل... اعذرني"
                })
        }
    })

    return result;

}


function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}




// GetMangaByName("one piece").then(r => console.log(r));
// getMangaChapter("one piece", 1086).then(r => console.log(r));

export {GetMangaByName, getMangaChapter};