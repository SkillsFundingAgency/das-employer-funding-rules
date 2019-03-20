const express = require('express')
const router = express.Router()

var _myData = {
    "manuals":
    {
        "providers-manual-original": require(__dirname + '/data/providers-manual-original.json'),
        "providers-manual-2": require(__dirname + '/data/providers-manual-2.json'),
        "providers-manual-3": require(__dirname + '/data/providers-manual-3.json'),
        "employers-manual-original": require(__dirname + '/data/employers-manual-original.json'),
        "employers-manual-2": require(__dirname + '/data/employers-manual-2.json'),
        "employer-providers-manual-1": require(__dirname + '/data/employer-providers-manual-1.json')
    },
    "latestEmployerManual": "employers-manual-2",
    "latestProviderManual": "providers-manual-3",
    "latestEmployerproviderManual": "employer-providers-manual-1"
}

// Sort GLINDEXES
Object.keys(_myData.manuals).map(function(manual, index) {
    _myData.manuals[manual].content.sections.forEach(function(section) {
        if(section.id == "glossary" && "subsections" in section) {
            section.subsections.forEach(function(subsection) {
                if(subsection.partsglindex){
                    subsection.partsglindex.sort(function(a,b){
                        var returnValue = 0;
                        //Sort on title A-Z
                        if(b.title.toUpperCase() > a.title.toUpperCase()){
                            returnValue = -1
                        } else if(a.title.toUpperCase() > b.title.toUpperCase()){
                            returnValue = 1
                        }
                        return returnValue;
                    })
                }
            });
        }
    });
});

require('./routes/3-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/4-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/5-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/6-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/7-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/8-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router