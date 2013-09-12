var _ = require('underscore'),
    util = require('util'),
    express = require('express'),
    expressValidator = require('express-validator'),
    mongoskin = require('mongoskin');


//Setup DB
var db = mongoskin.db('localhost:27017/bankofdad', {safe:true});

//Setup Express
var app = express();

/**
 * Use body parser to extract body params
 */
app.use(express.bodyParser());


app.use(expressValidator());

app.use(function(err, req, res, next) {
    res.send(500, {status:500, message: 'internal error', type:'internal'});
});

/**
 * Home page
 * @param  object req
 * @param  object res
 * @return object     Response
 */
app.get('/', function(req, res){
    res.send('Bank of Dad API');
});


/**
 * Post requests - Create entity/collection
 * @param  object req
 * @param  object res
 * @return object     Response
 */
app.post('/account', function(req, res) {

    //Validate post fields
    req.checkBody('parent_name', 'Invalid parent name').notEmpty();
    req.checkBody('child_name', 'Invalid child name').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.json(400, {"error": true, "messages": errors});
        return;
    }

    var collection = db.collection('account');

    collection.insert({"parent_name": req.body.parent_name, "child_name": req.body.child_name}, {}, function(e, results){
        if (e) return next(e);

        res.json({'id':results[0]._id});
    });

});


/**
 * Get requests - Find entity/collection
 * @param  object req
 * @param  object res
 * @return object     Response
 */
app.get('/:collectionName', function(req, res) {

    console.log(req.collection);

});

app.listen(3000);
console.log('Listening on port 3000');