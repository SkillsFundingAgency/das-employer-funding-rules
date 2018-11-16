module.exports = function (router,_myData) {

    var version = "3-0";

    function resetSession(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        //Set version that myData was created on
        //req.session.myData.version = version
        req.session.myData.providerpage = "provider-manual"
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
        req.session.myData.providerpage = req.query.providerpage || req.session.myData.providerpage

        next()
    });

    router.get('/' + version + '/index', function (req, res) {
        res.render(version + '/index', {
            myData:req.session.myData
        });
    });
    // Provider manual home
    router.get('/' + version + '/provider-manual', function (req, res) {
        res.render(version + '/provider-manual', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/provider-manual', function (req, res) {
        fireSearch(req,res,"providers-manual-original")
        res.redirect(301, '/' + version + '/provider-manual-search-results');
    });
    // Provider manual page
    router.get('/' + version + '/provider-manual-page', function (req, res) {
        res.render(version + '/provider-manual-page', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/provider-manual-page', function (req, res) {
        fireSearch(req,res,"providers-manual-original")
        res.redirect(301, '/' + version + '/provider-manual-search-results');
    });
    // Search results
    router.get('/' + version + '/provider-manual-search-results', function (req, res) {
        res.render(version + '/provider-manual-search-results', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/provider-manual-search-results', function (req, res) {
        fireSearch(req,res,"providers-manual-original")
        res.redirect(301, '/' + version + '/provider-manual-search-results');
    });
    function fireSearch(req,res,manualid){
        var _searchTerm = req.body.q.trim()
        var _searchTermArray = _searchTerm.split(" ")
        var _manual = req.session.myData.manuals[manualid]
        var _search = {
            "results": [],
            "count": 0
        }
        if(_searchTerm.length > 2) {
            // 1. For each 'section'
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
                _searchTermArray.forEach(function(searchWord,index) {
                    _sectionSearch["results"].push({"term": searchWord,"count": 0})
                });
                // console.log(section.id)
                // Check match on section.title
                searchCount(section.title,_sectionSearch)
                // For each 'subsection'
                section.subsections.forEach(function(subsection) {
                    // Check match on subsection.title (if exists)
                    if("title" in subsection) {
                        searchCount(subsection.title,_sectionSearch)
                    }
                    // For each 'parts'
                    if("parts" in subsection) {
                        subsection.parts.forEach(function(part) {
                            // Check match on 'content'
                            searchCount(part.content,_sectionSearch)
                            // For each 'subparts'
                            if("subparts" in part) {
                                part.subparts.forEach(function(subpart) {
                                    //Check match on content
                                    searchCount(subpart.content,_sectionSearch)
                                    // For each subsubparts
                                    if("subsubparts" in subpart) { 
                                        subpart.subsubparts.forEach(function(subsubpart) {
                                            // Check match on content
                                            searchCount(subsubpart.content,_sectionSearch)
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

                
                // console.log(_sectionSearch)
                _search["results"].push(_sectionSearch)
            });

            // Total results
            _search["results"].forEach(function(result){
                if(result.found == true){
                    _search["count"]++
                }
            });

            // Sort sections
            // console.log(_search["results"].length)
            _search["results"].sort(function(a, b){
                // sorts by full count then other count
                // console.log(b["results"][0]["count"])
                return b["results"][0]["count"] - a["results"][0]["count"];
                // TODO sort by other individual counts
            });
        }
        // console.log(_search["results"])
        function searchCount(str,_sectionSearch){
            // TODO 
            // - break _searchTerm into multiple words and search each one
            // - store data of each word found: all words found higher up in search

            
            // Full string search
            var regex = new RegExp(_searchTerm.toUpperCase(),"g");
            var count = (str.toUpperCase().match(regex) || []).length
            _sectionSearch["results"][0].count = _sectionSearch["results"][0].count + count
            if(count > 0){
                _sectionSearch.found = true
            }

            // Each string search
            _searchTermArray.forEach(function(searchWord,index) {
                if(searchWord.length > 2){
                    var regex = new RegExp(searchWord.toUpperCase(),"g");
                    var count = (str.toUpperCase().match(regex) || []).length
                    _sectionSearch["results"][index+1].count = _sectionSearch["results"][index+1].count + count
                    if(count > 0){
                        _sectionSearch.found = true
                    }
                }
            });
        }
        req.session.myData.searchTerm = _searchTerm
        req.session.myData.search = _search
        // console.log(_search)
    }

};