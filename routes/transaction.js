var _ = require('underscore'),
    ObjectID = require('mongoskin').ObjectID,
    moment = require('moment');

/**
 * Transaction based route handling
 * @param object db  MongoSkin db instance
 */
function Transaction(db){

    var self = this;

    var collection = db.collection('account');

    /**
     * Create transaction against an account id
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.createTransaction = function(req, res, next) {

        req.checkBody('account_id', 'You must specify an account').notEmpty();
        req.checkBody('amount', 'You must specify an amount').notEmpty();
        req.checkBody('description', 'You must specify a description').notEmpty();

        //Sanitize boolean inputs
        req.sanitize('deposit').toBooleanStrict();
        req.sanitize('withdrawal').toBooleanStrict();
        req.body.deposit = (req.body.deposit === undefined) ? false : req.body.deposit;
        req.body.withdrawal = (req.body.withdrawal === undefined) ? false : req.body.withdrawal;

        if(self.handleErrors(req.validationErrors(), res))
            return;

        var newTransaction = {
            "amount": req.body.amount,
            "description": req.body.description,
            "deposit": req.body.deposit,
            "withdrawal": req.body.withdrawal,
            "date": moment(req.body.date).toDate() || new Date() // set detfault to now
        };

        collection.byId(req.body.account_id, function(e, result) {
            if (e) return next(e);

            if(!_.isEmpty(result)){

                collection.updateById(result.id, { $push: { "transactions": newTransaction }}, function(e, update){
                    if (e) return next(e);

                    if(update == 1){
                        collection.findById(result.id, function(e, updated){
                            if (e) return next(e);

                            if(!_.isEmpty(updated))
                                res.json(updated);
                            else
                                res.json(500, {'error': true});
                        });
                    }else{
                        res.json(500, {'error': true});
                    }
                });

            }else{
                 res.json(404, {"error": 'Invalid account id'});
            }

        });
    };

    /**
     * Get transactions based on account id.
     * - Takes optional date/type filters. If specified a mongo aggreate query is used. (http://docs.mongodb.org/manual/core/aggregation-introduction/)
     * @todo  Add account id validation to
     * @todo  Validate filter/date params
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.getTransactions = function(req, res, next) {

        req.assert('id', 'Invalid account id').notEmpty();
        req.assert('id', 'Invalid account id').is("^[0-9a-fA-F]{24}$"); //make sure it looks like a mongo objectID

        if(self.handleErrors(req.validationErrors(), res))
            return;

        //If filters have been specified
        if(!_.isEmpty(req.params.type) && req.params.type !==  'all' || !_.isEmpty(req.params.date_start) || !_.isEmpty(req.params.date_end)){

            //Init pipe line
            var pipeline = [
                { $match: {_id: ObjectID.createFromHexString(req.params.id) }}, //Filter to just account specified
                { $unwind: '$transactions'}, //Unwind/Explode transactions array (needed to query against individual queries)
            ];

            //Date start filter
            if(!_.isEmpty(req.params.date_start))
                pipeline.push({'$match': {'transactions.date': { '$gte': moment(req.params.date_start, "DD-MM-YYYY").toDate() }}});

            //Date end filter
            if(!_.isEmpty(req.params.date_end))
                pipeline.push({'$match': {'transactions.date': { '$lte': moment(req.params.date_end, "DD-MM-YYYY").toDate() }}});

            //Type filter
            if(!_.isEmpty(req.params.type) && req.params.type === 'withdrawal'){
                pipeline.push({'$match': {'transactions.withdrawal': true}});
            }else if(!_.isEmpty(req.params.type) && req.params.type === 'withdrawal'){
                pipeline.push({'$match': {'transactions.deposit': true}});
            }

            //Add sort at the end
            pipeline.push({ '$sort': {'transactions.date':1} });

            collection.aggregate(pipeline, function(e, result){
                if (e) return next(e);

                //Return just transactions
                res.json({"transactions": _.pluck(result, 'transactions')});
            });


        }else{

            //Simple transaction look up (no filters)
            collection.find({_id: ObjectID.createFromHexString(req.params.id)}, {transactions:true, _id:false}).toArray(function(e, result) {
                if (e) return next(e);

                if(!_.isEmpty(result))
                    res.json(result[0]);
                else
                    res.json(404, {"error": 'Invalid account id'});
            });
        }

    };

    /**
     * Helper to handle validation errors
     * @param  array errors
     * @param  object res
     * @return void
     */
    this.handleErrors = function(errors, res){

        if (errors) {
            res.json(400, {"error": true, "messages": errors});
            return true;
        }else{
            return false;
        }
    };
}

module.exports = Transaction;