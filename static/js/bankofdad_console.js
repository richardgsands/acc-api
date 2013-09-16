var BOD = BOD || {};

BOD.CONFIG = BOD.CONFIG || {};
BOD.CONFIG.DEBUG = true;

BOD.testConsole = function(){

    var $alert,
        loadedAccounts;

    /**
     * Starting point
     * @return void
     */
    this.init = function(){

        $alert = $('.alert');

        getAccounts();
        bindForms();
    };

    this.getAccounts = function(){

        BOD.core.getAccounts().done(function(accounts){

            loadedAccounts = accounts;

            for(var index in accounts){

                var account = accounts[index];
                var $select = $('<option></option>');

                $select.html(account.id + "  " + account.parent_name + ' - ' + account.child_name);
                $select.val(account.id);

                $('.accounts-select').append($select);
            }

            changeUpdateFormValues(accounts[0]);
        });

    };

    this.changeUpdateFormValues = function(account){

        $('.update-account').find('input').val('');

        for(var field in account){
            $('.update-account').find('input[name=' + field +']').val(account[field]);
        }

    };

    /**
     * Bind events to forms
     * @return void
     */
    this.bindForms = function(){

        //Create
        $('.create-account').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            BOD.core.createAccount(data).done(function(response){
                $alert.html('Created account: ' + response.id);
            });
        });

        $('.update-account').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            console.log(data);

            BOD.core.updateAccount(data).done(function(response){
                $alert.html('Updated account: ' + response.id);
            });
        });

        $('.accounts-select').on('change', function(e){
            var id = $(this).val();

            for(var index in loadedAccounts){
                var account = loadedAccounts[index];
                if(account.id == id){
                    changeUpdateFormValues(account);
                    console.log(account);
                }
            }
        });
    };

    /**
     * Get input data from form helper
     * @param  Object form   jQuery object
     * @return void
     */
    this.getInputData = function(form){

        var data = {};

        form.find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        return data;
    };


    return {
        init: init
    };
}();

$(document).ready(function(){
    BOD.testConsole.init();
});