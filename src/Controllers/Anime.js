// API for Anime :)
import axios from "axios";

const DETAILS_URL = "https://anslayer.com/anime/public/anime/get-anime-details";
const HEADERS = {
    "Client-Id": "android-app2",
    "Client-Secret": "7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd",
};
async function GetLatestEpisodes(limit = 20, offset = 0) {
    return await axios.get("https://anslayer.com/anime/public/animes/get-published-animes", {
        headers: HEADERS,
        params: {
            json: JSON.stringify({
                list_type: "latest_episodes",
                _limit: limit,
                _offset: offset,
            }),
        },
    })
        .then((res) => {
            return res.data.response.data.map((anime) => {
                return {
                    as_id: anime.anime_id,
                    epId: anime.latest_episode_id,
                    epName: anime.latest_episode_name,
                    status: anime.anime_status,
                }
            }).reverse();
        }).catch(err => {
            return [];
        });
}

async function GetTopAnime(limit = 50, offset = 0) {
    return await axios.get("https://anslayer.com/anime/public/animes/get-published-animes", {
        headers: HEADERS,
        params: {
            json: JSON.stringify({
                list_type: "top_currently_airing_mal",
                _limit: limit,
                _offset: offset,
            }),
        },
    })
        .then((res) => {
            return res.data.response.data.map((anime, i) => {
                return {
                    as_id: anime.anime_id,
                    rank: i + 1,
                }
            });
        }).catch(err => {
            return [];
        });
}

async function GetDetails(animeId) {
    return await axios.get(DETAILS_URL, {
        headers: HEADERS,
        params: {
            anime_id: animeId,
            fetch_episodes: "Yes",
            more_info: "Yes",
        }
    })
        .then((res) => {
            return res.data.response;
        }).catch(err => {
            // console.log("No data for id: " + animeId);
            return null;
        })
}

async function GetEpisodes(animeId) {
    return await axios.post("https://anslayer.com/anime/public/episodes/get-episodes-new", new URLSearchParams({
        inf: "",
        json: JSON.stringify({more_info: "No", anime_id: animeId}),
    }), {
        headers: HEADERS,
    }).then(res => {
        return res.data.response.data.map((episode) => {
            return {
                id: episode.episode_id,
                name: episode.episode_name,
                number: episode.episode_number,
                skipFrom: episode.episode_skip_from,
                skipTo: episode.episode_skip_to,
            }
        });
    }).catch(err => {
        // console.log("No episodes for id: " + animeId);
        return null;
    })

}

async function Search (term) {
    let latestAddedAnimes = {
        "_offset": 0,
        "_limit": 50,
        "_order_by":"anime_name_asc",
        "list_type":"filter",
        "just_info":"Yes",
        "anime_name": term ?? "",
    }

    var config = {
        method: 'get',
        url: 'https://anslayer.com/anime/public/animes/get-published-animes',
        headers: {
            'Client-Id': 'android-app2',
            'Client-Secret': '7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd'
        },

        params: {
            json: JSON.stringify(latestAddedAnimes)
        }
    };

    return await axios(config)
        .then(function (response) {
            return {
                code: 200,
                data: response.data.response.data
            }
        })
        .catch(function (error) {
            console.log("Anime [129] Error:", error)
            return {
                code: 400,
                data: error
            }
        });
}

async function GetAnimeByName(animeName) {
    let results = await Search(animeName);
    if (results.code === 200) {
        if (results.data.length === 0) {
            return null;
        }
        // Get the anime with the most similar name
        let anime = await GetDetails(results.data[0].anime_id);
        let similarityScore = similarity(anime.anime_name, animeName);
        for (let i = 1; i < results.data.length; i++) {
            let anime2 = results.data[i];
            let similarityScore2 = similarity(anime2.anime_name, animeName);
            console.log(anime2.anime_name + " " + similarityScore2);
            if (similarityScore2 > similarityScore) {
                anime = await  GetDetails(anime2.anime_id);
                similarityScore = similarityScore2;
            }
        }
        return anime;
    }else {
        return null;
    }
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

/*GetAnimeByName("Naruto (2023)").then(res => {
    console.log(res);
})*/

const Seasons = {
    Fall: "الخريف",
    Winter: "الشتاء",
    Spring: "الربيع",
    Summer: "الصيف",
}

const Status = {
    "Currently Airing": "مستمر",
    "Finished Airing": "منتهي",
    "Not Yet Aired": "لم يبدأ بعد",
}

const Types = {
    TV: "مسلسل",
    Movie: "فيلم",
    OVA: "أوفا",
    ONA: "أونا",
    Special: "حلقة خاصة",
    Music: "موسيقى",
}

export {GetLatestEpisodes, GetTopAnime, GetDetails, GetAnimeByName, GetEpisodes, Search, Seasons, Status, Types};


