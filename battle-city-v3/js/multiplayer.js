var multiplayer = {
    // Open multiplayer game lobby
    websocket_url:"ws://localhost:8080/",
    websocket:undefined,
    start:function(){
        var WebSocketObject = window.WebSocket || window.MozWebSocket;
        if (!WebSocketObject){
            console.log("Your browser does not support WebSocket. Multiplayer will not work.");
            return;
        }
        this.websocket = new WebSocketObject(this.websocket_url);

        this.websocket.onopen = function(){
            console.log('open');
        }

        this.websocket.onclose = function(){
            console.log('close');
        }

        this.websocket.onerror = function(){
            console.log('error');
        }
    }
}