function settingsView_show(e) {
    var serverRoot = getServerRoot();
    $("#serverRootText").val(serverRoot);
}

function saveButton_click(e) {
    var serverRoot = $("#serverRootText").val();
    if ("" == serverRoot) {
        alert("请输入服务地址。");
        return;
    }
    
    localStorage.setItem("ServerRoot", serverRoot);
    app.navigate("views/login.html");
}

function logoutButton_click(e) {
    localStorage.removeItem("Token");
    app.navigate("views/login.html");
}

function getServerRoot() {
    var serverRoot = localStorage.getItem("ServerRoot");
    if (null == serverRoot) {
        //serverRoot = "http://192.168.1.39/EzDAQMobile/";
        //serverRoot = "http://112.64.144.202:7778/";
        serverRoot = "http://210.5.145.198:81/";
    }
    
    return serverRoot;
}