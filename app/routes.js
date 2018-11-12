const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

var _myData = {
    "manuals":
    {
        "providers-manual-original": require(__dirname + '/data/providers-manual-original.json')
    }
}

require('./routes/3-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router