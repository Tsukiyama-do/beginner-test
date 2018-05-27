    var socket = io.connect(); // C02. ソケットへの接続
    var isEnter = false;
    var name = '';

    // C04. server_to_clientイベント・データを受信する
    socket.on("server_to_client", function(data){appendMsg(data.value)});

    function appendMsg(text) {
        $("#chatLogs").append("<div>" + text + "</div>");
    }

        var message = $("#msgForm").val();
        if (isEnter) {
            message = "[" + name + "]: " + message;
            // C03. client_to_serverイベント・データを送信する
            socket.emit("client_to_server", {value : message});
        } else {
            name = message;
            var entryMessage = name + "さんが入室しました。";
            // C05. client_to_server_broadcastイベント・データを送信する
            socket.emit("client_to_server_broadcast", {value : entryMessage});
            changeLabel();
        }
        e.preventDefault();
    });

    function changeLabel() {
        $("label").text("メッセージ：");
        $("button").text("送信あるいはリターンキー");
        isEnter = true;
    }
