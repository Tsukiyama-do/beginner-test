

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


class maintenance {
    constructor(){
    }
    watch_mining_s(status = 0){

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
                status = 1 ;
                console.log('Mining_s is found');
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
module.exports = maintenance;
