module.exports = function (router,_myData) {

    var version = "3-0";

    function resetSession(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        //Set version that myData was created on
        //req.session.myData.version = version
        req.session.myData.manual = "providers-manual-original"
        req.session.myData.manualpage = "provider-manual"
    }

    //generic.js contains wildcard get and post requests. Useful for setting session data that we want available on any other routes file. also, so we dont have duplicate wildcard requests on individual routes files that might conflict with each other.

    // Makes sure certain data is available in session on all pages for all request types
    router.all('/' + version + '/*', function (req, res, next) {

        //Sets req.session.myData to session if not already set

        if(!req.session.myData || req.query.resetSession || (req.url == '/' + version + '/setup' && req.method == 'POST')) {
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
                var _fullRegex = new RegExp(_searchTermSafe,"g");
                var count = (_searchWithin.toUpperCase().match(_fullRegex) || []).length
                _sectionSearch["results"][0].count = _sectionSearch["results"][0].count + count
                if(count > 0){
                    _sectionSearch.found = true
                }
                // Each string part search
                _searchTermArray.forEach(function(searchWord,index) {
                    if(searchWord.length > 2){
                        var _splitRegex = new RegExp(searchWord.toUpperCase(),"g");
                        var count = (_searchWithin.toUpperCase().match(_splitRegex) || []).length
                        _sectionSearch["results"][index+1].count = _sectionSearch["results"][index+1].count + count
                        if(count > 0){
                            _sectionSearch.found = true
                        }
                    }
                });
            }
        }

    }

};