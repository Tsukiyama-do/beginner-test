var fs = require('fs');
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

class sendTrans {
  constructor() {
    this.count = 0;
    this.sendtrans = [];
  }
  sendTTrans(queue = 'webtochain', msg) {
    redisClient.rpush(queue, msg, function(err, data) {
      if (err) throw err;
//      console.log("msg is sent.");
    });
  }
}

function ac_find(nickname) {
    return fs.readFileSync( __dirname + '/master/' + nickname + '.hash' , 'utf-8');
}

module.exports = sendTrans;


class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}


var msg_send = [];
// var sb1 = Buffer.alloc(150,JSON.stringify(new Transaction(ac_find('kama10001'), ac_find('kama10002'), 3000)),'utf8' );
var sb1 = JSON.stringify(new Transaction(ac_find('kama10001'), ac_find('kama10002'), 3000));
msg_send.push(sb1);
var sb2 = JSON.stringify(new Transaction(ac_find('kama10002'), ac_find('kama10004'), 400));
msg_send.push(sb2);
// var sb3 = JSON.stringify(new Transaction(ac_find('kama10001'), ac_find('kama10004'), 100));
// msg_send.push(sb3);

var send_data = new sendTrans();

msg_send.forEach(function(element){
  send_data.sendTTrans('webtochain',element);
  console.log("msg is " + element);
});
console.log('Message transfers are completed!');
