var isDAIApproved;
var isLPApproved;
var bondType;

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
		if(!stakeInputVal){
			alertify.error("FAIL");
			return;
		}
		
		var valstr = new BigNumber(stakeInputVal * daiwei18);
		var ttt = stakeInputVal + stakeInputVal * 0.5;
		DAIbondContract.methods.deposit(valstr,ttt*100, currentAddress).send({
			from: currentAddress
			}).then(result => {
				DAIbondContractData();
				alertify.success("SUCCESS");
			}).catch((err) => {
				alertify.error("FAIL");
			});
		
		
	})

	$("#redeemInputBtn").click(function() {
		DAIbondContract.methods.redeem(currentAddress,false).send({
			from: currentAddress
			}).then(result => {
				alertify.success("SUCCESS");
			}).catch((err) => {
				alertify.error("FAIL");
			});
	})

	$("#approveBtn").click(function() {
		
		if(bondType == "DAI"){
			var ddd = "100000000000000000000000000";
			DaiContract.methods.approve(DAIbondAddress, ddd).send({
			from: currentAddress
			}).then(result => {
				alertify.success("SUCCESS");
				common.setCookie("isBondApproved", true);
				
				$("#bondApproveDiv").hide();
				$("#bondOHMDiv").show();
				$("#bondOHMInputDiv").show();
				
	
			}).catch((err) => {
				alertify.error("FAIL");
			});
		}
		
		
	})
})


function init() {

	var isBondApproved = common.getCookie("isBondApproved");
	if(isBondApproved == "true") {
		$("#bondApproveDiv").hide();
		$("#bondOHMDiv").show();
		$("#bondOHMInputDiv").show();
	}else{
		$("#bondApproveDiv").show();
		$("#bondOHMDiv").hide();
	}
}

function showSetting(t) {
	
	if(!currentAddress) {
		alertify.error(common.connectWalletErrMsg());
		return;
	}
	
	//alert("showSetting");
	$('.MuiBackdrop-root22').show();
	
	var tableName = $(t).parent().parent().parent().find(".tableName").html();
	var tablePrice = $(t).parent().parent().parent().find(".tablePrice").html();
	var tableROI = $(t).parent().parent().parent().find(".tableROI").html();

	bondType = tableName;
	$("#titleSetting").html(tableName);
	$("#BondPrice").html(tablePrice);
	$(".bond-setting-roi").html(tableROI);

	if(tableName == "DAI") {
		
		DAIbondContractData();
		
		isDAIApproved = common.getCookie("isDAIApproved");
		if(isDAIApproved == "true") {
			$("#bondApproveDiv").hide();
			$("#bondOHMDiv").show();
		}
		
	}else{
		isLPApproved = common.getCookie("isLPApproved");
		if(isLPApproved == "true") {
			$("#bondApproveDiv").hide();
			$("#bondOHMDiv").show();
		}
	}
}


async function connectWallet() {
	await ethereum.enable(); // Request access
	let accounts = await web3.eth.getAccounts()
	currentAddress = accounts[0]
	console.log('currentAddress is: ' + currentAddress)

	common.setCookie("currentAddress", currentAddress);

	$("#connectWalletBtn span").html("Disconnect");
	$("#connectWalletBtn").attr("isConnect", "1");

	//$("#RecipientAddress").val(currentAddress);

	$("#RecipientAddress").attr("value", currentAddress);
}

async function DAIbondContractData(){
	let currentAddressBalanceOf = await DaiContract.methods.balanceOf(currentAddress).call();
	$("#bond-YourBalance").html((currentAddressBalanceOf / daiwei18).toFixed(2) + "DAI");
	
	let maxPayout = await DAIbondContract.methods.maxPayout().call();
	let debtRatio = await DAIbondContract.methods.debtRatio().call();
	$("#MaxYouCanBuy").html((maxPayout/daiwei).toFixed(2) +" KOM");
	$(".DebtRatio").html((debtRatio/daiwei*100).toFixed(2) +"%");
	
	
	let pendingPayoutFor = await DAIbondContract.methods.pendingPayoutFor(currentAddress).call();
	//console.log('pendingPayoutFor is: ' + pendingPayoutFor);
	$("#ClaimableRewards").html((pendingPayoutFor / daiwei).toFixed(4) + "KOM");
}

