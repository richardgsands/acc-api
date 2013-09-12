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

    it('set saving rate validation fail', function(done){
        superagent.post('http://localhost:3000/account/set-saving-rate')
        .send({
            id: id
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);
            expect(res.body.rate).to.be.eql(undefined);

            done();
        });
    });

    it('set saving rate', function(done){
        superagent.post('http://localhost:3000/account/set-saving-rate')
        .send({
            id: id,
            rate: 50,
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.rate).to.be(50);

            done();
        });
    });

    it('set loan rate validation fail', function(done){
        superagent.post('http://localhost:3000/account/set-loan-rate')
        .send({
            id: id
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).to.be(true);
            expect(res.body.rate).to.be.eql(undefined);

            done();
        });
    });

    it('set loan rate', function(done){
        superagent.post('http://localhost:3000/account/set-loan-rate')
        .send({
            id: id,
            rate: 50,
        })
        .end(function(e,res){
            expect(e).to.eql(null);
            expect(res.body.error).not.to.be(true);
            expect(res.body.rate).to.be(50);

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

});