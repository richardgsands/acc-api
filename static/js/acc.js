var BOD = BOD || {};

BOD.CONFIG = {
    api: "http://localhost:3000"
};

/**
 * Bank of Dad - Core
 * - This class/module provides an interace to the Bank of Dad API
 * @return Object
 */
BOD.core = function(){

    /**
     * Create a new account
     * - POST /account
     * - Params inside data Object
     * - Requires 'parent_name' and 'child_name'
     * @param  Object data
     * @return Object   Promise
     */
    this.createAccount = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;

    };

    /**
     * Get all accounts
     * - GET /account
     * - No params required / taken
     * @return Object Promise
     */
    this.getAccounts = function(){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', {}, 'GET', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;
    };

    /**
     * Get single account
     * - GET /account/:id
     * - No params required / taken
     * @return Object Promise
     */
    this.getAccount = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account/' + data.id, {}, 'GET', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;
    };

    /**
     * Update Account
     * - PUT /account
     * - Params inside data Object
     * - Requires an account 'id'
     * - Optionally sets 'loan_rate', 'saving_rate', 'pocket_money_amount' and 'pocket_money_day'
     * - Optionally sets 'goal' with properties 'name', 'value' and 'type'
     * @param  Object data
     * @return Object Promise
     */
    this.updateAccount = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', data, 'PUT', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;
    };

    /**
     * Create transaction
     * - POST /transaction
     * - Params inside data Object
     * - Requires an account 'id'
     * - Requires a 'description'
     * - Requires an 'amount'
     * - Requires either 'withdrawal' or 'deposit' to be true
     * @param  Object data
     * @return Object Promise
     */
    this.createTransaction = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/transaction', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;
    };

    /**
     * Get transactions
     * - GET /transaction/:id/:type?/:date_start?/:date_end?
     * - Params inside data Object
     * - Requires an account 'id'
     * - Optionally filter by type (withdrawal, deposit, either)
     * - Optionally by date range in format dd-mm-yy, will also accept dd/mm/yyy using 'date_start' and 'date_end'
     * @param  Object data
     * @return Object Promise
     */
    this.getTransactions = function(data){

        var url = BOD.CONFIG.api + '/transaction';

        if(!data.id)
            return false;
        else
            url += '/' + data.id;

        if(data.type === 'withdrawal' || data.type === 'deposit' || data.type === 'either')
            url += '/' + data.type;

        if(data.date_start)
            url += '/' + data.date_start.replace(/\//g, '-');

        if(data.date_end)
            url += '/' + data.date_end.replace(/\//g, '-');

        var promise = $.Deferred();

        makeRequest(url, {}, 'GET', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;

    };

    /**
     * Incremement account
     * - POST /account/increment
     * - Params inside data Object
     * - Move account forward in time by specified days
     * - Data should include 'id' and 'days' keys
     * @param  Object data
     * @return Object Promise
     */
    this.incrementAccount = function(data){

        var promise = $.Deferred();

        makeRequest('/account/increment', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
            else
                promise.reject();
        });

        return promise;
    };

    /**
     * Request wrapper
     * - Performs ajax request and uses callback when complete
     * @param  String   url     URL to request
     * @param  Object   data    Data for post/put requests
     * @param  String   type    Request type, defaults to GET
     * @param  Function callback    Will pass true as first parameter of callback on error
     * @return void
     */
    this.makeRequest = function(url, data, type, callback){

        type = type || 'GET';

        if(BOD.CONFIG.DEBUG)
            console.log("Making AJAX request to: " + url);

        $.ajax({
            url: url,
            data: data,
            type: type,
            success: function(data, status){

                if(BOD.CONFIG.DEBUG){
                    console.log("AJAX request returned: " + status);
                    console.log(data);
                }

                if(status === 'success')
                    callback(false, data);
                else
                    callback(true);
            },
            error: function(xhr, textStatus, error){

                if(BOD.CONFIG.DEBUG){
                    console.log("AJAX request failed: " + error);
                }

                callback(true);
            }
        });
    };

    //Exposed methods
    return {
        createAccount: createAccount,
        getAccounts: getAccounts,
        updateAccount: updateAccount,
        createTransaction: createTransaction,
        getTransactions: getTransactions,
        incrementAccount: incrementAccount,
        getAccount: getAccount
    };
}();
