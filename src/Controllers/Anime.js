// API for Anime :)
import axios from "axios";
import {normalizeArabicWord} from "../utils/Format.js";

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
        if (!results.data || results.data.length === 0) {
            return null;
        }
        // Get the anime with the most similar name
        let anime = await GetDetails(results.data[0].anime_id);
        let similarityScore = similarity(anime.anime_name, animeName);
        for (let i = 1; i < results.data.length; i++) {
            let anime2 = results.data[i];
            let similarityScore2 = similarity(anime2.anime_name, animeName);
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

/*GetAnimeByName("yuukoko no moriarty").then(res => {
    console.log(res);
});*/

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

let CharacterNames = "ايدا, فيجيتا, شادو, سانجي, فرانكي, تشويا, كينشن, غابي, يوليوس, دراكن, لاو, نانامي, اينز, تشيفويو, زابوزا, فالكو, يوسانو, غارب, ويس, ايما, كاتشان, زاراكي, ايزن, سوغو, شيسوي, دانزو, شانكس, كاكاشي, نيزوكو, هاك, كونان, جينتا, ساكورا, كاغياما, راي, تشوبر, مايكي, شين, هيدي, ساواكي, سوتا, كوبي, هانما, ساي, كوشينا, باجي, يونو, بوروتو, غاليارد, تسوكيشيما, سيلفا, سابو, مومو, سيباستيان, اينوماكي, باغي, يونا, دايدا, دون, سايكي, توغو, ساتو, شيغاراكي, ميتسوهيكو, ميكايلا, زاك, بيبو, هاتوري, توكا, ماهيتو, شوكا, فودكا, ال, سيرا, شويو, فيتان, ديكو, فيل, دايسكي, الوكارد, الوكا, ماتسودا, بيلموت, نير, كو, هيلينغ, فايوليت, فوجيورا, كروكودايل, فوجيتورا, تاكاجي, يومي, سوي, باكي, سيلفر, شويتشي, كاناي, كيلوا, توغا, ايتادوري, شوتو, هيسوكا, يوكيكو, شارلوك, كاي, ايس, يوكو, ميريوم, غوجو, ميامورا, هينا, كيوكا, كيد, شيغوري, يوجي, شينوميا, يامي, كاغويا, ايزومي, ماي, ريم, هيوري, ريوك, لايت, يوكي, كايتو, كيد, بوجي, ميسا, ياتو, ياماموتو, ياماتو, ساكاموتو, داي, شيروغاني, اكيتو, ميتسوري, يوهاباخ, كيريتو, غوك, بلاك, ويليام, باكوغو, فريديريكا, تودوروكي, تنغين, ايناهو, كورو, غوكو, ايروكا, اسونا, استا, اوبيتو, اسوما, يور, رم, روري, رايلي, رام, ران, ارثر, سويفون, ايتشيغو, غلين, ليفاي, ارمين, كايدو, شينوا, غون, ميناتو, غاي, شينو, نورمان, كيسامي, كيساكي, كيو, يوساكو, غيومي, غورين, غيو, اوروتشيمارو, ريمورو, جاك, يوكيو, ميساكي, جين, رين, هوتارو, هيرو, ايرين, ماكوتو, ايروين, هيتش, لي, دابي, سونغ, دازاي, داكي, ساراتوبي, روكيا, هيدان, كاكوزو, ريكا, روكا, ساسكي, تانجيرو, شينوبو, ماكي, رينغوكو, اينو, تن, تن, انوس, اوسين, اينوسكي, ادوارد, زينتسو, ميغومي, مارني, سايا, اكازا, ناخت, شارلوت, اودين, توكيتو, كورازون, كينغ, سايتاما, فوجينوما, جينوس, لوفي, سوما, ساواكو, غارو, آش كيتشام, أراماكي, أكاينو, ألفونس إلريك, ألن والكر, أوبيتو أوتشيها, أوروتشيمارو, أوسوب, أوكيجي, أوم , إدوارد نيوجيت, إدورد إلريك, إرين ييغر, إسوكي هوندو, إكس دريك, إل , إيتاتشي أوتشيها, إيتشيغو كوروساكي, إيتشيمارو غين, إيثان هوندو, إيزوكو ميدوريا, إينوياشا , إينيل, اسكانور , الخطايا السبع المميتة , بارتولوميو, بارثولوميو كوما, باردوك, باسكال , هوكينز, باكورا, بروك , بروك , برولي, بريان كرايفورد , بسام, بوروتو أوزوماكي, بولي , بياكويا كوتشيكي, بيجيتا, بيروس, بيسكو , بيكا , بيكولا , بيلامي, تاداشي هامادا, تاكيرو تاكيشي, تانجيرو كامادو, تايتشي ياجامي, ترافلجار لو, ترانكس, تسوتومو أكاي, تشوبيتس, توشيرو هيتسوغايا, تومواكي أرايدي, توني توني تشوبر, جاغوار دي ساول, جاوثر , جو كيدو, جوزو, جوزو ميغوري, جوهان, جيرايا, جيرين , جيسوس بورجس, جيكو موريا, جيمز بلاك , جيناي, جينبيه ماتسودا, داز بونز, دورايمون , دون كريج, دون كيهوتي دوفلامنغو, ديان , ديدارا, دينجي, ديو براندو, رانما ساوتومي, راو , راينر براون, روب لوتشي, رورونوا زورو, روك لي, روي موستانج, ري فورويا, ريكاردو إسباداس , رينجي أباراي, ريوك, زاماسو, زانجيف , زيف , سابو, ساتورو غوجو, ساسوكي أوتشيها, ساغارا سانوسكي, سانجي, سايتاما , سايتو هاجيمي , سباندام, ستيتش, سرعة الصوت سونيك, سكار, سكراتشمين آبو, سل , سموكر, سوبارو أوكيا, سوبر بو, سورا تاكينوتشي, سوزاكو كوروروجي, سوسكي آيزن, سون غوكو, سيتا سوجيرو, سيتو كايبا, سيرخيو باتيستا, سيزار كلاون, سينجوكو, سينشي كودو, شانكس, شوكيتشي هانيدا, شويتشي أكاي, شيشيو ماكوتو, شيكامارو نارا, شينجي إيكاري, شينوموري آوشي, غارا, غالدينو , غريب غسان , غون فريكس, غيلد تيسورو, غينتا كوجيما, غيندو إيكاري, فان أوغر, فريزر , فريق المتحرين الصغار, فوجيتورا, فوكسي , فيتان, فيرغو, فيستا , فينكس , كابتن كورو, كابتن هارلوك, كاريبو , كافنديش , كاكاشي هاتاكي, كاكو, كانسوكي ياماتو, كانينوري واكيتا, كاورو ناغيسا, كايتو كيد, كايدو , كن كانيكي, كوبي , كوجي, كوجي هانيدا, كوريرين, كوشيرو إيزومي, كوغورو موري, كونان إدوغاوا, كيزارو, كيغو اسانو, كيلر , كينباتشي زاراكي, كينشيرو, كينق , كينمون , كيوتاكا أيانوكوجي, لايت ياغامي, لولوش لامبروج, لويس نابليون , ليفاي أكرمان, ماجد كامل, ماجيلان , ماجين بو, مادارا أوتشيها, مارشال دي تيتش, ماركو, مستر 2, مستر 5, مستر ساتان, منظمة السي بي زيرو, موتين روشي, موزان كيبوتسوجي, موغا إيوري, مومونجا, مونت بلانك نولاند, مونكي دي دراغون, مونكي دي لوفي, ميتسوكي , ميتسوهيكو تسوبورايا, ميرلين , ميلو , ميليوداس, ميوجين ياهيكو, ناتسو, ناتشوريزا, ناروتو أوزوماكي"
CharacterNames = CharacterNames.split(", ")
// remove white spaces at the end of each name
CharacterNames = CharacterNames.map(value => value.trim())
// remove white spaces at the start of each name
CharacterNames = CharacterNames.map(value => value.trimStart())

// remove empty names
CharacterNames = CharacterNames.filter(value => value.length > 1)

// remove duplicates
CharacterNames = [...new Set(CharacterNames)]

console.log("CharacterNames: ", CharacterNames.length)

export {GetLatestEpisodes, GetTopAnime, GetDetails, GetAnimeByName, GetEpisodes, Search, Seasons, Status, Types, CharacterNames};


