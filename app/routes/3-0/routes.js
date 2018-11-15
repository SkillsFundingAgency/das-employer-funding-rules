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
    function fireSearch(req,res){
        // TODO
        // - check value of field
        var _searchTerm = req.body.q
        req.session.myData.searchTerm = _searchTerm

        var _manual = req.session.myData.manuals["providers-manual-original"]
        var _manualSections = _manual.content.sections


        // 1. If match found add section.id to list and iterate it's count
                // searchresults = [
                //     {
                //         "id": "id-of-section",
                //         "count": 5
                //     }
                // ]

        // 2. Once finished looping sort 'searchresults' by count

        // 3. Store 'searchresults' against session


        // LOOPING
        // 1. For each 'section'
            // Check match on section.title
                // For each 'subsection'
                // Check match on subsection.title
                    // For each 'parts'
                    // Check match on 'content'
                        // For each 'subparts'
                        //Check match on content
                            // For each subsubparts
                            // Check match on content



        // Looping over object keys examnple
        // Object.keys(_myData.companies).forEach(function(key,index) {
        //     var _thisCompany = _myData.companies[key]
        //     if(_thisCompany){
        //     }
        // });

    }
    // Search results
    router.get('/' + version + '/provider-manual-search-results', function (req, res) {
        res.render(version + '/provider-manual-search-results', {
            myData:req.session.myData
        });
    });

};