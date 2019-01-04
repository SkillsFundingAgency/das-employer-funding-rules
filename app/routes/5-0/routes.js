module.exports = function (router,_myData) {

    var version = "5-0";

    function resetSession(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        //Set version that myData was created on
        //req.session.myData.version = version
        req.session.myData.manual = "providers-manual-2"
        req.session.myData.manualpage = "intro-and-purpose"
        req.session.myData.updatesFilter = "true"
        req.session.myData.updatesFilterOn = "false"
        req.session.myData.startFrom = "manual-home"
        req.session.myData.emChart = "false"
        req.session.myData.svgflow = "false"
        req.session.myData.textflow = "false"
        req.session.myData.emailUpdates = "1"
        // TODO
        // default provider manual, default employer manual - for rules-list page
    }

    //generic.js contains wildcard get and post requests. Useful for setting session data that we want available on any other routes file. also, so we dont have duplicate wildcard requests on individual routes files that might conflict with each other.

    // Makes sure certain data is available in session on all pages for all request types
    router.all('/' + version + '/*', function (req, res, next) {

        //Sets req.session.myData to session if not already set

        // console.log(req.session.myData)
        // console.log(req.query.resetSession != null)

        if(!req.session.myData || req.query.resetSession || (req.url == '/' + version + '/manual-setup' && req.method == 'POST')) {
            // Note: Can't also reset if version doesnt match as may switch between versions in testing
            // e.g. cant use "... || req.session.myData.version != version"
            resetSession(req)
        }
        // Reset page validation to false by default. Will only be set to true (I/A) on a POST of a page
        // req.session.myData.validationErrorInfo = {}
        // req.session.myData.validationError = "false"

        //
        // GENERIC
        //

        //DEFAULT SERVICE NAME
        //serviceName default (this is overridden in certain routes files e.g. paye and VAT)
        // res.locals.serviceNameOverride = res.locals.serviceName

        //Set any query string values
        req.session.myData.manual = req.query.manual || req.session.myData.manual
        req.session.myData.manualpage = req.query.manualpage || req.session.myData.manualpage
        req.session.myData.svgflow = req.query.svgflow || req.session.myData.svgflow
        req.session.myData.textflow = req.query.textflow || req.session.myData.textflow
        req.session.myData.updatesFilter = req.query.updatesFilter || req.session.myData.updatesFilter
        req.session.myData.updatesFilterOn = req.query.updatesFilterOn || req.session.myData.updatesFilterOn
        req.session.myData.startFrom = req.query.startFrom || req.session.myData.startFrom
        req.session.myData.emChart = req.query.emChart || req.session.myData.emChart
        // Legacy visibility of flow chart - english maths
        switch(req.session.myData.emChart) {
            case "svgflow":
                req.session.myData.svgflow = "true"
                break;
            case "textflow":
                req.session.myData.textflow = "true"
                break;
            default:
        }
        req.session.myData.emailUpdates = req.query.emailUpdates || req.session.myData.emailUpdates

        next()
    });

    router.get('/' + version + '/index', function (req, res) {
        res.render(version + '/index', {
            myData:req.session.myData
        });
    });

    //
    // MANUAL
    //
    //setup
    router.get('/' + version + '/manual-setup', function (req, res) {
        req.session.myData.version = version
        res.render(version + '/manual-setup', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/manual-setup', function (req, res) {

        //Manual Data
        req.session.myData.manual = req.body.manualSetupManual
        //Start From
        req.session.myData.startFrom = req.body.manualSetupStartFrom
        //Updates Filter
        req.session.myData.updatesFilter = req.body.manualSetupContextualUpdates
        
        //Flow chart - english maths
        req.session.myData.emChart = req.body.manualSetupEngMathsChart
        // Legacy visibility of flow chart - english maths
        switch(req.session.myData.emChart) {
            case "svgflow":
                req.session.myData.svgflow = "true"
                break;
            case "textflow":
                req.session.myData.textflow = "true"
                break;
            default:
        }

        var _startFrom = req.session.myData.startFrom
        switch(_startFrom) {
            case "google":
                res.redirect(301, '/' + version + '/google');
                break;
            case "manual":
                res.redirect(301, '/' + version + '/manual-home');
                break;
            default:
                res.redirect(301, '/' + version + '/manual-home');
        }
    });
    // Email updates
    router.get('/' + version + '/subscribe-email', function (req, res) {
        res.render(version + '/subscribe-email', {
            myData:req.session.myData
        });
    });
    // manual home
    router.get('/' + version + '/manual-home', function (req, res) {
        res.render(version + '/manual-home', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/manual-home', function (req, res) {
        fireSearch(req,res,req.session.myData.manual)
        res.redirect(301, '/' + version + '/manual-search-results');
    });
    // manual page
    router.get('/' + version + '/manual-page', function (req, res) {
        res.render(version + '/manual-page', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/manual-page', function (req, res) {
        fireSearch(req,res,req.session.myData.manual)
        res.redirect(301, '/' + version + '/manual-search-results');
    });
    // manual pdf
    router.get('/' + version + '/manual-pdf', function (req, res) {
        res.render(version + '/manual-pdf', {
            myData:req.session.myData
        });
    });
    // Search results
    router.get('/' + version + '/manual-search-results', function (req, res) {
        res.render(version + '/manual-search-results', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/manual-search-results', function (req, res) {
        fireSearch(req,res,req.session.myData.manual)
        res.redirect(301, '/' + version + '/manual-search-results');
    });

    //
    // SEARCH
    //
    function fireSearch(req,res,manualid){
        var _searchTerm = req.body.q.trim(),
            _searchTermArray = _searchTerm.split(" "),
            _manual = req.session.myData.manuals[manualid],
            _search = {
                "results": [],
                "count": 0
            }
        if(_searchTerm.length > 2) {
            // For each 'section'
            _manual.content.sections.forEach(function(section) {
                var _sectionSearch = {
                        "id": section.id,
                        "found": false,
                        "results": [
                            {
                                "term": _searchTerm,
                                "count": 0
                            }
                        ]
                    }
                _searchTermArray.forEach(function(_searchWord) {
                    _sectionSearch["results"].push(
                        {
                            "term": _searchWord,
                            "count": 0
                        }
                    )
                });
                doSearch(section.title,_sectionSearch)
                // For each 'subsection'
                section.subsections.forEach(function(subsection) {
                    doSearch(subsection.title,_sectionSearch)
                    // For each 'parts'
                    if("parts" in subsection) {
                        subsection.parts.forEach(function(part) {
                            doSearch(part.content,_sectionSearch)
                            doSearch(part.title,_sectionSearch)
                            // For each 'subparts'
                            if("subparts" in part) {
                                part.subparts.forEach(function(subpart) {
                                    doSearch(subpart.content,_sectionSearch)
                                    doSearch(subpart.title,_sectionSearch)
                                    // For each 'subsubparts'
                                    if("subsubparts" in subpart) { 
                                        subpart.subsubparts.forEach(function(subsubpart) {
                                            doSearch(subsubpart.content,_sectionSearch)
                                            doSearch(subsubpart.title,_sectionSearch)
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                _search["results"].push(_sectionSearch)
            });

            // Total results
            _search["results"].forEach(function(result){
                if(result.found == true){
                    _search["count"]++
                }
            });

            // Sort sections
            _search["results"].sort(function(a, b){
                // sorts by 'full string found' count
                return b["results"][0]["count"] - a["results"][0]["count"];
                // TODO sort by other individual counts
            });
        }
        req.session.myData.searchTerm = _searchTerm
        req.session.myData.search = _search
        
        function doSearch(_searchWithin,_sectionSearch){
            if(_searchWithin){
                // Full string search
                var _searchTermSafe = encodeURIComponent(_searchTerm.toUpperCase())
                // var _fullRegex = new RegExp(_searchTermSafe,"g");
                var _fullRegex = new RegExp(_searchTerm.toUpperCase(),"g");

                // TODO tidy up
                if(Array.isArray(_searchWithin)){
                    _searchWithin.forEach(function(_searchItem){
                        var count = (_searchItem.toUpperCase().match(_fullRegex) || []).length
                        _sectionSearch["results"][0].count = _sectionSearch["results"][0].count + count
                    });
                } else {
                    var count = (_searchWithin.toUpperCase().match(_fullRegex) || []).length
                    _sectionSearch["results"][0].count = _sectionSearch["results"][0].count + count
                }
                
                if(count > 0){
                    _sectionSearch.found = true
                }

                // Each string part search
                _searchTermArray.forEach(function(searchWord,index) {
                    if(searchWord.length > 2){
                        var _splitRegex = new RegExp(searchWord.toUpperCase(),"g");

                        // TODO tidy up
                        if(Array.isArray(_searchWithin)){
                            _searchWithin.forEach(function(_searchItem){
                                var count = (_searchItem.toUpperCase().match(_splitRegex) || []).length
                                _sectionSearch["results"][index+1].count = _sectionSearch["results"][index+1].count + count
                            });
                        } else {
                            var count = (_searchWithin.toUpperCase().match(_splitRegex) || []).length
                            _sectionSearch["results"][index+1].count = _sectionSearch["results"][index+1].count + count
                        }

                        if(count > 0){
                            _sectionSearch.found = true
                        }
                    }
                });
            }
        }

    }


    // Updates
    router.get('/' + version + '/manual-updates', function (req, res) {
        res.render(version + '/manual-updates', {
            myData:req.session.myData
        });
    });

};