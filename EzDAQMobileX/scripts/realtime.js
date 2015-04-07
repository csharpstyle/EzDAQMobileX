var realtime_timeout;
var realtime_filter = "";
var realtime_filterUrl = "";
var realtime_filterDataSource;
var realtime_DataSource;

function realtimeView_init() {
    realtime_DataSource = new kendo.data.DataSource({
                                                   transport: {
            read: function(options) {
                // make JSONP request to http://demos.telerik.com/kendo-ui/service/products
                $.ajax({
                           type: "GET",
                           url: getServerRoot() + "api/Realtime" + realtime_filterUrl,
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
    
    $("#realtimeListView").kendoMobileListView({
                                                   dataSource: realtime_DataSource,
                                                   pullToRefresh: true,            
                                                   template: $("#realtimeListViewTemplate").text(),
                                                   pullTemplate: "下拉可以更新...",
                                                   releaseTemplate: "松开立即更新...",
                                                   refreshTemplate: "更新中..."
                                               });
    
    realtime_filterDataSource = new kendo.data.DataSource({
                                                   transport: {
            read: function(options) {
                // make JSONP request to http://demos.telerik.com/kendo-ui/service/products
                $.ajax({
                           type: "GET",
                           url: getServerRoot() + "api/Realtime?filter=" + realtime_filter,
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
    
    $("#fliterListView").kendoMobileListView({
                                                 dataSource: realtime_filterDataSource,
                                                 pullToRefresh: true,            
                                                 template: $("#fliterListViewTemplate").text(),
                                                 pullTemplate: "下拉可以更新...",
                                                 releaseTemplate: "松开立即更新...",
                                                 refreshTemplate: "更新中...",
                                                 click: function(e) {
                                                     filterModalView1_close();
                                                     realtime_filterUrl = "?filter=" + e.dataItem.Type + "&id=" + e.dataItem.Id;
                                                     alarmListView_refresh();
                                                 }
                                             });    
    
    realtime_timeout = setTimeout('realtimeView_init()', 60000);
}

function alarmListView_refresh() {
    //$("#realtimeListView").data("kendoMobileListView").refresh();
    realtime_DataSource.read();
    realtime_timeout = setTimeout('alarmListView_refresh()', 3000);
}

function realtimeView_show() {
}

function getMeasurementTypeCss(measurementTypeName) {
    var css = "";
    switch (measurementTypeName) {
        case "精密空调":
            css = "0";
            break;
        case "消防":
            css = "1";
            break;
        case "供配电":
            css = "2";
            break;
        case "能耗":
            css = "3";
            break;
        case "气象":
            css = "4";
            break;
        case "UPS":
            css = "5";
            break;
        case "温度":
            css = "6";
            break;
        case "IT系统":
            css = "7";
            break;
        case "温湿度":
            css = "8";
            break;
        case "漏水":
            css = "9";
            break;
    }
    
    return css;
}

function realtime_searchSelect(e) {
    switch (e.index) {
        case 0:
            realtime_filterUrl = "";
            alarmListView_refresh();
            return;
        case 1:
            realtime_filter = "Area";
            title = "区域";
            break;
        case 2:
            realtime_filter = "MeasurementType";
            title = "子系统";
            break;
        case 3:
            realtime_filter = "DataType";
            title = "数据类型";
            break;
        case 4:
            realtime_filter = "AlarmType";
            title = "报警类型";
            break;
    }
    
    $("#filterModalView1").data("kendoMobileModalView").open();
    $("#filterModalView1_title").text(title);
    realtime_filterDataSource.read();
}

function filterModalView1_close() {
    $("#filterModalView1").kendoMobileModalView("close");
}

function fliterListView_Click(e) {
    filterModalView1_close();
    realtime_filterUrl = "?filter=" + e.dataItem.Type + "&id=" + e.dataItem.Id;
    alarmListView_refresh();
}