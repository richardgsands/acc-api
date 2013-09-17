var ACCOUNT_ID = "523716b2cd87cad76a000001";

$(document).ready(function(){

    BOD.core.getAccount({id: ACCOUNT_ID}).done(function(account){

        $('.balance .value').html(account.balance);

        $('.update-account input[name=loan_rate]').val(account.loan_rate);
        $('.update-account input[name=saving_rate]').val(account.saving_rate);
        $('.update-account input[name=pocket_money_amount]').val(account.pocket_money_amount);
        $('.update-account select[name=pocket_money_day]').val(account.pocket_money_day);

    });

    $('.update-account').on('submit', function(e){

        e.preventDefault();

        var data = {
            id: ACCOUNT_ID
        };

        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        BOD.core.updateAccount(data, function(data){
            console.log('UPDATED');
        });
    });

    $('.create-deposit').on('submit', function(e){

        e.preventDefault();

        var data = {
            account_id: ACCOUNT_ID,
            deposit: true,
            withdrawal: false
        };

        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        BOD.core.createTransaction(data, function(data){
            console.log('UPDATED');
        });
    });

    $('.create-withdrawal').on('submit', function(e){

        e.preventDefault();

        var data = {
            account_id: ACCOUNT_ID,
            deposit: false,
            withdrawal: true
        };

        $(this).find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        BOD.core.createTransaction(data, function(data){
            console.log('UPDATED');
        });
    });
});