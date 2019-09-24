import Arweave from 'arweave/web';

const arweaveOptions = {
    host: 'arweave.net',// Hostname or IP address for a Arweave node
    port: 443,           // Port, defaults to 1984
    protocol: 'https',  // Network protocol http or https, defaults to http
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
};

const arweave = Arweave.init(arweaveOptions);


export const getWalletAddress = async (wallet) => {
    let arweaveAddress = undefined;

	try {
      arweaveAddress = await arweave.wallets.jwkToAddress(wallet);
	}
	catch(error) {
      console.log("unable to get wallet address");
	}

	return arweaveAddress;
}

export const getWalletBalance = async (walletAddress) => {
    let arweaveBalance = undefined;

	try {
      const balance = await arweave.wallets.getBalance(walletAddress);

      if (balance) {
      	arweaveBalance = arweave.ar.winstonToAr(balance);
      }
	}
	catch(error) {
      console.log("unable to get wallet balance");
	}

	return arweaveBalance;
}

export const getWalletTransactions = async (walletAddress) => {
    let arweaveTransactions = [];

	try {
      arweaveTransactions = await arweave.arql({
		    op: "equals",
		    expr1: "from",
		    expr2: walletAddress
		});
	}
	catch(error) {
      console.log("unable to get wallet transactions");
	}

	return arweaveTransactions;
}

export const getTransactionDetails = async (transactionId) => {
	let transactionDetails = null;

	try {
		transactionDetails = await arweave.transactions.get(transactionId);
	}
	catch(error) {
		console.error(error);
		console.error("unable to get transaction details");
	}

	return transactionDetails;
}

export const saveMemo = async(userWallet, data) => {
	let memoSaved = false;

	try {
       let transaction = await arweave.createTransaction({ data: data.memo}, userWallet);
	   transaction.addTag('wevr-memo-date-added', data.dateAdded);
	   transaction.addTag('wevr-memo-location', data.memoLocation);
	   transaction.addTag('wevr-memo-saved', 'yes');

	   await arweave.transactions.sign(transaction, userWallet);

	   const response = await arweave.transactions.post(transaction);
       memoSaved = response.status === 200 ? true : false;
	}
	catch (error) {
		console.error(error);
		console.error("unable to save memo");
	}
	
	return memoSaved;
}

export const getUserMemos = async (walletAddress) => {
	let userMemos = [];

	try {
        userMemos = await arweave.arql({
		      op: "and",
			  expr1: {
			    op: "equals",
			    expr1: "from",
			    expr2: walletAddress
			  },
			  expr2: {
			    op: "equals",
			    expr1: "wevr-memo-saved",
			    expr2: "yes"
			  }
		});
  
	}
	catch(error) {
	  console.log(error);
      console.log("unable to get user memos");
	}

	return userMemos;
}
