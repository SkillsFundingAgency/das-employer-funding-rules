module.exports = function (router,_myData) {

    var version = "3-0";

    function resetSession(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        //Set version that myData was created on
        //req.session.myData.version = version
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

        next()
    });

    router.get('/' + version + '/index', function (req, res) {
        res.render(version + '/index', {
            myData:req.session.myData
        });
    });

    // router.post('/' + version + '/page-name-1', function (req, res) {
    //     res.redirect(301, '/' + version + '/page-name-2');
    // });

};