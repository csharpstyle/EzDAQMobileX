var alarm_timeout;

function alarmView_init1() {
    var jqxhr = $.ajax({
                           type: "GET",
                           url: "http://192.168.1.39/EzDAQMobile/api/Alarm",
                           headers: {"Authorization": "bearer " + token}
                       })
        .done(function(data) {
            alert(JSON.stringify(data));
            $("#alarmListView").kendoMobileListView({
                                                        dataSource: kendo.data.DataSource.create({data: data}),
                                                        pullToRefresh: true,
                                                        template: $("#alarmListViewTemplate").html(),
                                                        headerTemplate: "<h2>Letter ${ChannelNo}</h2>"
                                                    });
        })
        .fail(function(j, textStatus, errorThrown) {
            alert(j);
            alert(textStatus);
            alert(errorThrown);
        })
        .always(function() {
        });
}

function alarmView_init(e) {
    var dataSource = new kendo.data.DataSource({
                                                   transport: {
            read: function(options) {
                // make JSONP request to http://demos.telerik.com/kendo-ui/service/products
                $.ajax({
                           type: "GET",
                           url: getServerRoot() + "api/Alarm",
                           headers: {"Authorization": "bearer " + token},
                           success: function(result) {
                               options.success(result);
                           },
                           fail: function(result) {
                               // notify the data source that the request failed
                               //alert(result);
                               options.error(result);
                           }
                       });
            }

        }
                                               });
    
    $("#alarmListView").kendoMobileListView({
                                                dataSource: dataSource,
                                                pullToRefresh: true,            
                                                template: $("#alarmListViewTemplate").text(),
                                                pullTemplate: "下拉可以更新...",
                                                releaseTemplate: "松开立即更新...",
                                                refreshTemplate: "更新中..."
                                            });
    
    alarm_timeout = setTimeout('alarmView_init()', 60000);
}