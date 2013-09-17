var superagent = require('superagent'),
    expect = require('expect.js'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment');


describe('Bank of Dad API', function(){


    /** ACCOUNT **/
    var id,
        fake_current_date = moment.utc("15/09/2013", "DD-MM-YYYY");

    it('create account fail validation', function(done){
        superagent.post('http://localhost:3000/account')
        .send({
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);
            done();
        });
    });

    it('create account', function(done){
        superagent.post('http://localhost:3000/account')
        .send({
            parent_name: 'Gary',
            child_name: 'Robbie',
            current_date: fake_current_date.toDate()
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.id).to.not.be.empty();

            id = res.body.id;

            done();
        });
    });

    it('read account', function(done){
        superagent.get('http://localhost:3000/account/' + id)
        .send()
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body).to.not.be.empty();
            expect(res.body.id).to.not.be.empty();

            done();
        });
    });

    it('read account', function(done){
        superagent.get('http://localhost:3000/account')
        .send()
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body).to.not.be.empty();

            done();
        });
    });

    it('update account validation fail', function(done){
        superagent.put('http://localhost:3000/account')
        .send({
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);
            expect(res.body.rate).to.be.eql(undefined);

            done();
        });
    });

    it('update account', function(done){
        superagent.put('http://localhost:3000/account')
        .send({
            id: id,
            saving_rate: 50,
            loan_rate: 10,
            pocket_money_amount: 5,
            pocket_money_day: 3,
            goal: {
                name: "My new bike",
                value: 150,
                type: "bike"
            }
        })
        .end(function(e,res){

            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.saving_rate).to.be(50);
            expect(res.body.loan_rate).to.be(10);
            expect(res.body.pocket_money_amount).to.be(5);
            expect(res.body.pocket_money_day).to.be(3);
            expect(res.body.goal.name).to.be("My new bike");
            expect(res.body.goal.value).to.be(150);
            expect(res.body.goal.type).to.be("bike");

            done();
        });
    });

    it('increment account', function(done){
        superagent.post('http://localhost:3000/account/increment')
        .send({
            days: 15,
            id: id
        })
        .end(function(e,res){

            expect(e).to.eql(null);

            //Check date has been incrememeted correctly
            var returned_date = moment(res.body.current_date);
            fake_current_date.add('days', 15);
            expect(fake_current_date.isSame(returned_date)).to.be(true);

            //Check transactions entered by description
            var returnedTransactions = _.pluck(res.body.transactions, 'description');
            var expectedTransactions = [ 'Interest payment (auto)', 'Pocket Money (auto)', 'Interest payment (auto)', 'Pocket Money (auto)', 'Interest payment (auto)' ];
            expect(returnedTransactions).to.eql(expectedTransactions);

            //Based on account's info above, balance should be made up for 2 £5 payments of pocket money, 3 interest payments if 0,0.05 and 0.1
            expect(res.body.balance).to.be(10.15);

            done();
        });
    });

    it('test large withdrawal and loan account', function(done){
        superagent.post('http://localhost:3000/transaction')
        .send({
            account_id: id,
            amount: 20,
            description: "A test withdrawal",
            deposit: 0,
            withdrawal: 1,
            date: moment.utc("15/09/2013", "DD-MM-YYYY").toDate()
        }).end(function(e,res){
             superagent.post('http://localhost:3000/account/increment/')
            .send({
                days: 8,
                id: id
            }).end(function(e,res){

                expect(e).to.eql(null);

                expect(res.body.balance).to.be(0.14);

                done();
            });
        });

    });


    // it('delete account fail validation', function(done){
    //     superagent.del('http://localhost:3000/account')
    //     .send({
    //     })
    //     .end(function(e,res){
    //         expect(e).to.eql(null);
    //         expect(res.body.error).to.be(true);
    //         expect(res.body.deleted).to.be.eql(undefined);

    //         done();
    //     });
    // });

    // it('delete account', function(done){
    //     superagent.del('http://localhost:3000/account')
    //     .send({
    //         id: id
    //     })
    //     .end(function(e,res){
    //         expect(e).to.eql(null);
    //         expect(res.body.error).not.to.be(true);
    //         expect(res.body.deleted).to.not.be.empty();

    //         done();
    //     });
    // });


    /** **/


    /** TRANSACTION **/

    var idForTrans;

    it('create transaction', function(done){

        superagent.post('http://localhost:3000/account')
        .send({
            parent_name: 'Geoff',
            child_name: 'Penelope'
        })
        .end(function(e,res){

            idForTrans = res.body.id;

            superagent.post('http://localhost:3000/transaction')
            .send({
                account_id: idForTrans,
                amount: 10,
                description: "A test payment deposit",
                deposit: 0,
                withdrawal: 1
            })
            .end(function(e,res){

                expect(e).to.eql(null);
                expect(res.body.error).not.to.be(true);
                expect(res.body.transactions[0].amount).to.be(10);
                expect(res.body.transactions[0].description).to.be("A test payment deposit");
                expect(res.body.transactions[0].deposit).to.be(false);
                expect(res.body.transactions[0].withdrawal).to.be(true);

                done();
            });
        });

    });

    it('create transaction with custom date', function(done){

        var dateInFuture = moment().weekday(2);

        superagent.post('http://localhost:3000/transaction')
        .send({
            account_id: idForTrans,
            amount: 10,
            description: "A test payment deposit with custom date",
            deposit: 0,
            withdrawal: 1,
            date: dateInFuture.toDate()
        })
        .end(function(e,res){

            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.transactions[1].amount).to.be(10);
            expect(res.body.transactions[1].description).to.be("A test payment deposit with custom date");
            expect(res.body.transactions[1].deposit).to.be(false);
            expect(res.body.transactions[1].withdrawal).to.be(true);
            expect(moment(res.body.transactions[1].date).isSame(dateInFuture)).to.be(true);

            done();
        });
    });

    it('read transaction validation fail', function(done){

         superagent.get('http://localhost:3000/transaction/invalidid')
        .send()
        .end(function(e,res){

            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);

            done();
        });

    });

    it('read transaction', function(done){

        superagent.get('http://localhost:3000/transaction/' + idForTrans)
        .send()
        .end(function(e,res){

            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);

            expect(res.body.transactions[0].amount).to.be(10);
            expect(res.body.transactions[0].description).to.be("A test payment deposit");
            expect(res.body.transactions[0].deposit).to.be(false);
            expect(res.body.transactions[0].withdrawal).to.be(true);

            done();
        });

    });

    it('read transactions with date range', function(done){

        var count = 0;
        var queue = async.whilst(function(){
            return count < 101;
        }, function(callback){
            count++;
            insertTransaction(count, idForTrans, callback);
        }, function(){
            console.log('Inserted ' + (count - 1) + ' transactions');

            //A 50 day range.
            var startDate = moment().weekday(+25);
            var endDate = moment().weekday(+75);
            var format = 'DD-MM-YYYY';

            superagent.get('http://localhost:3000/transaction/' + idForTrans + '/all/' + startDate.format(format) + '/' + endDate.format(format))
            .send()
            .end(function(e,res){

                expect(e).to.eql(null);
                expect(res.body.error).not.to.be(true);

                expect(res.body.transactions.length).to.be(50);

                //The first item should be the 25th to be inserted. Because we're removing the first 25 days worth and ordering by date.
                expect(res.body.transactions[0].description).to.be("A test payment deposit with custom date no: 25");

                done();
            });

        });

    });

    it('read transactions with type', function(done){

        superagent.get('http://localhost:3000/transaction/' + idForTrans + '/withdrawal')
            .send()
            .end(function(e,res){

                expect(e).to.eql(null);
                expect(res.body.error).not.to.be(true);

                //Check all data returned
                _.each(res.body.transactions, function(item){
                    expect(item.withdrawal).to.be(true);
                });

                done();
            });
    });

    //CLEAN UP
    it('delete transaction account', function(done){
        superagent.del('http://localhost:3000/account')
        .send({
            id: idForTrans
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.deleted).to.not.be.empty();

            done();
        });
    });

    /** **/

});


function insertTransaction(x, idForTrans, callback){

    var dateInFuture = moment().weekday(x),
        deposit = Math.round(Math.random() * 1);

    superagent.post('http://localhost:3000/transaction')
    .send({
        account_id: idForTrans,
        amount: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
        description: "A test payment deposit with custom date no: " + x,
        deposit: deposit,
        withdrawal: !deposit,
        date: dateInFuture.toDate()
    }).end(function(){
        callback();
    });

}