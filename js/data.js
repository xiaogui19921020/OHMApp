$(document).ready(function() {
	setInterval(initContractData, 3000);
})


function query() {
	$.ajax({
		url: "http://localhost:8080/data/query",
		type: "get",
		async:false, 
		success: function(data) {
			alert(JSON.stringify(data));
			
			$("#MarketCap").html("$" + data.MarketCap);
			$("#OHMPrice").html("$" + data.OHMPrice);
			$("#CirculatingSupply").html(data.CirculatingSupply);
		
			$("#BackingperOHM").html(data.BackingperOHM);
		
			$("#CurrentIndex").html(data.CurrentIndex);
			
		}
	})

}

async function initContractData(){

	var data =  {"a10":1}

	

	let totalSupply = await OHMContract.methods.totalSupply().call(); console.log('totalSupply is: ' + totalSupply);

	let sohmTotalSupply = await sOHMContract.methods.totalSupply().call(); console.log('sohmTotalSupply is: ' + parseInt(sohmTotalSupply / 100000000));

	let TreasuryBalanceOf = await DaiContract.methods.balanceOf(TreasuryAddress).call(); console.log('TreasuryBalanceOf is: ' + TreasuryBalanceOf);

	let index = await StakeContract.methods.index().call(); console.log('index is: ' + index);

	var getReserves = await OHMPriceContract.methods.getReserves().call();
	var OHMPriceStr = (getReserves[1] / getReserves[0]) / daiwei + ""; OHMPrice = OHMPriceStr.substring(0, OHMPriceStr.indexOf(".") + 3);
	console.log('OHMPrice is: ' + OHMPrice);

	$("#MarketCap").html("$" + parseInt(OHMPrice / daiwei * totalSupply)); 
	$("#OHMPrice").html("$" + OHMPrice);
	$("#CirculatingSupply").html(parseInt(sohmTotalSupply / daiwei) + " / " + parseInt(totalSupply / daiwei));

	var BackingperOHMVal = (parseInt(TreasuryBalanceOf / daiwei18) / parseInt(totalSupply / daiwei)).toFixed(2)
	$("#BackingperOHM").html("$" + BackingperOHMVal);

	$("#CurrentIndex").html(parseFloat(index / daiwei).toFixed(2) + " sOHM");
	
	
	data.OHMPrice = OHMPrice;
	data.MarketCap = parseInt(OHMPrice / daiwei * totalSupply);
	data.CirculatingSupply = parseInt(sohmTotalSupply / daiwei) + " / " + parseInt(totalSupply / daiwei);
	data.BackingperOHM = BackingperOHMVal;
	data.CurrentIndex = parseFloat(index / daiwei).toFixed(2);
	$.ajax({
		type: "POST",
		url: "http://localhost:8080/data/add",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(data),
		success: function(resp) {
			alertify.success(JSON.stringify(data))
		},
		error: function(err) {
			data.error(err)
		}
	})

}

window.addEventListener('load', async function() {

	if(window.ethereum) {
		window.web3 = new Web3(ethereum);
	} else if(window.web3) {
		window.web3 = new Web3(web3.currentProvider);
	}

	//await ethereum.enable(); // Request access

	OHMContract = await new web3.eth.Contract(OHMABI1, OHMAddress)

	sOHMContract = await new web3.eth.Contract(sOHMABI, sOHMAddress)

	DaiContract = await new web3.eth.Contract(DaiABI, DaiAddress)

	StakeContract = await new web3.eth.Contract(StakingABI, StakingAddress)

	DAIbondContract = await new web3.eth.Contract(DAIbondABI, DAIbondAddress);

	DAISLPbondContract = await new web3.eth.Contract(DAISLPbondABI, DAISLPbondAddress);

	OHMPriceContract = await new web3.eth.Contract(OHMPriceABI, OHMPriceAddress);

	initContractData();
})