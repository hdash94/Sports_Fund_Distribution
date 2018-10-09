var organisation = artifacts.require("./organisation.sol");
var auction = artifacts.require("./auction.sol");

contract('organisation', function(accounts) {
	var OrgInstance;
	var auctionInstance;
	var passvalue = 100000;

	it('registers the player and the company', function() {
		return organisation.deployed().then(function(instance) {
			OrgInstance = instance;
			return OrgInstance.RegisterPlayer.call(123456, {from: accounts[1]});
		}).then(function(success) {
			assert.equal(success, true, 'Player registered');
			return OrgInstance.RegisterCompany.call(1234567, {from: accounts[2]});
		}).then(function(success) {
			assert.equal(success, true, 'Company Registered');
		})
	})

	it('Request and transfering funds to player', function() {
		return organisation.deployed().then(function(instance) {
			OrgInstance = instance;
			return OrgInstance.request_for_funds.call(123456, {from: accounts[1]});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			OrgInstance.RegisterPlayer(123456, {from: accounts[1]});
			return OrgInstance.request_for_funds(123456, {from: accounts[2]});
		}).then(assert.fail).catch(function(error) {
		 	assert(error.message.indexOf('revert') >= 0, 'error detected');
		 	return OrgInstance.request_for_funds(1234, {from: accounts[1]});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error detected');
			OrgInstance.RegisterPlayer(1234567, {from: accounts[0]});
			return OrgInstance.request_for_funds(1234567, {from: accounts[0]});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 2, 'triggers two event');
			assert.equal(receipt.logs[0].event, 'Request_accept', 'triggers the request accepted event');
			assert.equal(receipt.logs[0].args._requestor, accounts[0], 'registers the msg.sender'); 
			assert.equal(receipt.logs[0].args._UIN, 1234567, 'the id registered through');
			assert.equal(receipt.logs[1].event, 'Funds_transfered', 'triggers the funds transferred event');
			assert.equal(receipt.logs[1].args._requestor, accounts[0], 'registers the requestor'); 
			assert.equal(receipt.logs[1].args._UIN, 1234567, 'the id registered through');
		})
	})

	it('Request for bidding and registering a company', function() {
		return organisation.deployed().then(function(instance) {
			OrgInstance = instance;
			return auction.deployed();
		}).then(function(instance) {
			auctionInstance = instance;
			return OrgInstance.RegisterCompany.call(123456789, {form: accounts[5]});
		}).then(function(success) {
			assert.equal(success, true, 'Company Registered');
			return auctionInstance.address
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has contract address');
			return OrgInstance.O_auction();
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has auction contract address listed in the present contract');
			OrgInstance.pass_value(100000, {from: accounts[0]});
			auctionInstance.set_value_of_project(100000);
			return auctionInstance.value();
		}).then(function(amount) {
			assert.equal(amount.toNumber(), 100000, 'the project value has been passed');
		})
	})
})
