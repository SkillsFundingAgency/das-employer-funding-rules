const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

var _myData = {
    "manuals":
    {
        "providers-manual-original": require(__dirname + '/data/providers-manual-original.json'),
        "employers-manual-original": require(__dirname + '/data/employers-manual-original.json'),
        "providers-manual-2": require(__dirname + '/data/providers-manual-2.json')
    }
}

require('./routes/3-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/4-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/5-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router