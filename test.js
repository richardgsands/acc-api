var superagent = require('superagent'),
    expect = require('expect.js');


describe('Bank of Dad API', function(){


    /** ACCOUNT **/
    var id;

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
            child_name: 'Robbie'
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
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.saving_rate).to.be(50);
            expect(res.body.loan_rate).to.be(10);
            expect(res.body.pocket_money_amount).to.be(5);
            expect(res.body.pocket_money_day).to.be(3);

            done();
        });
    });

    it('delete account fail validation', function(done){
        superagent.del('http://localhost:3000/account')
        .send({
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);
            expect(res.body.deleted).to.be.eql(undefined);

            done();
        });
    });

    it('delete account', function(done){
        superagent.del('http://localhost:3000/account')
        .send({
            id: id
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.deleted).to.not.be.empty();

            done();
        });
    });


    /** **/


    /** TRANSACTION **/
    it('create transaction', function(done){

        superagent.post('http://localhost:3000/account')
        .send({
            parent_name: 'Geoff',
            child_name: 'Penelope'
        })
        .end(function(e,res){

            id = res.body.id;

            superagent.post('http://localhost:3000/transaction')
            .send({
                account_id: id,
                amount: 10,
                description: "A test payment deposit",
                deposit: 0,
                withdrawal: 1
            })
            .end(function(e,res){

                console.log(res.body);

                expect(e).to.eql(null);
                expect(res.body.error).not.to.be(true);
                expect(res.body.transactions[0].amount).to.be(10);
                expect(res.body.transactions[0].description).to.be("A test payment deposit");
                expect(res.body.transactions[0].deposit).to.be(1);
                expect(res.body.transactions[0].withdrawal).to.be(0);

                done();
            });
        });

    });

});