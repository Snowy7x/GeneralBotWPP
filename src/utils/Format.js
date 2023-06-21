

/**
 *
 * @param {string} msg
 * @param {object} extra
 * @returns {string}
 * @constructor
 */
function Format(msg, extra) {
    for (let i in extra) {
        let v = extra[i]
        msg = msg.replaceAll("{" + i + "}", v)
    }
    return msg
}

function normalizeArabicWord(word) {
    // Remove diacritical marks, hamza variations, and final letter forms
    let normalizedWord = word.replaceAll("أ", "ا")
        .replaceAll("إ", "ا")
        .replaceAll("آ", "ا")
        .replaceAll("ة", "ه")

    if (normalizedWord.length === 0) {
        return word;
    }

    if (normalizedWord[normalizedWord.length - 1] === "ى") {
        normalizedWord = normalizedWord.substring(0, normalizedWord.length - 1) + "ي";
    }

    normalizedWord = AraNumberToEng(normalizedWord);

    return normalizedWord;
}

function isSimilarWord(word1, word2) {
    const normalizedWord1 = normalizeArabicWord(word1);
    const normalizedWord2 = normalizeArabicWord(word2);

    return normalizedWord1 === normalizedWord2;
}

function isArabicWord(word) {
    return word.match(/[\u0600-\u06FF]/) !== null;
}

function isArabicNumber(word) {
    return word.match(/[\u0660-\u0669]/) !== null;
}

function AraNumberToEng(number) {
    // ١٢٣٤٥٦٧٨٩٠
    return number.replaceAll("١", "1")
        .replaceAll("٢", "2")
        .replaceAll("٣", "3")
        .replaceAll("٤", "4")
        .replaceAll("٥", "5")
        .replaceAll("٦", "6")
        .replaceAll("٧", "7")
        .replaceAll("٨", "8")
        .replaceAll("٩", "9")
        .replaceAll("٠", "0")
}

// Test:
// console.log(isSimilarWord("محمد", "محمود"))
// console.log(isSimilarWord("محمد", "محمد"))

// console.log(isArabicWord("1"))
// console.log(isArabicWord(" حامد محمد"))

// console.log(isArabicNumber("2154"))
// console.log(AraNumberToEng("١٢٣٤٥٦٧٨٩٠"))

export {Format, isSimilarWord, normalizeArabicWord, isArabicWord, isArabicNumber, AraNumberToEng}