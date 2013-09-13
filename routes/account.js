var _ = require('underscore'),
    moment = require('moment'),
    async = require('async');

/**
 * Account based route handling
 * @param object db  MongoSkin db instance
 */
function Account(db){

    var self = this,
        allowedUpdates = ['loan_rate', 'saving_rate', 'pocket_money_amount', 'pocket_money_day', 'goal']; //Fields allowed to be set during update

    var collection = db.collection('account');

    /**
     * Create account
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.createAccount = function(req, res, next) {

        //Validate post fields
        req.checkBody('parent_name', 'Invalid parent name').notEmpty();
        req.checkBody('child_name', 'Invalid child name').notEmpty();

        if(self.handleErrors(req.validationErrors(), res))
            return;

        var toInsert = {
            "parent_name": req.body.parent_name,
            "child_name": req.body.child_name,
            "start_date": new Date(),
            "current_date": new Date()
        };

        collection.insert(toInsert, {}, function(e, results){
            if (e) return next(e);

            res.json({'id':results[0]._id});
        });

    };

    /**
     * Delete account
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.deleteAccount = function(req, res, next) {

        req.checkBody('id', 'Invalid id').notEmpty();

        if(self.handleErrors(req.validationErrors(), res))
            return;

        collection.removeById(req.body.id, {}, function(e, results){
            if (e) return next(e);

            if(results === 1)
                res.json({"deleted": req.body.id});
            else
                res.json(404, {"error": 'Nothing to delete'});
        });

    };

    /**
     * Read account
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.readAccount =  function(req, res, next) {

        req.assert('id', 'Invalid id').notEmpty();

        if(self.handleErrors(req.validationErrors(), res))
            return;

        collection.byId(req.params.id, function(e, result){
            if (e) return next(e);

            if(!_.isEmpty(result)){
                res.json(result);
            }else{
                res.json(404, {"error": 'No account found'});
            }
        });

    };

    /**
     * Update account
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.updateAccount = function(req, res, next) {

        req.checkBody('id', 'Invalid id').notEmpty();

        if(self.handleErrors(req.validationErrors(), res))
            return;

        var id = req.body.id;
        var update = _.pick(req.body, allowedUpdates); //Filter update fields

        delete update.id;

        collection.updateById(id, { $set : update }, function(e, result){
            if (e) return next(e);

             if(result === 1){
                collection.findById(id, function(e, result){

                    if(result)
                        res.json(result);
                });

            }else{
                res.json(404, {"error": 'Invalid account id'});
            }
        });

    };

    /**
     * Increment an account date by specified days
     * @param  Object   req  Express Request object
     * @param  Object   res  Express Request object
     * @param  Function next Goto next middleware/route
     * @return void
     */
    this.incrementAccount = function(req, res, next) {

        req.checkBody('days', 'Invalid days parameter').notEmpty();
        req.checkBody('days', 'Invalid days parameter').isInt();
        req.checkBody('id', 'Invalid id').notEmpty();

        var days = req.body.days;

        if(self.handleErrors(req.validationErrors(), res))
            return;

        collection.byId(req.body.id, function(e, account){
            if (e) return next(e);

            if(_.isEmpty(account))
                return res.json(404, {"error": 'Invalid account id'});

            //Do each task in order
            async.series([
                function(callback){
                    self.calculatePocketMoney(account, days, callback);
                },
                function(callback){
                    self.calculateInterest(account, days, callback);
                },
                function(callback){
                    self.updateCurrentDate(account, days, callback);
                }
            ], function(){
                collection.byId(req.body.id, function(e, updatedAccount){
                    res.json(updatedAccount);
                });
            });
        });

    };

    /**
     * Calculate Pocket money
     * - Every time we pass pocket money day add a pocket money transaction
     * @param  Object   account
     * @param  int   days
     * @param  Function callback
     * @return void
     */
    this.calculatePocketMoney = function(account, days, callback) {

        var start = moment(account.current_date),
            queue = async.queue(self.addTransaction, 1); //Use an async queue to manage transaction callbacks

        for (var i = days; i >= 0; i--) {
            start.add('days', 1);
            if(parseInt(account.pocket_money_day,10) === parseInt(start.format('d'), 10)){


                //Add Pocketmoney transaction
                queue.push({
                    "accountId": account.id,
                    "amount": account.pocket_money_amount,
                    "description": 'Pocket Money (auto)',
                    "deposit": true,
                    "withdrawal": false,
                    "date": start.clone().toDate()
                });

                console.log(start.toDate());
            }
        }

        if(queue.length() < 1)
            callback();

        //When the queue's finished
        queue.drain = function(){
            callback();
        };
    };

    /**
     * Calculate interest money
     * - Every time we pass monday add interest
     * @param  Object   account
     * @param  int   days
     * @param  Function callback
     * @return void
     */
    this.calculateInterest = function(account, days, callback) {

        callback();

        // var start = moment(account.current_date),
        //     queue = async.queue(self.addTransaction, 1); //Use an async queue to manage transaction callbacks

        // for (var i = days; i >= 0; i--) {

        //     if(parseInt(account.pocket_money_day,10) === parseInt(start.add('days', 1).format('d'), 10)){

        //         //Add Pocketmoney transaction
        //         queue.push({
        //             "accountId": account.id,
        //             "amount": account.pocket_money_amount,
        //             "description": 'Pocket Money (auto)',
        //             "deposit": false,
        //             "withdrawal": true,
        //             "date": start.toDate()
        //         });
        //     }
        // }

        // //When the queue's finished
        // queue.drain = function(){
        //     callback();
        // };
    };

    /**
     * Update the account's current date by x days
     * @param  Object   account
     * @param  int   days
     * @param  Function callback
     * @return void
     */
    this.updateCurrentDate = function(account, days, callback){

        var start = moment(account.current_date);
        start.add('days', days);

        var update = {current_date: start.toDate()};

        collection.updateById(account.id, { $set : update }, function(e, result){
            if (e) return next(e);

            callback();
        });
    };

    /**
     * Add transaction to acccount
     * - For use as a ASYNC queue worker
     * @param Object   transaction
     * @param Function callback
     */
    this.addTransaction = function(transaction, callback) {

        var accountId = transaction.accountId;

        console.log(transaction);

        delete transaction.accountId;

        collection.updateById(accountId, { $push: { "transactions": transaction }}, function(e, update){
            if (e) return callback(e);

            callback();

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
            return true;
        }else{
            return false;
        }
    };
}

module.exports = Account;