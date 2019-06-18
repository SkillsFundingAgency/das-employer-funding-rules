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

//GLINDEX STUFF
Object.keys(_myData.manuals).map(function(manual, index) {
    _myData.manuals[manual].content.sections.forEach(function(section) {
        if(section.id == "glossary" && "subsections" in section) {
            section.subsections.forEach(function(subsection) {
                if(subsection.partsglindex){

                    subsection.partsglindex.forEach(function(_glindexpart) {
                        var _initial = (_glindexpart.sortoverride) ? (_glindexpart.sortoverride.charAt(0)) : (_glindexpart.title.charAt(0))
                        if(_initial.toLowerCase() != _initial.toUpperCase()){
                            // Letter
                            _glindexpart.isAtoZ = true
                        } else {
                            //NOT letter
                            _glindexpart.isAtoZ = false
                        }
                    });

                    // for each part check if number or not

                    // Sort GLINDEXES
                    //Standard - Sort on title A-Z
                    // subsection.partsglindex.sort(function(a,b){
                    //     var returnValue = 0;
                    //     if(b.title.toUpperCase() > a.title.toUpperCase()){
                    //         returnValue = -1
                    //     } else if(a.title.toUpperCase() > b.title.toUpperCase()){
                    //         returnValue = 1
                    //     }
                    //     return returnValue;
                    // })
                    //Special - Sort on title A-Z but special characters appear first
                    subsection.partsglindex.sort(function(a,b){
                        var alphabet = '*!@_.()#^&%-=+01234567989ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                            _a_string = (a.sortoverride) ? (a.sortoverride) : (a.title),
                            _b_string = (b.sortoverride) ? (b.sortoverride) : (b.title)
                        var index_a = alphabet.indexOf(_a_string.toUpperCase()[0]),
                            index_b = alphabet.indexOf(_b_string.toUpperCase()[0]);
                        if (index_a === index_b) {
                            // same first character, sort regular
                            if (_a_string.toUpperCase() < _b_string.toUpperCase()) {
                                return -1;
                            } else if (_a_string.toUpperCase() > _b_string.toUpperCase()) {
                                return 1;
                            }
                            return 0;
                        } else {
                            return index_a - index_b;
                        }
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
require('./routes/9-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/10-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/11-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router