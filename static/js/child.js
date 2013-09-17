//Account id for this child
var ACCOUNT_ID = "523716b2cd87cad76a000001";

//When the page has loaded
$(document).ready(function(){

    //Get account info
    BOD.core.getAccount({id: ACCOUNT_ID}).done(function(account){

        //Display balance on screen
        $('.balance .value').html(account.balance);

        //Get current date from account (not real world date!!)
        var current_date = moment.utc(account.current_date);

        //Work out when how many days until the next pocket money
        var tillPocketMoney = 0;

        if(current_date.format('d') > account.pocket_money_day){
            //The next pocket money day is in the next week
            tillPocketMoney = 7 - parseInt(current_date.format('d'), 10);
        }else{
            //The next pocket money day is this week
            tillPocketMoney = account.pocket_money_day - parseInt(current_date.format('d'), 10);
        }

        //It was paid today so we've got a week ahead
        if(tillPocketMoney === 0)
            tillPocketMoney = 7;

        //Display the picket money on screen
        $('.pocket-money .value').html(tillPocketMoney);

        //If we've got them display the account goal name and target (value)
        if(!!account.goal.name)
            $('.goals input[name=name]').val(account.goal.name);

        if(!!account.goal.value){
            $('.goals input[name=value]').val(account.goal.value);

            //Calculate how many more weeks of pocket money we'll need to get before we meet target
            var target = account.goal.value;

            if(account.balance < target){

                var difference = target - account.balance;

                var weeksLeft = Math.ceil(difference / account.pocket_money_amount);

                //Display week count on screen
                $('.goals .value').html(weeksLeft);
            }
        }



    });

    //Update account with goal information from form
    $('.update-account').on('submit', function(e){

        //Stop the page reloading
        e.preventDefault();

        //Prep data
        var data = {
            id: ACCOUNT_ID,
            goal: {

            }
        };

        //Get form values and store in data.goal object
        $(this).find('input,select').each(function() {
            data.goal[$(this).attr('name')] = $(this).val();
        });

        //Do API call
        BOD.core.updateAccount(data, function(data){
            //Update successful
        });
    });
});