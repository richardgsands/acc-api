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

    return {
        createAccount: createAccount,
        getAccounts: getAccounts,
        updateAccount: updateAccount
    };
}();
