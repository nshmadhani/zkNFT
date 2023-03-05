const fs = require('fs')
const path = require('path');
const filePath = path.join(process.cwd(), 'id.json')
function reloadIDs() {
    return JSON.parse(fs.readFileSync(
        filePath
    ));
}

function storeIDs(verifiedID) {
    fs.writeFileSync(filePath, JSON.stringify(verifiedID))
}

module.exports = {
    reloadIDs,
    storeIDs
}