$(document).ready(function() {
	setTimeout(initContractData, 10000);

	var currentAddress = common.getCookie("currentAddress");
	if(currentAddress) {
		$("#connectWalletBtn span").html("Disconnect");
		$("#connectWalletBtn").attr("isConnect", "1");
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
	
})


async function connectWallet() {
	await ethereum.enable(); // Request access
	let accounts = await web3.eth.getAccounts()
	currentAddress = accounts[0]

	common.setCookie("currentAddress", currentAddress);

	$("#connectWalletBtn span").html("Disconnect");
	$("#connectWalletBtn").attr("isConnect", "1");
}

async function initContractData() {
	let totalSupply = await OHMContract.methods.totalSupply().call();
	let sohmTotalSupply = await sOHMContract.methods.totalSupply().call();
	let TreasuryBalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call();
	let index = await StakeContract.methods.index().call();

	var getReserves = await OHMPriceContract.methods.getReserves().call();
	var OHMPriceStr = (getReserves[0] / getReserves[1]) / daiwei + "";
	OHMPrice = OHMPriceStr.substring(0, OHMPriceStr.indexOf(".") + 3);

	$("#MarketCap").html("$" + parseInt(OHMPrice / daiwei * totalSupply));
	$("#OHMPrice").html("$" + OHMPrice);
	$("#CirculatingSupply").html(parseInt(sohmTotalSupply / daiwei) + " / " + parseInt(totalSupply / daiwei));

	var BackingperOHMVal = (parseInt(TreasuryBalanceOf / daiwei18) / parseInt(totalSupply / daiwei)).toFixed(2)
	$("#BackingperOHM").html("$" + BackingperOHMVal);

	$("#CurrentIndex").html(parseFloat(index / daiwei).toFixed(2));

}

window.addEventListener('load', async function() {

	if(window.ethereum) {
		window.web3 = new Web3(ethereum);
	} else if(window.web3) {
		window.web3 = new Web3(web3.currentProvider);
	}

	OHMContract = await new web3.eth.Contract(OHMABI1, OHMAddress)

	sOHMContract = await new web3.eth.Contract(sOHMABI, sOHMAddress)

	DaiContract = await new web3.eth.Contract(DaiABI, DaiAddress)

	StakeContract = await new web3.eth.Contract(StakingABI, StakingAddress)

	DAIbondContract = await new web3.eth.Contract(DAIbondABI, DAIbondAddress);

	DAISLPbondContract = await new web3.eth.Contract(DAISLPbondABI, DAISLPbondAddress);

	OHMPriceContract = await new web3.eth.Contract(OHMPriceABI, OHMPriceAddress);

	initContractData();
})