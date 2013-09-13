
process.env.TZ = "Europe/London";

var _ = require('underscore'),
    util = require('util'),
    express = require('express'),
    expressValidator = require('express-validator'),
    AccountHandler = require('./routes/account.js'),
    TransactionHandler = require('./routes/transaction.js'),
    mongoskin = require('mongoskin');


//Setup DB
var db = mongoskin.db('localhost:27017/bankofdad', {safe:true});

db.bind('account', {
    byId: function(id, fn){

        this.findById(id, function(err, result){

            if(!_.isEmpty(result)){
                result.id = result._id;
                delete result._id;
            }

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

/**
 * Home page
 * @param  object req
 * @param  object res
 * @return object     Response
 */
app.get('/', function(req, res, next){
    res.send('Bank of Dad API');
});

var accountHandler = new AccountHandler(db);
var transactionHandler = new TransactionHandler(db);

//Account routes
app.post('/account', accountHandler.createAccount);
app.del('/account', accountHandler.deleteAccount);
app.get('/account/:id', accountHandler.readAccount);
app.put('/account', accountHandler.updateAccount);

//Transaction routes
app.post('/transaction', transactionHandler.createTransaction);



app.use(function(err, req, res, next) {
    res.send(500, {status:500, message: err.toString() || 'internal error', type:'internal'});
});


app.listen(3000);
console.log('Listening on port 3000');