async function initContractData() {
	let totalSupply = await OHMContract.methods.totalSupply().call();

	let sohmTotalSupply = await sOHMContract.methods.totalSupply().call();

	let TreasuryBalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call();

	let index = await StakingContract.methods.index().call();

	var getReserves = await OHMPriceContract.methods.getReserves().call();
	var OHMPriceStr = (getReserves[0] / getReserves[1]) / daiwei + "";
	OHMPrice = OHMPriceStr.substring(0, OHMPriceStr.indexOf(".") + 3)

	$("#OHMPrice").html("$" + OHMPrice);
	$("#KittyPrice").html("$" + OHMPrice);

	$("#TreasuryBalance").html("$" + (TreasuryBalanceOf / daiwei18).toFixed(0));
	initTableData();
}


async function initUserContractData() {
	if(!currentAddress) {
		return;
	}

	
	//$("#bond-YouWillGet").html((currentAddressBalanceOf / daiwei18).toFixed(2) + "DAI")
}

async function initTableData() {
	initUserContractData();
	
	let bondPriceInUSD = await DAIbondContract.methods.bondPriceInUSD().call();
	var DAIPrice = (bondPriceInUSD / daiwei18).toFixed(1);
	var DAIPriceRIO = (OHMPrice - DAIPrice) / OHMPrice;
	//console.log('DAIPrice is: ' + DAIPrice);
	//console.log('DAIPriceRIO is: ' + (DAIPriceRIO * 100).toFixed(2) + "%");
	
	let PurchasedbalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call();
	

	/*let SLPbondPriceInUSD = await DAISLPbondContract.methods.bondPriceInUSD().call();
	var SLPDAIPrice = (SLPbondPriceInUSD / daiwei18).toFixed(1);
	var SLPDAIPriceRIO = (OHMPrice - SLPDAIPrice) / OHMPrice;
	console.log('SLPDAIPrice is: ' + SLPDAIPrice);
	console.log('SLPDAIPriceRIO is: ' + (SLPDAIPriceRIO * 100).toFixed(2) + "%");*/

	//pc
	$("#daiPrice-pc").html("$" + DAIPrice);
	$("#daiRoi-pc").html((DAIPriceRIO * 100).toFixed(2) + "%");
	$("#daiPurchased-pc").html("$" + (PurchasedbalanceOf / daiwei18).toFixed(0))
	//$("#lpPrice-pc").html("$" + SLPDAIPrice);
	//$("#lpRoi-pc").html((SLPDAIPriceRIO * 100).toFixed(2) + "%");
	//mobile
	$("#daiPrice-mobile").html("$" + DAIPrice);
	$("#daiRoi-mobile").html((DAIPriceRIO * 100).toFixed(2) + "%");
	$("#daiPurchased-mobile").html("$" + (PurchasedbalanceOf / daiwei18).toFixed(0))
	//$("#lpPrice-mobile").html("$" + SLPDAIPrice);
	//$("#lpRoi-mobile").html((SLPDAIPriceRIO * 100).toFixed(2) + "%");
}

window.addEventListener('load', async function() {

	currentAddress = common.getCookie("currentAddress");

	window.web3 = new Web3(web3.currentProvider);

	OHMContract = await new web3.eth.Contract(OHMABI1, OHMAddress)

	sOHMContract = await new web3.eth.Contract(sOHMABI, sOHMAddress)

	DaiContract = await new web3.eth.Contract(DaiABI, DaiAddress)

	StakingContract = await new web3.eth.Contract(StakingABI, StakingAddress)

	DAIbondContract = await new web3.eth.Contract(DAIbondABI, DAIbondAddress);

	//DAISLPbondContract = await new web3.eth.Contract(DAISLPbondABI, DAISLPbondAddress);

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