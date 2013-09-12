var _ = require('underscore');

/**
 * Account bashed route handling
 * @param object db  MongoSkin db instance
 */
function Account(db){

    var self = this;

    this.createAccount = function(req, res) {

        //Validate post fields
        req.checkBody('parent_name', 'Invalid parent name').notEmpty();
        req.checkBody('child_name', 'Invalid child name').notEmpty();

        self.handleErrors(req.validationErrors(), res);

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

    };

    this.deleteAccount = function(req, res) {

        req.checkBody('id', 'Invalid id').notEmpty();

        self.handleErrors(req.validationErrors(), res);

        var collection = db.collection('account');

        collection.removeById(req.body.id, {}, function(e, results){
            if (e) return next(e);

            if(results === 1)
                res.json({"deleted": req.body.id});
            else
                res.json(404, {"error": 'Nothing to delete'});
        });

    };

    this.readAccount =  function(req, res) {

        req.assert('id', 'Invalid id').notEmpty();

        self.handleErrors(req.validationErrors(), res);

        var collection = db.collection('account');

        collection.byId(req.params.id, function(e, result){
            if (e) return next(e);

            if(!_.isEmpty(result)){
                res.json(result);
            }else{
                res.json(404, {"error": 'No account found'});
            }
        });

    };

    this.setSavingRate = function(req, res) {

        req.checkBody('id', 'Invalid id').notEmpty();
        req.checkBody('rate', 'No rate specified').notEmpty();

        self.handleErrors(req.validationErrors(), res);

        var collection = db.collection('account');

        collection.updateById(req.body.id, {saving_rate:req.body.rate}, function(e, result){
            if (e) return next(e);

             if(result === 1)
                res.json({"rate": req.body.rate});
            else
                res.json(404, {"error": 'Invalid account id'});
        });
    };

    this.setLoanRate = function(req, res) {

        req.checkBody('id', 'Invalid id').notEmpty();
        req.checkBody('rate', 'No rate specified').notEmpty();

        self.handleErrors(req.validationErrors(), res);

        var collection = db.collection('account');

        collection.updateById(req.body.id, {loan_rate:req.body.rate}, function(e, result){
            if (e) return next(e);

             if(result === 1)
                res.json({"rate": req.body.rate});
            else
                res.json(404, {"error": 'Invalid account id'});
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

module.exports = Account;