
process.env.TZ = "Europe/London";

var _ = require('underscore'),
    util = require('util'),
    express = require('express'),
    expressValidator = require('express-validator'),
    mongoskin = require('mongoskin');


//Setup DB
var db = mongoskin.db('localhost:27017/bankofdad', {safe:true});

db.bind('account', {
    byId: function(id, fn){

        this.findById(id, function(err, result){
            result.id = result._id;
            delete result._id;
            fn(err, result);
        });

    }
});

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

    var toInsert = {
        "parent_name": req.body.parent_name,
        "child_name": req.body.child_name,
        "start_date": new Date()
    };

    collection.insert(toInsert, {}, function(e, results){
        if (e) return next(e);

        res.json({'id':results[0]._id});
    });

});

app.del('/account', function(req, res){

    req.checkBody('id', 'Invalid id').notEmpty();

    var collection = db.collection('account');

    var errors = req.validationErrors();
    if (errors) {
        res.json(400, {"error": true, "messages": errors});
        return;
    }

    collection.removeById(req.body.id, {}, function(e, results){
        if (e) return next(e);

        if(results === 1)
            res.json({"deleted": req.body.id});
        else
            res.json(404, {"error": 'Nothing to delete'});
    });

});


/**
 * Get requests - Find entity/collection
 * @param  object req
 * @param  object res
 * @return object     Response
 */
app.get('/account/:id', function(req, res) {

    req.assert('id', 'Invalid id').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.json(400, {"error": true, "messages": errors});
        return;
    }

    var collection = db.collection('account');

    collection.byId(req.params.id, function(e, result){
        if (e) return next(e);

        if(!_.isEmpty(result)){
            res.json(result);
        }else{
            res.json(404, {"error": 'No account found'});
        }
    });

});

app.listen(3000);
console.log('Listening on port 3000');