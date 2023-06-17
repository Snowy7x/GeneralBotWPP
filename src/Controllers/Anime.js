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
        "_limit": 20,
        "_order_by":"anime_year_desc",
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

export {GetLatestEpisodes, GetTopAnime, GetDetails, GetEpisodes};


