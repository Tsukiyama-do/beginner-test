
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

class recTrans {
  constructor() {
    this.count = 0;
    this.rectrans = [];

  }
  checktrans(queue = 'webtochain') {
//    redisClient.get('web_to_chain_1', function (err, reply) {

    redisClient.lrange(queue, 0, -1, function(err, items) {
      if (err) throw err;
      console.log("lenght is " + items.length);
      var cnt = items.length;
//      items.forEach(function (reply, index) {
//        console.log("Reply " + index + ": " + JSON.stringify(reply));
//      });
      for (var i = 0; i < cnt; i++ ) {
        redisClient.lpop(queue, function(err, items){
          if (err) throw err;
        });
      }
      return items;

    });
  }
}

module.exports = recTrans;

var rec_data = new recTrans();
rec_data.checktrans();
console.log("test is " + JSON.stringify(rec_data.rectrans));
