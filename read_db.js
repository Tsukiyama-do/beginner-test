var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

module.exports = walk;

function ac_find(nickname) {
    return fs.readFileSync( __dirname + '/master/' + nickname + '.hash' , 'utf-8');
}

var ac_nickname = 'kama10002';

walk(__dirname + '/db/', function(err, results){
  if (err) throw err;
//  console.log(JSON.stringify(results));
  var i_total = 0;
  results.forEach(function(element){
    var block_json = fs.readFileSync(element);
    var block_tmp = JSON.parse(block_json);
      block_tmp.transactions.forEach(function(tras){
        if (tras.fromAddress == ac_find(ac_nickname)) {
          i_total -= tras.amount
        }
        if (tras.toAddress == ac_find(ac_nickname)) {
          i_total += tras.amount
        }

//        console.log("fromAddress : " + tras.fromAddress);
//        console.log("toAddress : " + tras.toAddress);
//        console.log("amount : " + tras.amount);
//        console.log("End of Tran" );

      })
  });
  console.log("balance of kama10001 :" + i_total);
});
