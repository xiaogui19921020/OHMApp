$(document).ready(function() {

	init();

	currentAddress = common.getCookie("currentAddress");
	if(currentAddress) {
		$("#connectWalletBtn span").html("Disconnect");
		$("#connectWalletBtn").attr("isConnect", "1");
		//connectWallet(); 	
	}

	$("#connectWalletBtn").click(async function() {
		var isConnect = $("#connectWalletBtn").attr("isConnect");
		if(isConnect == 1) {
			$("#connectWalletBtn span").html("Connect Wallet");
			$("#connectWalletBtn").attr("isConnect", "0");

		} else {
			connectWallet();
		}
	})

	$("#stakeInputBtn").click(function() {
		var stakeInputVal = $("#stakeInput").val();
		var ohmAmount = stakeInputVal * 1000000000;

		$(this).attr("disabled", "disabled");

		StakingHelpContract.methods.stake(ohmAmount).send({
			from: currentAddress
		}).then(result => {
			initContractData();
			alertify.success("SUCCESS");
			$(this).removeAttr("disabled");
		}).catch((err) => {
			alertify.error("FAIL");
			$(this).removeAttr("disabled");
		});

	})

	$("#unstakeInputBtn").click(function() {

		$(this).attr("disabled", "disabled");

		var unstakeInputVal = $("#unstakeInput").val();
		var ohmAmount = unstakeInputVal * 1000000000;
		StakingContract.methods.unstake(ohmAmount, false).send({
			from: currentAddress
		}).then(result => {
			$(this).removeAttr("disabled");
			alertify.success("SUCCESS");
			initContractData();
		}).catch((err) => {
			alertify.error("FAIL");
			$(this).removeAttr("disabled");
		});

	})

	$("#approveBtn").click(function() {

		if(!currentAddress) {
			alertify.error(common.connectWalletErrMsg());
			return;
		}

		var ddd = "100000000000000000000000000";
		OHMContract.methods.approve(StakingHelpAddress, ddd).send({
			from: currentAddress
		}).then(result => {
			alertify.success("SUCCESS");
			common.setCookie("isApproved", true);

			$("#stakeApproveDiv").hide();
			$("#stakeOHMDiv").show();

			initContractData();
		}).catch((err) => {
			alertify.error("FAIL");
		});

	})

	$("#approveUnstakeBtn").click(function() {
		var ddd = "100000000000000000000000000";
		sOHMContract.methods.approve(StakingAddress, ddd).send({
			from: currentAddress
		}).then(result => {
			alertify.success("SUCCESS");

			$("#unstakeApproveDiv").hide();
			$("#unstakeApproveInputDiv").show();

			common.setCookie("isUnstakeApproved", true);
		}).catch((err) => {
			alertify.error("FAIL");
		});

	})

})

function init() {

	var isApproved = common.getCookie("isApproved");
	if(isApproved == "true") {
		$("#stakeApproveDiv").hide();
		$("#stakeOHMDiv").show();
	}

	var isUnstakeApproved = common.getCookie("isUnstakeApproved");
	if(isUnstakeApproved == "true") {
		$("#unstakeApproveDiv").hide();
		$("#unstakeApproveInputDiv").show();
	} else {
		$("#unstakeApproveDiv").show();
		$("#unstakeApproveInputDiv").hide();
	}

}

async function connectWallet() {
	await ethereum.enable(); // Request access
	let accounts = await web3.eth.getAccounts();
	currentAddress = accounts[0]

	common.setCookie("currentAddress", currentAddress);

	$("#connectWalletBtn span").html("Disconnect");
	$("#connectWalletBtn").attr("isConnect", "1");
}

async function initUserContractData() {
	if(!currentAddress) {
		return;
	}

	let ohmBalanceOF = await OHMContract.methods.balanceOf(currentAddress).call();
	let sohmBalanceOF = await sOHMContract.methods.balanceOf(currentAddress).call();

	$("#stakeInput").val(ohmBalanceOF / daiwei);
	$("#unstakeInput").val(sohmBalanceOF / daiwei);

	$("#UnstakedBalance").html((ohmBalanceOF / daiwei).toFixed(2) + " KOM");
	$("#StakedBalance").html((sohmBalanceOF / daiwei).toFixed(2) + " sKOM");
	$("#NextRewardAmount").html((sohmBalanceOF / daiwei * rewardRate).toFixed(2) + " sKOM");
}

async function initContractData() {

	initUserContractData();

	let totalSupply = await OHMContract.methods.totalSupply().call();
	let sohmTotalSupply = await sOHMContract.methods.totalSupply().call();
	let TreasuryBalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call();
	let index = await StakingContract.methods.index().call();

	var getReserves = await OHMPriceContract.methods.getReserves().call();
	var OHMPriceStr = (getReserves[0] / getReserves[1]) / daiwei + "";
	OHMPrice = OHMPriceStr.substring(0, OHMPriceStr.indexOf(".") + 3);

	var apyvalStr = Math.pow((1 + rewardRate), 1095) + "";
	var apyval = apyvalStr.substring(0, apyvalStr.indexOf(".") + 5)
	$("#APY").html(apyval * 100 + "%");
	$("#TotalValueDeposited").html("$" + parseInt(sohmTotalSupply / daiwei * OHMPrice))
	$("#CurrentIndex").html(parseFloat(index / daiwei).toFixed(2));

	$("#NextRewardYield").html(rewardRate * 100 + " %");
	$("#ROIRate").html(parseInt(Math.pow((1 + rewardRate), 15) - 1) + " %");
}

window.addEventListener('load', async function() {
	currentAddress = common.getCookie("currentAddress");

	if(window.ethereum) {
		window.web3 = new Web3(ethereum);
	} else if(window.web3) {
		window.web3 = new Web3(web3.currentProvider);
	}

	OHMContract = await new web3.eth.Contract(OHMABI1, OHMAddress);

	sOHMContract = await new web3.eth.Contract(sOHMABI, sOHMAddress);

	DaiContract = await new web3.eth.Contract(DaiABI, DaiAddress);

	StakingContract = await new web3.eth.Contract(StakingABI, StakingAddress);

	StakingHelpContract = await new web3.eth.Contract(StakingHelpABI, StakingHelpAddress);

	DAISLPbondContract = await new web3.eth.Contract(DAISLPbondABI, DAISLPbondAddress);

	DAIbondContract = await new web3.eth.Contract(DAIbondABI, DAIbondAddress);

	OHMPriceContract = await new web3.eth.Contract(OHMPriceABI, OHMPriceAddress);

	initContractData();
})

window.ethereum.on('accountsChanged', function(accounts) {
	// Time to reload your interface with accounts[0]!
	location.reload();
})

window.ethereum.on('networkChanged', function(networkId) {
	// Time to reload your interface with the new networkId
	location.reload();
})