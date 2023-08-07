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

let AnimeCharacterNames = "ايدا, فيجيتا, شادو, سانجي, فرانكي, تشويا, كينشن, غابي, يوليوس, دراكن, لاو, نانامي, اينز, تشيفويو, زابوزا, فالكو, يوسانو, غارب, ويس, ايما, كاتشان, زاراكي, ايزن, سوغو, شيسوي, دانزو, شانكس, كاكاشي, نيزوكو, هاك, كونان, جينتا, ساكورا, كاغياما, راي, تشوبر, مايكي, شين, هيدي, ساواكي, سوتا, كوبي, هانما, ساي, كوشينا, باجي, يونو, بوروتو, غاليارد, تسوكيشيما, سيلفا, سابو, مومو, سيباستيان, اينوماكي, باغي, يونا, دايدا, دون, سايكي, توغو, ساتو, شيغاراكي, ميتسوهيكو, ميكايلا, زاك, بيبو, هاتوري, توكا, ماهيتو, شوكا, فودكا, ال, سيرا, شويو, فيتان, ديكو, فيل, دايسكي, الوكارد, الوكا, ماتسودا, بيلموت, نير, كو, هيلينغ, فايوليت, فوجيورا, كروكودايل, فوجيتورا, تاكاجي, يومي, سوي, باكي, سيلفر, شويتشي, كاناي, كيلوا, توغا, ايتادوري, شوتو, هيسوكا, يوكيكو, شارلوك, كاي, ايس, يوكو, ميريوم, غوجو, ميامورا, هينا, كيوكا, كيد, شيغوري, يوجي, شينوميا, يامي, كاغويا, ايزومي, ماي, ريم, هيوري, ريوك, لايت, يوكي, كايتو, كيد, بوجي, ميسا, ياتو, ياماموتو, ياماتو, ساكاموتو, داي, شيروغاني, اكيتو, ميتسوري, يوهاباخ, كيريتو, غوك, بلاك, ويليام, باكوغو, فريديريكا, تودوروكي, تنغين, ايناهو, كورو, غوكو, ايروكا, اسونا, استا, اوبيتو, اسوما, يور, رم, روري, رايلي, رام, ران, ارثر, سويفون, ايتشيغو, غلين, ليفاي, ارمين, كايدو, شينوا, غون, ميناتو, غاي, شينو, نورمان, كيسامي, كيساكي, كيو, يوساكو, غيومي, غورين, غيو, اوروتشيمارو, ريمورو, جاك, يوكيو, ميساكي, جين, رين, هوتارو, هيرو, ايرين, ماكوتو, ايروين, هيتش, لي, دابي, سونغ, دازاي, داكي, ساراتوبي, روكيا, هيدان, كاكوزو, ريكا, روكا, ساسكي, تانجيرو, شينوبو, ماكي, رينغوكو, اينو, تن, تن, انوس, اوسين, اينوسكي, ادوارد, زينتسو, ميغومي, مارني, سايا, اكازا, ناخت, شارلوت, اودين, توكيتو, كورازون, كينغ, سايتاما, فوجينوما, جينوس, لوفي, سوما, ساواكو, غارو, آش كيتشام, أراماكي, أكاينو, ألفونس إلريك, ألن والكر, أوبيتو أوتشيها, أوروتشيمارو, أوسوب, أوكيجي, أوم , إدوارد نيوجيت, إدورد إلريك, إرين ييغر, إسوكي هوندو, إكس دريك, إل , إيتاتشي أوتشيها, إيتشيغو كوروساكي, إيتشيمارو غين, إيثان هوندو, إيزوكو ميدوريا, إينوياشا , إينيل, اسكانور , الخطايا السبع المميتة , بارتولوميو, بارثولوميو كوما, باردوك, باسكال , هوكينز, باكورا, بروك , بروك , برولي, بريان كرايفورد , بسام, بوروتو أوزوماكي, بولي , بياكويا كوتشيكي, بيجيتا, بيروس, بيسكو , بيكا , بيكولا , بيلامي, تاداشي هامادا, تاكيرو تاكيشي, تانجيرو كامادو, تايتشي ياجامي, ترافلجار لو, ترانكس, تسوتومو أكاي, تشوبيتس, توشيرو هيتسوغايا, تومواكي أرايدي, توني توني تشوبر, جاغوار دي ساول, جاوثر , جو كيدو, جوزو, جوزو ميغوري, جوهان, جيرايا, جيرين , جيسوس بورجس, جيكو موريا, جيمز بلاك , جيناي, جينبيه ماتسودا, داز بونز, دورايمون , دون كريج, دون كيهوتي دوفلامنغو, ديان , ديدارا, دينجي, ديو براندو, رانما ساوتومي, راو , راينر براون, روب لوتشي, رورونوا زورو, روك لي, روي موستانج, ري فورويا, ريكاردو إسباداس , رينجي أباراي, ريوك, زاماسو, زانجيف , زيف , سابو, ساتورو غوجو, ساسوكي أوتشيها, ساغارا سانوسكي, سانجي, سايتاما , سايتو هاجيمي , سباندام, ستيتش, سرعة الصوت سونيك, سكار, سكراتشمين آبو, سل , سموكر, سوبارو أوكيا, سوبر بو, سورا تاكينوتشي, سوزاكو كوروروجي, سوسكي آيزن, سون غوكو, سيتا سوجيرو, سيتو كايبا, سيرخيو , سيزار كلاون, سينجوكو, سينشي كودو, شانكس, شوكيتشي هانيدا, شويتشي أكاي, شيشيو ماكوتو, شيكامارو نارا, شينجي إيكاري, شينوموري آوشي, غارا, غالدينو , غريب غسان , غون فريكس, غيلد تيسورو, غينتا كوجيما, غيندو إيكاري, فان أوغر, فريزر , فريق المتحرين الصغار, فوجيتورا, فوكسي , فيتان, فيرغو, فيستا , فينكس , كابتن كورو, كابتن هارلوك, كاريبو , كافنديش , كاكاشي هاتاكي, كاكو, كانسوكي ياماتو, كانينوري واكيتا, كاورو ناغيسا, كايتو كيد, كايدو , كن كانيكي, كوبي , كوجي, كوجي هانيدا, كوريرين, كوشيرو إيزومي, كوغورو موري, كونان إدوغاوا, كيزارو, كيغو اسانو, كيلر , كينباتشي زاراكي, كينشيرو, كينق , كينمون , كيوتاكا أيانوكوجي, لايت ياغامي, لولوش لامبروج, لويس نابليون , ليفاي أكرمان, ماجيلان , ماجين بو, مادارا أوتشيها, مارشال دي تيتش, ماركو, مستر 2, مستر 5, مستر ساتان, منظمة السي بي زيرو, موتين روشي, موزان كيبوتسوجي, موغا إيوري, مومونجا, مونت بلانك نولاند, مونكي دي دراغون, مونكي دي لوفي, ميتسوكي , ميتسوهيكو تسوبورايا, ميرلين , ميلو , ميليوداس, ميوجين ياهيكو, ناتسو, ناتشوريزا, ناروتو أوزوماكي"
AnimeCharacterNames = AnimeCharacterNames.split(", ")
// remove white spaces at the end of each name
AnimeCharacterNames = AnimeCharacterNames.map(value => value.trim())
// remove white spaces at the start of each name
AnimeCharacterNames = AnimeCharacterNames.map(value => value.trimStart())

