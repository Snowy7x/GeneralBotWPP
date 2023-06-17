import fs from "fs";
let e = {
    form: `*{animeName}*

سنة الانتاج: {animeYear}
التصنيف العمري: {animeRating}
التصنيف: {animeGenre}
عدد الحلقات: {animeEpisodes}
النوع: {animeType}
الموسم: {animeSeason}
الحالة: {animeStatus}

الوصف: {animeDesc}
`
}

fs.writeFile("./forms.json", JSON.stringify(e), function(err) {
    if (err) {
        console.log(err)
    }else {
        console.log("Saved")
    }
})

