$(document).ready (function (){
	initialise_app();
	init_handlers ();
});

/*
 * The DOM handling */

function init_handlers () {
	$('#btn-wallet').on('click', create_wallet);
	$('#btn-balance').on('click', get_balance);
	$('#btn-address').on('click', get_address);
	$('#btn-transact').on('click', handle_transaction);
}

/*
 * Functionality I => Wallet Creation */

function create_wallet () {
	$('.secondary-container').hide();
	$('#wallet').css ('display', 'block');
	var _w = createWallet ();
	$('#lbl-private-key').text (_w.privatekey);
	$('#lbl-public-key').text (_w.address);
}

/*
 * Functionality II => Balance Check */

function get_balance () {
	$('.secondary-container').hide();
	$('#balance').css ('display', 'block');
	$('#btn-submit-getbal').off();
	$('#btn-submit-getbal').on('click', handle_get_bal);
}

function handle_get_bal () {
	var privatekey = $('#ip-private-key-bal').val();
	var amount;
	try {
		amount = getBalanceFromPrivateKey(privatekey);
	}
	catch (e) {
		console.error ('Exception in get balance', e);
		alert ('Not working as contract not added yet!');
		return;
	}
	$('#lbl-balance').closest('div').css('display','block');
	$('#lbl-balance').text (amount);
}

/*
 * Functionality III => Address From Key */

function get_address () {
	$('.secondary-container').hide();
	$('#address').css ('display', 'block');
	$('#btn-submit-getaddr').off();
	$('#btn-submit-getaddr').on('click', handle_get_addr);
}

function handle_get_addr () {
	var privatekey = $('#ip-private-key-addr').val();
	var address;
	try {
		address = getAddress(privatekey);
	}
	catch (e) {
		console.error ('Exception in get address', e);
		alert ('Error occurred, Is the key valid?');
		return;
	}

	$('#lbl-address').closest('div').css('display','block');
	$('#lbl-address').text (address);
}

/*
 * Functionality IV => Transactions */

function handle_transaction () {
	$('.secondary-container').hide();
	$('#transact').css ('display', 'block');
	$('#btn-submit-transact').off();
	$('#btn-submit-transact').on('click', transact_click_handler);
}

function transact_click_handler (ev) {

	var pvt_key   = $('#ip-private-key-transact').val();
	var dest_addr = $('#ip-address-transact').val();
	var amount    = $('#ip-amount-transact').val();

	do_transaction (pvt_key, dest_addr, amount);
}

/*
 * The core functionality */

var web3;

function initialise_app () {
	web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider('http://faucet.ropsten.be:3001/'));
}

function createWallet(){

	var privateKey =uuid();
	var address = getAddress(privateKey);

	return {
		"privatekey":privateKey,
		"address":address
	};
}

function getAddress(privateKey){

	var Wallet = ethers.Wallet;
	var wallet = new Wallet('0x'+privateKey);
	var address = wallet.address;

	return address;
}


function uuid() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxxxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
  });
}

function getBalanceFromPrivateKey(privateKey){
	var address = getAddress(privateKey);
	return getBalance(address);
}

function getBalance(address) {
    var balance = web3.eth.getBalance(address).toNumber();
	return balance;
}


/*
 * Transactions core logic */

function do_transaction (pvt_key, dest_addr, amount) {

	try {
		var self_addr = getAddress (pvt_key);
		var abi = 'contract abi';

		web3.eth.getTransactionCount(self_addr, function (err, nonce) {
			var data = 'data to be sent to contract';

			var tx = new ethereumjs.Tx({
						nonce: nonce,
						gasPrice: web3.toHex(web3.toWei('20', 'gwei')),
						gasLimit: 100000,
						to: dest_addr,
						value: 0,
						data: data,
					});

			tx.sign(ethereumjs.Buffer.Buffer.from(pvt_key, 'hex'));

			var raw = '0x' + tx.serialize().toString('hex');
			web3.eth.sendRawTransaction(raw, function (err, transactionHash) {
				console.log(transactionHash);
			});
		});
	}
	catch (e) {
		console.error ('Exception caught in do_transaction', e);
		$('#lbl-transact-status').closest('div').css('display', 'block');
		$('#lbl-transact-status').text("Errored! Contract not added yet!");
	}
}
