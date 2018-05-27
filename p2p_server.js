var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
// S02. HTTPサーバを生成する
var server = http.createServer(function(req, res) {
//    res.writeHead(200, {'Content-Type' : 'text/html'});
//    res.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).listen(3030);  // ポート競合の場合は値を変更

// S03. HTTPサーバにソケットをひも付ける（WebSocket有効化）
var io = socketio.listen(server);

// S04. connectionイベント・データを受信する
io.sockets.on('connection', function(socket) {
    // S05. client_to_serverイベント・データを受信する
    socket.on('client_to_server', function(data) {
        // S06. server_to_clientイベント・データを送信する
        io.sockets.emit('server_to_client', {value : data.value});
    });
    // S07. client_to_server_broadcastイベント・データを受信し、送信元以外に送信する
    socket.on('client_to_server_broadcast', function(data) {
        socket.broadcast.emit('server_to_client', {value : data.value});
    });
});
