#Simple Account API

##Requirements

* Node [http://nodejs.org/]()
* MongoDB [http://www.mongodb.org/]()

##Installation

1. Git clone 
2. Start Mongo DB server `mongod`
3. Install dependancies `npm install`
4. Run the app `node app.js`

The API should now be available at: [http://localhost:3000]()

##API calls:
Summary of calls:

* `/account - POST`: Create account
* `/account - DELETE`: Delete account
* `/account/:id - GET`: Get account info
* `/account - GET`: Get all accounts
* `/account - PUT`: Update account info 
* `/account/increment - POST`: Move account's date forward in time
* `/transaction - POST`: Add a transaction to an account
* `/transaction/:id/:type?/:date_start?/:date_end? - GET`: Get transactions for an account, optional filtering.

All calls respond with JSON.

##Tests
There are some tests using Mocha, ExpectJS and Superagent. These make mock requests to the API and test for correct responses.

Once the dependencies have been installed, run `mocha` in the project folder to run tests.

-----------------------------------

##Test Console

There is a test console that gives access to most of the API functionality here:
[http://localhost:3000/test]()

##Example apps
* Sponsor: http://localhost:3000/test/sponsor.html
* Receiver: http://localhost:3000/test/receiver.html

##Base JavaScript API wrapper
The JavaScript file `static/js/acc.js` provides an abstracted interface to the API. 
