var organisation = artifacts.require("./organisation.sol");
var auction = artifacts.require("./auction.sol");

	module.exports = function(deployer) {
  		deployer.deploy(organisation, auction.address).then(function() {
  			return deployer.deploy(auction);
  		})
	};
