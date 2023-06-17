

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

export {Format}