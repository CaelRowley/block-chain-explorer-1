import {HttpClient, GrpcClient} from "@tronprotocol/wallet-api";
const {base64DecodeFromString, byteArray2hexStr, bytesToString} = require("@tronprotocol/wallet-api/src/utils/bytes");
const deserializeTransaction = require("@tronprotocol/wallet-api/src/protocol/serializer").deserializeTransaction;
const {Block, Transaction, Account} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const { getBase58CheckAddress, signTransaction, passwordToAddress } = require("@tronprotocol/wallet-api/src/utils/crypto");
const {EmptyMessage, NumberMessage} = require("@tronprotocol/wallet-api/src/protocol/api/api_pb");
const Client = new HttpClient();

var hostnameAndPort = {hostname:"127.0.0.1", port:"50051"};
const GRPCClient = new GrpcClient(hostnameAndPort);

class BlockChainData {
	constructor(construction) {
		console.log(construction);
	}

  	//     HTTP FUNCTIONS  

	async getLatestBlock() {
		let latestBlock = await Client.getLatestBlock();
		console.log(latestBlock);
	}

	async getBlockByNum(number) {
		let blockByNum = await Client.getBlockByNum(number);
		console.log(blockByNum);
	}

	async getNodes(){
		let allNodes = await Client.getNodes();
		return allNodes
	}

	async getAllBlocksAsBulkRequest(){
		let latestBlock = await Client.getLatestBlock();

		let blockData;
		let bulkRequest = [];

		//change here for testing!
		for(var i = 20; i < 30; i++){
			let currentBlock = await Client.getBlockByNum(i);
			blockData = {
		    	parentHash: currentBlock.parentHash,
		    	number: currentBlock.number,
		    	time: currentBlock.time,
		    	witnessAddress: currentBlock.witnessAddress,
		    	transactions: currentBlock.transactions,
		    	transactionsCount: currentBlock.transactionsCount
		    };
		    bulkRequest.push({index: {_index: 'blocks', _type: 'block', _id: currentBlock.number}});
		    bulkRequest.push(blockData);
		}

		return bulkRequest;
  	}

  	//     GRPC FUNCTIONS  
  	
	async getBlockFromLocalNode(number){
		let nativeBlock = await GRPCClient.getBlockByNumber(number);
		return this._returnParsedBlockData(nativeBlock);
	}

	async getLatestBlockFromLocalNode(){
		let getNowBlock = await this.getNowBlock();
		return this._returnParsedBlockData(getNowBlock);
	}

	async getNowBlock() {
		return await GRPCClient.api.getNowBlock(new EmptyMessage());
	}

	/*async getTransactionByIdFromLocalNode(id) {
		let message = new NumberMessage();
    	message.setNum(id);
		return await this.api.getTransactionById(message)
	}*/

  	_returnParsedBlockData(nativeBlock){
  		let transactions = [];

    	for (let transaction of nativeBlock.getTransactionsList()) {
      		transactions = transactions.concat(deserializeTransaction(transaction));
    	}

  		let tronJsonBlock =  {
		      //size: recentBlock.length,
		      parentHash: byteArray2hexStr(nativeBlock.getBlockHeader().getRawData().getParenthash()),
		      number: nativeBlock.getBlockHeader().getRawData().getNumber(),
		      witnessAddress: getBase58CheckAddress(Array.from(nativeBlock.getBlockHeader().getRawData().getWitnessAddress())),
		      time: nativeBlock.getBlockHeader().getRawData().getTimestamp(),
		      transactionsCount: nativeBlock.getTransactionsList().length,
		      contractType: Transaction.Contract.ContractType,
		      transactions,
    	};

    	return tronJsonBlock;
  	}
}

module.exports = BlockChainData;
