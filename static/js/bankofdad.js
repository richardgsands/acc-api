var BOD = BOD || {};

BOD.CONFIG = {
    api: "http://localhost:3000"
};

/**
 * Bank of Dad - Core
 * @return Object
 */
BOD.core = function(){

    /**
     * Create a new account
     * @param  Object data
     * @return Object   Promise
     */
    this.createAccount = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;

    };

    this.getAccounts = function(){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', {}, 'GET', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;
    };

    this.updateAccount = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/account', data, 'PUT', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;
    };

    this.createTransaction = function(data){

        var promise = $.Deferred();

        makeRequest(BOD.CONFIG.api + '/transaction', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;
    };

    this.getTransactions = function(data){

        var url = BOD.CONFIG.api + '/transaction';
        ///transaction/:id/:type?/:date_start?/:date_end?
        if(!data.id)
            return false;
        else
            url += '/' + data.id;

        if(data.type === 'withdrawal' || data.type === 'deposit' || data.type === 'none')
            url += '/' + data.type;

        if(data.date_start)
            url += '/' + data.date_start.replace(/\//g, '-');

        if(data.date_end)
            url += '/' + data.date_end.replace(/\//g, '-');

        var promise = $.Deferred();

        makeRequest(url, {}, 'GET', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;

    };

    this.incrementAccount = function(data){

        var promise = $.Deferred();

        makeRequest('/account/increment', data, 'POST', function(err, data){

            if(!err)
                promise.resolve(data);
        });

        return promise;
    };

    /**
     * Request wrapper
     * @param  String   url
     * @param  Object   data
     * @param  String   type
     * @param  Function callback
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
        incrementAccount: incrementAccount
    };
}();
