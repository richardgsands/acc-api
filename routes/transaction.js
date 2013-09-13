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

    this.getTransactions = function(req, res, next) {

        req.assert('id', 'Invalid account id').notEmpty();
        req.assert('id', 'Invalid account id').is("^[0-9a-fA-F]{24}$"); //make sure it looks like a mongo objectID

        if(self.handleErrors(req.validationErrors(), res))
            return;

        if(!_.isEmpty(req.params.date_start) && !_.isEmpty(req.params.date_end)){

            var pipeline = [
                { $match: {_id: ObjectID.createFromHexString(req.params.id) }},
                { $unwind: '$transactions'},
            ];

            if(!_.isEmpty(req.params.date_start))
                pipeline.push({'$match': {'transactions.date': { '$gte': moment(req.params.date_start, "DD-MM-YYYY").toDate() }}});

            if(!_.isEmpty(req.params.date_end))
                pipeline.push({'$match': {'transactions.date': { '$lte': moment(req.params.date_end, "DD-MM-YYYY").toDate() }}});

            pipeline.push({ '$sort': {'transactions.date':1} });

            collection.aggregate(pipeline, function(e, result){
                if (e) return next(e);

                res.json({"transactions": _.pluck(result, 'transactions')});
            });


        }else{

            collection.find({_id: ObjectID.createFromHexString(req.params.id)}, {transactions:true, _id:false}).toArray(function(e, result) {
                if (e) return next(e);

                console.log(result[0].transactions.length);

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