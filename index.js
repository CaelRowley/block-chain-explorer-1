require('babel-core/register');
require('babel-polyfill');
const CassandraDBUtils = require('./cassandra/dbUtils.js');
const ElasticSearchDBUtils = require('./elasticsearch/dbUtils.js');
const BlockChainData = require('./blockchaindata/explorer.js');
const BlockToDB = require("./datatransfer/blockToDB.js");
const DBToElasticSearch = require("./datatransfer/dbToElasticsearch.js");
const BlockToElastic = require("./datatransfer/blockToElastic.js");


//DBUtils
var cassandraSetup = { contactPoints: ['127.0.0.1'], keyspace: 'blockchainexplorer' };
var cassandraDBUtils = new CassandraDBUtils(cassandraSetup);

var elasticSearchSetup = {host: 'localhost:9200'};
var elasticSearchDBUtils = new ElasticSearchDBUtils(elasticSearchSetup);

//BlockChainData
const GRPC_HOSTNAME_PORT = {hostname:"127.0.0.1", port:"50051"};
var blockChainData = new BlockChainData(GRPC_HOSTNAME_PORT);

//DTO's
var blocktoDB = new BlockToDB(blockChainData, cassandraDBUtils);
var dbToElasticSearch = new DBToElasticSearch(cassandraDBUtils, elasticSearchDBUtils);
var blockToElastic = new BlockToElastic(blockChainData, elasticSearchDBUtils);


function putAllDataIntoDB(){
	blocktoDB.putAllBlockDataIntoDB();      
	blocktoDB.putAllWitnessesIntoDB();
	blocktoDB.putAllNodesIntoDB();
	blocktoDB.putAllAccountsIntoDB();
	blocktoDB.putAllIssuedAssetsIntoDB();
}

function putAllDataIntoElastic(){
	//dbToElasticSearch.putAllBlockDataIntoElasticSearch();
	dbToElasticSearch.putAllWitnessDataIntoElasticSearch();
	dbToElasticSearch.putAllAccountsDataIntoElasticSearch();
	dbToElasticSearch.putAllNodeDataIntoElasticSearch();
	dbToElasticSearch.putAllIssuedAssetsIntoElasticSearch();
}

//putAllDataIntoDB();
putAllDataIntoElastic();

// Put data into DB
// blocktoDB.putAllBlockDataIntoDB();      //   0-100
// blocktoDB.putAllWitnessesIntoDB();
// blocktoDB.putAllNodesIntoDB();
// blocktoDB.putAllAccountsIntoDB();
// blocktoDB.putAllIssuedAssetsIntoDB();

// Insert into elastic search
// dbToElasticSearch.putAllBlockDataIntoElasticSearch();
// dbToElasticSearch.putAllWitnessDataIntoElasticSearch();
// dbToElasticSearch.putAllAccountsDataIntoElasticSearch();
// dbToElasticSearch.putAllNodeDataIntoElasticSearch();
// dbToElasticSearch.putAllIssuedAssetsIntoElasticSearch();

// add get tronix price => https://api.coinmarketcap.com/v1/ticker/tronix/
// let dataPromise = cassandraDBUtils.getAllBlocks();

// dataPromise.then(function(dataFromLocalNode){
//     console.log(dataFromLocalNode);
// });
