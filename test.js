/*
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
})*/

let msg = " -_- هاتر -_- هري بوتر -_- هان سولو -_- هانز لاندا -_- هكتور باربوسا -_- هونر  -_- واتو -_- وار  -_- والتر وايت -_- وولفرين -_- ويل ترنر -_- ويلي ونكا -_- يودا -_- مورفيوس -_- مرلين -_- ماوكلي -_- مارد وشوشني -_- ليكس لوثر -_- كوي غون جين -_- كايلو رين -_- كابتن هوك  -_- كابتين مافريك -_- فيكتور زاش -_- فيليب مارلو -_- فينيست كورليوني -_- ياسر الشهراني -_- فينيست ابو بكر -_- ايغالو -_- عمر خريبين -_- توم كروز -_- توني ستارك -_- توود -_- جابا ذا هات -_- جارفيس لوري -_- جاك سبارو -_- جاي غاتسبي -_- جورج ماكلين -_- جيري كرانشر -_- جيسي -_- جيم -_- جيمس بوند -_- جيمس غوردون -_- دارث -_- دراكو -_- دكتور سترينج -_- دونكي -_- ديدبول -_- ديفي جونز -_- ديك  -_- رورشاك -_- روميو -_- رون ويزلي -_- رونان -_- ريت بتلر -_- ريد سكول -_- ستار لورد -_- سكوبي دو -_- سوني  -_- فين -_- كابتن مارفل -_- ميسي -_- رونالدو -_- سواريز -_- بوو -_- سبايدر مان -_- اغويرو  -_- مالديني -_- ماتلي  -_- مارد وشوشني -_- ماطم -_- ماغنيتو -_- ماكس روكاتانسكي -_- ماوكلي -_- مايك ايرمنتروت -_- توني كروس  -_- الابا -_- عمر السومة -_- رياض محرز  -_- محمد صلاح -_- حكيم زياش -_- اشرف حكيمي  -_- بوفون -_- سومير -_- ياشين -_- تير شتيغن -_- أبوكاليبس -_- ادميرال أكبر -_- ألباس دمبلدور -_- ألفريد بيني وورث -_- ألكسندر مانيت -_- اوبتيموس برايم -_- أوبي وان كينوبي -_- أوستن باورز -_- اياغو -_- ايس مان -_- باتريك بيتمان -_- باتمان -_- بويول -_- بيكهام -_- فييرا -_- كورتوا -_- نافاس -_- راموس  -_- كانافارو -_- جورج ويه -_- بترز ستوتش -_- برق بنزين -_- برنابا كولينز -_- بروس واين -_- بروفيسور إكس -_- بن غان -_- بوبا فيت -_- بيتا ميلارك -_- رونالدو الظاهرة -_- نكونكو -_- مودريتش -_- فينيسيوس -_- رودريغو -_- بيدري -_- غافي -_- مولر  -_- كيميتش  -_- نوير -_- اوبا ميكانو -_- ديلخت -_- ديفيز -_- باجيو -_- سبايدر مان -_- ايرون مان -_- ذا روك -_- هالك -_- مارسيلو -_- بيبي -_- كارفخال -_- اروخو -_- رافينها -_- نيمار -_- مبابي -_- كافاني -_- مينديز -_- لوكاس فاسكيز -_- لويس انريكي -_- غوارديولا -_- ثور -_- اليشا ليمن -_- ديبروين -_- رودري -_- كانسلو -_- اكي -_- اكانجي -_- كوكي -_- غريزمان -_- اوبلاك -_- بونوتشي -_- كليني -_- سافيتش -_- اراد غولير -_- جوتا -_- ياسين بونو -_- النصيري -_- ناني -_- روني -_- ايفرا -_- سولشاير -_- كاسيميرو -_- ميلتاو -_- روبيرتو كارلوس -_- كافو -_- رونالدينهو -_- كاكا -_- ابراهيموفيتش -_- ايتو -_- داني الفيش  -_- تشافي  -_- انيستا -_- ماسكيرانو -_- بالدي -_- خوسيلو -_- اسينسيو -_- فرمينيو -_- فيغو -_- دياز -_- برنالدو سيلفا -_- بوغبا -_- لوريس -_- اومتيتي -_- لينغليه -_- كانتي -_- بنزيما -_- جفارديول -_- كومان -_- ساني -_- غنابري -_- موراتا -_- غوميز -_- هيغوين -_- بوشكاش -_- سكالوني -_- جمال موسيالا -_- جيرارد -_- هيندرسون -_- كوليبالي -_- كونان -_- غوستافو -_- الكانتارا -_- تيليس -_- فوفانا -_- اينزو -_- ايريكسن -_- برونو"
let arr = msg.split(" -_- ");
arr = arr.map(e => e.trim());
arr = arr.filter(e => e.length > 0);
console.log(arr.length);