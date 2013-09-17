var ACCOUNT_ID = "523716b2cd87cad76a000001";

$(document).ready(function(){

    BOD.core.getAccount({id: ACCOUNT_ID}).done(function(account){

        $('.balance .value').html(account.balance);

        var current_date = moment.utc(account.current_date);
        var tillPocketMoney = 0;

        if(current_date.format('d') > account.pocket_money_day){
            tillPocketMoney = 7 - parseInt(current_date.format('d'), 10);
        }else{
            tillPocketMoney = account.pocket_money_day - parseInt(current_date.format('d'), 10);
        }

        $('.pocket-money .value').html(tillPocketMoney);

        if(!!account.goal.name)
            $('.goals input[name=name]').val(account.goal.name);

        if(!!account.goal.value){
            $('.goals input[name=value]').val(account.goal.value);

            var target = account.goal.value;

            if(account.balance < target){

                var difference = target - account.balance;

                var weeksLeft = Math.ceil(difference / account.pocket_money_amount);

                $('.goals .value').html(weeksLeft);
            }
        }



    });

    $('.update-account').on('submit', function(e){

        e.preventDefault();

        var data = {
            id: ACCOUNT_ID,
            goal: {

            }
        };

        $(this).find('input,select').each(function() {
            data.goal[$(this).attr('name')] = $(this).val();
        });

        BOD.core.updateAccount(data, function(data){
            console.log('UPDATED');
        });
    });
});