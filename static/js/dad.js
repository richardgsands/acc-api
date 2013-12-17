//Account id for this child
var ACCOUNT_ID = "523716b2cd87cad76a000001";

//When the page has loaded
$(document).ready(function(){

    //Get account info
    ACC.core.getAccount({id: ACCOUNT_ID}).done(function(account){

        //Display balance on screen
        $('.balance .value').html(account.balance);


        //Update values of the account update form
        $('.update-account input[name=loan_rate]').val(account.loan_rate);
        $('.update-account input[name=saving_rate]').val(account.saving_rate);
        $('.update-account input[name=pocket_money_amount]').val(account.pocket_money_amount);
        $('.update-account select[name=pocket_money_day]').val(account.pocket_money_day);

    });

    //When the account update form is submitted
    $('.update-account').on('submit', function(e){

        //Stop the page reloading
        e.preventDefault();

        //Prep data
        var data = {
            id: ACCOUNT_ID
        };


        //Add each form input to data object
        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        //Do API call
        ACC.core.updateAccount(data, function(data){
            //successfully updated
        });
    });

    //When the deposit create form is submitted
    $('.create-deposit').on('submit', function(e){

        //Stop the page reloading
        e.preventDefault();

        //Prep data
        var data = {
            account_id: ACCOUNT_ID,
            deposit: true,
            withdrawal: false
        };

        //Add each form input to data object (amount and description)
        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        //Do API call
        ACC.core.createTransaction(data, function(data){
            //successfully updated
        });
    });

    $('.create-withdrawal').on('submit', function(e){

        //Stop the page reloading
        e.preventDefault();

        //Prep data
        var data = {
            account_id: ACCOUNT_ID,
            deposit: false,
            withdrawal: true
        };

        //Add each form input to data object (amount and description)
        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        //Do API call
        ACC.core.createTransaction(data, function(data){
            //successfully updated
        });
    });
});