// remove empty names
AnimeCharacterNames = AnimeCharacterNames.filter(value => value.length > 1)

// remove duplicates
AnimeCharacterNames = [...new Set(AnimeCharacterNames)]

console.log("CharacterNames: ", AnimeCharacterNames.length)

let MangaCharacterNames = "1- كير->2 -هوندا ->3 - هانيدا->4 - شينتشي->5 - كونان->6- ران->7- اكاي->9 - يوساكو->10- ميري->11-  سيرا->12- كايتو كيد->13-رم->14- جين->15- فودكا->16-بوربون->17-كيانتي->18-هيجي->19-ماكوتو->20-تاكاغي->21- ساسكي->22- اسوما->23- ساي->24- تيماري->25- ساكورا->26- اوريتشيمارو->27- ايتاتشي->28- اوبيتو->29- مادارا->30 - هاشيراما->31- كاجياما->32- شويو->33- اساهي->34- دايتشي->35- اويكاوا->36- بوكوتو->37- نيشينويا->38- تاناكا->39- اتسومو->40- تسوكيشيما->41- ناغي->42- رين->43- شيدو->44- ايساغي->45- باتشيرا->46- جينتوكي->47- كاغورا->48- شينباتشي->49- تاكاسوغي->50- كاتسورا->1-جول دي روجر->2-سيلفر ريلي->3-كوزوكي اودين->4-مونكي دي لوفي->5-رورونوا زورو->6-نامي->7-اوسوب->8-سانجي->9-توني توني تشوبر->10-نيكو روبين->11-فرانكي->12-بروك->13-جيمبي->14-فيشر تايجر->15-غول دي إيس->16-ادوارد نيوجيت->17-مارشيل دي تيتش->18-ماركو العنقاء->19-شانكس->20-بين بيكمان->21-يوسوب->22-كايدو->23-شارلوت لينلين->24- شارلوت كاتكوري->25-شارلوت بيسبرو->26-شارلوت دايفكو->27-شارلوت كراكر->28-شارلوت اوفين->29-شارلوت سموزي->30-آلفيدا->31-باجي المهرج->32-مونكي دي دراغون->33-موجي->34-كباجي->35-كابتن كورو->36-جانغو->37-بوتشي->38-شام->39-دون كريج->40-دراكيولا ميهوك->41-أورلنغ->42-جين->43-بيرل->44-أورلنغ->45-هاتشان->46-كوروبي->47-تشو->48-مومو->49-وابول->50-تشيس->51-كورماريمو->52-ماشيرا->53-شوجو->54-بيلامي->55-دون كيهوتي دوفلامنجو->56-فوكسي->57-بورتشا->58-أكاينو->59-غارب->60-فوجيتورا->61-سموكر->62-كراكوديل->63-ترافلغارلاو->64-إدوارد ويبل->65-دراكولا ميهوك->66-بارثلوميو كوما->67-بوا هانكوك->68-جيكو موريا->69-ايمبريو ايفانكوف->70-بارثلوميو كوما->71-اينازوما->72-سابو->73-هاك->74-كوالا->75-سايتاما->76-جينوس->77-تاتسوماكي->78-بلاست->79-سيلفر فانغ->80-اتوميك ساموراي->81-بوفوي->82-كينغ->83-تانكتوب ماستر->84-ميتال بات->85-السجين بوري بوري->86-سويت فيس->87-ستينغر->88-لاينتغ ماكس->89-سنيك->90-فوبوكي->91-الدراج مومن->92-غارو->93-سرعة الصوت سونيك->94-هاميرهيد->95-بانيرو->96-إيزوكو ميدوريا->97-كاتسوكي باكوغو->98-أوتشاكو أوراراكا->99-تينيا ايدا->100-أوول مايت->101-شوتو تودوروكي->102-إيتشيغو كوروساكي->103-روكيا كوتشيكي->104-إنوي أوريهيمي->105-أوراهارا->106-بياكويا كوتشيكي->107-كيمباتشي زاراكي->108-شونسي كيوراكو->109-آيزن->110-إيشيب هيوزوبي->111-جيرارد فالكيري ->112-جينريوساي ياماموتو->113-يوهاباخ->114- إيكاكو مادارام->115- رانجيكو ماتسوموتو->116- شينجي هيراكو->117- غريمجوفياغيرجاكيز->118- أولكيورا سيفير->119- كوكاكو شيبا->120- إيشين كوروساكي->121-يونو ->122- ليخت->123-ليبي->124-يامي سوكيهيرو->125-نويل سيلفا->126-لوسيوس->127-ميريليونا فيرمليون->128-تشارمي->129-نوزيل سليفا->130-ناخت->131-فانيكا->132- لاك فولتيا->133- فانيسا إينوتيكا->134- أرجوحة ماجنا->135- غوش أدوري->136- كلاوس لونيت->137- ليوبولد فيرميليون->138- يوليوس نوفا كرونو->139- سول مارون->140- شارلوت ->141- زورا ايديل->142- لانجريس فوود->143-ويليام فانجانس->144-ميموسا فارميليون->145- فينرال رولاكاس->146-يانغ كاي ->147-تشيون ونريو->148-سوب منغ->149-سونغ جين وو->150-تشيون ونريو->151-يو جينهو->152-سونغ جين آه->153-بارك كيونغ هاي->154-لي جوهي->155-تشا هاي إن->156-سونغ إيل هوان->157-سو يان->158-سو مو->159-ارثر ->160-تيسيا->161-جاسمين->162-جامين->163-هان كيونغ->164-سوهيون->165-هوانغ تشو->166-دان سا يو->167-جونغ ريوك سان->168-هان مو بايك->169-جين مو ون->170-يون ها-سيول->171- كوان هو جين->172- تشون-وو جو->173-زاو فان->174-بانغ تونغ لين->175-السيده ليو->176-كيم دوك جا->177-يوو سانجا->178-دوكايبي->179-كايدن->180-جي وو سيو->181-يو جي سوك->182-وو وين ->183-جاجانغ جين->184-لي جونغ بايك->185-مانج ريو->186-يي زها->187-لويد->188-ايجين->189-جين تاكيونغ->190-جيوك تشيونغانغ->191-يون سيوول->192-تشيونغ ميونغ->193-يوون غونغ ->194-جوم ريونغ->195-يوليان->196-شبون->197-ناروتو->198-تشون->199-يي زيون->200-نيي لي"
MangaCharacterNames = MangaCharacterNames.split("->")
let i = 1;
MangaCharacterNames = MangaCharacterNames.map(c => c.split("-")[1]?.trim())
MangaCharacterNames = MangaCharacterNames.filter(c => c?.length > 1);

let CharacterNames = {
    "manga": MangaCharacterNames,
    "anime": AnimeCharacterNames
}


export {GetLatestEpisodes, GetTopAnime, GetDetails, GetAnimeByName, GetEpisodes, Search, Seasons, Status, Types, CharacterNames};


