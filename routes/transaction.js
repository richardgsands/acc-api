var _ = require('underscore');

/**
 * Transaction based route handling
 * @param object db  MongoSkin db instance
 */
function Transaction(db){

    var self = this;

    var collection = db.collection('account');

    this.createTransaction = function(req, res) {

        req.checkBody('account_id', 'You must specify an account').notEmpty();
        req.checkBody('amount', 'You must specify an amount').notEmpty();
        req.checkBody('description', 'You must specify a description').notEmpty();

        //Sanitize boolean inputs
        req.sanitize('deposit').toBooleanStrict();
        req.sanitize('withdrawal').toBooleanStrict();
        req.body.deposit = (req.body.deposit === undefined) ? false : req.body.deposit;
        req.body.withdrawal = (req.body.withdrawal === undefined) ? false : req.body.withdrawal;

        self.handleErrors(req.validationErrors(), res);

        var newTransaction = {
            "amount": req.body.amount,
            "description": req.body.description,
            "deposit": req.body.deposit,
            "withdrawal": req.body.withdrawal,
            "date": new Date()
        };

        
        console.log(newTransaction);


        collection.byId(req.body.account_id, function(err, result) {

            if(!_.isEmpty(result)){

                collection.updateById(result.id, { $push: { "transactions": newTransaction }}, function(err, update){

                    if(update == 1){
                        collection.findById(result.id, function(err, updated){
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
     * Helper to handle validation errors
     * @param  array errors
     * @param  object res
     * @return void
     */
    this.handleErrors = function(errors, res){

        if (errors) {
            res.json(400, {"error": true, "messages": errors});
            return;
        }
    };
}

module.exports = Transaction;