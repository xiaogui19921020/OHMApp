$(document).ready(function() {

	init();

	$("#stakeInputBtn").click(function() {
		var stakeInputVal = $("#stakeInput").val();
		alertify.success(stakeInputVal);
	})

	$("#unstakeInputBtn").click(function() {
		var unstakeInputVal = $("#unstakeInput").val();
		alertify.success(unstakeInputVal);
	})

	$("#approveBtn").click(function() {
		OHMContract.methods.approve(currentAddr, 1).send({
			from: currentAddr
		}).then(result => {
			console.log('approve success: ' + result.toString());
			common.setCookie("isApproved", true);

			$("#stakeApproveDiv").hide();
			$("#stakeOHMDiv").show();
		}).catch((err) => {
			console.log('approve error: ' + result);
		});

	})
})

function init() {

	var isApproved = common.getCookie("isApproved");
	if(isApproved == "true") {
		$("#stakeApproveDiv").hide();
		$("#stakeOHMDiv").show();
	}
}


async function  initUserContractData(){
	
}


async function  initContractData(){
	
	currentAddress = common.getCookie("currentAddress");
	
	let totalSupply = await OHMContract.methods.totalSupply().call();
	let ohmBalanceOF = await OHMContract.methods.balanceOf(currentAddress).call();
	console.log('totalSupply is: ' + totalSupply);
	console.log('ohmBalanceOF is: ' + ohmBalanceOF);
	
	let sohmTotalSupply = await sOHMContract.methods.totalSupply().call();
	let sohmBalanceOF = await sOHMContract.methods.balanceOf(currentAddress).call();
	console.log('sohmTotalSupply is: ' + sohmTotalSupply  );
	console.log('sohmBalanceOF is: ' + sohmBalanceOF);
	
	
	let TreasuryBalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call();
	console.log('TreasuryBalanceOf is: ' + TreasuryBalanceOf);
	
	let index = await StakeContract.methods.index().call();
	console.log('index is: ' + index);
	
	var getReserves = await OHMPriceContract.methods.getReserves().call();
	var OHMPriceStr = (getReserves[0] / getReserves[1]) + "";
	OHMPrice =  OHMPriceStr.substring(0, OHMPriceStr.indexOf(".") + 3)
	console.log('OHMPrice is: ' + OHMPrice);
	
	
	
	
	$("#stakeInput").val(ohmBalanceOF/daiwei);
	$("#unstakeInput").val(sohmBalanceOF/daiwei);
	
	var apyvalStr = Math.pow((1 + rewardRate),1095) + "";
	var apyval =  apyvalStr.substring(0, apyvalStr.indexOf(".") + 5)
	$("#APY").html(apyval * 100 + "%");
	$("#TotalValueDeposited").html("$" + parseInt(sohmTotalSupply / daiwei *  OHMPrice ) )
	$("#CurrentIndex").html(parseFloat(index/daiwei).toFixed(2) +  " sOHM");
	
	
	$("#UnstakedBalance").html((ohmBalanceOF/daiwei) +" OHM");
	$("#StakedBalance").html((sohmBalanceOF/daiwei) +" sOHM");
	$("#NextRewardAmount").html((sohmBalanceOF/daiwei)*rewardRate +" sOHM");
	$("#NextRewardYield").html(rewardRate * 100 +" %");
	$("#ROIRate").html(parseInt( Math.pow((1 + rewardRate),15) - 1 )   +" %");
}

window.addEventListener('load', async function() {
	window.web3 = new Web3(ethereum);
	await ethereum.enable(); // Request access
	
	OHMContract = await new web3.eth.Contract(OHMABI1, OHMAddress)

	sOHMContract = await new web3.eth.Contract(sOHMABI, sOHMAddress)

	DaiContract = await new web3.eth.Contract(DaiABI, DaiAddress)

	StakeContract = await new web3.eth.Contract(StakingABI, StakingAddress)

	//DAIbondContract = await new web3.eth.Contract(DAIbondABI, DAIbondAddress);

	OHMPriceContract = await new web3.eth.Contract(OHMPriceABI, OHMPriceAddress);

	initContractData();
})

