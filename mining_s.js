// HEADER INFORMATION
// Redis defined.
/*
var redisURL = url.parse('redis://127.0.0.1:6379');
var redisClient = require('redis').createClient(
  redisURL.port,
  redisURL.hostname,
  { no_ready_check: true }
);
if (redisURL.auth) {
  redisClient.auth(redisURL.auth.split(':')[1]);
}
*/
// other modules
const SHA256 = require("crypto-js/sha256");
const fs = require('fs');

var url = require('url');
var redisURL = url.parse('redis://127.0.0.1:6379');
var redisClient = require('redis').createClient(
  redisURL.port,
  redisURL.hostname,
  { no_ready_check: true }
);
if (redisURL.auth) {
  redisClient.auth(redisURL.auth.split(':')[1]);
}

var mining_ac_nickname = 'kama10001';
var g_pendingTransactions = [];  // array of pending transactions

var jikan = require('./jikan.js');
var jikan_dt = new jikan();


// blockchain section
class Transaction{
    constructor(value_date, amount, currency, tran_name, fromAddress, toAddress, remarks, email){
        this.value_date = value_date;
        this.amount = amount;
        this.currency = currency;
        this.tran_name = tran_name;
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.remarks = remarks;
        this.email = email;
        this.tran_timestamp = jikan_dt.ima_m();
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp +
JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        // to search hash value.
        while (this.hash.substring(0, difficulty) !== Array(difficulty
+ 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        // to text out transactions.
/*        for ( var i=0; i < this.transactions.length; i++ ) {
            console.log("Tran[ " + i + " ] is from : " + this.transactions[i].fromAddress + " to : " + this.transactions[i].toAddress + " amount : " + this.transactions[i].amount + " . ");
        }  */
//        this.hash = this.calculateHash();
        console.log("block info is : " + JSON.stringify(this));
        fs.writeFileSync( "./db/" + this.hash + ".json" , JSON.stringify(this));


        console.log("BLOCK MINED: " + this.hash);
    }
}


class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
//        this.pendingTransactions = g_pendingTransactions;
        this.miningReward = 5;
    }

    createGenesisBlock() {
        return new Block(Date.parse("2017-01-01"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), g_pendingTransactions,
this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);
        g_pendingTransactions = [];  // to initialize transactions
        g_pendingTransactions.push(new Transaction(jikan_dt.ima_m().substring(0,7), this.miningReward, 'HRD', 'MINING', null, miningRewardAddress, null, null));   // put transaction for reward of mining.
    }

    createTransaction(transaction){
        g_pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

function ac_find(nickname) {
    return fs.readFileSync( __dirname + '/master/' + nickname + '.hash' , 'utf-8');
}

let hiroseCoin = new Blockchain();   // start blockchain of hiroseCoin


class recTrans {
  constructor(chain) {
    this.count = 0;
    this.rectrans = [];

  }
  checktrans(queue = 'webtochain') {
//    redisClient.get('web_to_chain_1', function (err, reply) {
    var ar_t = [];

    redisClient.lrange(queue, 0, -1, function(err, items) {

      if (err) throw err;
//      console.log("lenght is " + items.length);
      var cnt = items.length;
      items.forEach(function (reply, index) {
        console.log("Reply " + index + ": " + reply);
  //      var msgobj = JSON.parse(reply);
  //      ar.push(msgobj);
        var msgobj = JSON.parse(reply);

        hiroseCoin.createTransaction(new Transaction(msgobj.value_date, msgobj.amount, msgobj.currency, msgobj.tran_name, ac_find(msgobj.fromAddress), ac_find(msgobj.toAddress), msgobj.remarks, msgobj.email));   // create transaction data on the memory
//          ar_t.push(reply);
      });

      for (var i = 0; i < cnt; i++ ) {
        redisClient.lpop(queue, function(err, items){
          if (err) throw err;
        });
      }
    });
    return ar_t;
  }
}



var rec_data = new recTrans();    // create receiving program.
var rec_msgs = [];
var timer1, timer2 = null;
var cnt = 0;
var s_monitor = 0;

class maintenance {
    constructor(){
    }
    watch_mining_s(){

          redisClient.lrange('maintenance', 0, -1, function(err, items) {

            if (err) throw err;
      //      console.log("lenght is " + items.length);
            var cnt = items.length;
            items.forEach(function (reply, index) {
              console.log("Reply " + index + ": " + reply);
        //      var msgobj = JSON.parse(reply);
        //      ar.push(msgobj);
              var msgobj = JSON.parse(reply);
              if (msgobj.server == 'mining_s') {
                s_monitor = 1 ;                         // monitor flag to stop mining_s or not.
                console.log('mining_s will stop soon.');
              }

            });

            for (var i = 0; i < cnt; i++ ) {
              redisClient.lpop('maintenance', function(err, items){
                if (err) throw err;
              });
            }
          });

    }
}

var mainte = new maintenance();
// rec_msgs = rec_data.checktrans('webtochain');   //  export transactions from redis


var mining_main = function(){   // this is callback function for timer.

  if (s_monitor == 0 ) {
      mainte.watch_mining_s();      //  check stop-mining
  }

  rec_msgs = rec_data.checktrans('webtochain');   //  export transactions from redis
  if ( g_pendingTransactions.length == 0 ) {
        g_pendingTransactions.push(new Transaction(jikan_dt.ima_m().substring(0,7), 5, 'HRD', 'MINING', null, ac_find(mining_ac_nickname), null, null));   // put transaction for reward of mining.
  }

  if ( g_pendingTransactions.length > 0 ) {
    console.log("Start mining " );

    hiroseCoin.minePendingTransactions(ac_find(mining_ac_nickname));    // start mining for transactions
    cnt = 0;

  } else {
//      console.log("No mining " );
      cnt += 1;
      console.log("No mining " + cnt + " times.");
  }
  if (s_monitor == 1) {
     clearInterval(timer1);   // stop timer
  }
}

timer1 = setInterval(mining_main, 10000);   // timer : call callback every 20 seconds.





// hiroseCoin.createTransaction(new Transaction(ac_find('kama10001'), ac_find('kama10002'), 100));
// console.log("balances of accounts are :")
// console.log("kama10001 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10001')));
// console.log("kama10002 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10002')));


// console.log('\n Starting the miner...');
// hiroseCoin.minePendingTransactions(ac_find('kama10001'));

/*
redisClient.get('count', function (err, reply) {
  if (err) {
      throw err;
    }
  var count1 = reply;
  if (count1 === null) {
      count1 = 0;
  });
*/

/*
hiroseCoin.createTransaction(new Transaction(ac_find('kama10001'), ac_find('kama10002'), 25));
hiroseCoin.createTransaction(new Transaction(ac_find('kama10001'), ac_find('kama10002'), 30));
hiroseCoin.createTransaction(new Transaction(ac_find('kama10002'), ac_find('kama10001'), 10));
console.log("balances of accounts are :")
console.log("kama10001 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10001')));
console.log("kama10002 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10002')));
console.log("kama10004 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10004')));
console.log('\n Starting the miner...');
hiroseCoin.minePendingTransactions(ac_find('kama10001'));
console.log("balances of accounts are :")
console.log("kama10001 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10001')));
console.log("kama10002 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10002')));
console.log("kama10004 is " + hiroseCoin.getBalanceOfAddress(ac_find('kama10004')));
*/
