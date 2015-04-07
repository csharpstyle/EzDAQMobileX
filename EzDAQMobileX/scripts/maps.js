var maps = new function() {
    var self = this;
    
    this.init = function() {
        var dataSource = new kendo.data.DataSource({
                                                       transport: {
                read: function(options) {
                    // make JSONP request to http://demos.telerik.com/kendo-ui/service/products
                    $.ajax({
                               type: "GET",
                               url: getServerRoot() + "api/Area",
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
    
        $("#mapsListView").kendoMobileListView({
                                                       dataSource: dataSource,
                                                       pullToRefresh: true,            
                                                       template: $("#mapsListViewTemplate").text(),
                                                       pullTemplate: "下拉可以更新...",
                                                       releaseTemplate: "松开立即更新...",
                                                       refreshTemplate: "更新中..."
                                                   });
    }
};