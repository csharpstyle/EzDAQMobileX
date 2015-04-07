var token;

function loginView_beforeShow(e) {
    token = localStorage.getItem("Token");
    if (token != null) {
        e.preventDefault();
        app.navigate("views/realtime.html");
    }
}

function loginButton_click(e) {
    var userName = $("#userNameText").val();
    var password = $("#password").val();

    if ("" == userName || "" == password) {
        alert("请输入用户名和密码。");
        return;
    }
    
    var jqxhr = $.ajax({
                           type: "POST",
                           url: getServerRoot() + "Token",
                           contentType: "application/x-www-form-urlencoded",
                           data: "grant_type=password&username=" + userName + "&password=" + password
                       })
        .done(function(data) {
            $("#password").val('');
            token = data.access_token;
            localStorage.setItem("Token", token);
            app.navigate("views/realtime.html");
        })
        .error(function(error){
            alert(error.status + " " + error.statusText);
        })
        .fail(function(j, textStatus, errorThrown) {
            console.log(j);
            console.log(textStatus);
            console.log(errorThrown);
        })
        .always(function() {
            
        });
}

function closeModalViewLoginSettings() {
    $("#modalview-login-settings").kendoMobileModalView("close");
}

function modalview_login_settings_open(){
    var serverRoot = getServerRoot();
    $("#login_serverRootText").val(serverRoot);
}

function modalview_login_settingsButton_click(){
    var serverRoot = $("#login_serverRootText").val();
    if ("" == serverRoot) {
        alert("请输入服务地址。");
        return;
    }
    
    localStorage.setItem("ServerRoot", serverRoot);
    $("#modalview-login-settings").kendoMobileModalView("close");
}