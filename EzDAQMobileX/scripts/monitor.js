var map;
var markers;
var timeout;
var mapId;

function monitorView_init(e) {
    $(window).resize(function () {
        $("#map").height(window.innerHeight);
        $("#map").width(window.innerWidth);
    });
    
    var areaDataSource = new kendo.data.DataSource({
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
    
    $("#areaListView").kendoMobileListView({
                                               dataSource: areaDataSource,
                                               pullToRefresh: true,            
                                               template: $("#areaListViewTemplate").text(),
                                               pullTemplate: "下拉可以更新...",
                                               releaseTemplate: "松开立即更新...",
                                               refreshTemplate: "更新中..."
                                           });
    
    $("#map").height(window.innerHeight);
    $("#map").width(window.innerWidth);
    
    /***  little hack starts here ***/
    L.Map = L.Map.extend({
                             openPopup: function(popup) {
                                 //        this.closePopup();  // just comment this
                                 this._popup = popup;

                                 return this.addLayer(popup).fire('popupopen', {
                                                                      popup: this._popup
                                                                  });
                             }
                         }); 
    
    L.Popup = L.Popup.extend({
                                 update: function () {
                                     if (!this._map) {
                                         return;
                                     }

                                     this._container.style.visibility = 'hidden';

                                     this._updateContent();
                                     this._updateLayout();
                                     this._updatePosition();

                                     this._container.style.visibility = '';
                                     //this._adjustPan();
                                 }
                             });
    /***  end of hack ***/
    
    /*
    map = L.map('map', {
    maxZoom: 12,
    minZoom: 2,
    crs: L.CRS.Simple,
    bounceAtZoomLimits : false,
    attributionControl: false
    }).setView([0, 0], 12);
    */
    map = L.map('map', {
                    crs: L.CRS.Simple,
                    bounceAtZoomLimits : false,
                    attributionControl: false
                }).setView([0, 0], 12);
}

function monitorView_show(e) {
    mapId = e.view.params.mapId;
    if (null == mapId)
        return;
    
    clearTimeout(timeout);
    
    var mapUrl = getServerRoot() + "_files/ZoomImages/" + e.view.params.mapUrl + "/dzimages/Source_files/{z}/{x}_{y}.jpg";
    var mapWidth = e.view.params.mapWidth;
    var mapHeight = e.view.params.mapHeight;
    var maxLevel = e.view.params.maxLevel;
    
    var minLevel = maxLevel;
    for (i = maxLevel; i > 0; i--) {
        if (mapWidth / Math.pow(2, maxLevel - minLevel + 1) <= 256)
            break;
        minLevel = minLevel - 1;
    }
    
    var autoLevel = maxLevel;
    var mapZoomWidth = mapWidth;
    for (i = 0; i < maxLevel; i++) {
        if (mapZoomWidth < window.innerWidth) {
            if (autoLevel < maxLevel) {
                autoLevel = autoLevel + 1;
            }
            break;
        }
        autoLevel = autoLevel - 1;
        mapZoomWidth = mapZoomWidth / 2;
    }
    
    console.log(maxLevel, minLevel, autoLevel);
    
    map.options.maxZoom = maxLevel;
    map.options.minZoom = minLevel;
    map.setView([0, 0], autoLevel);
    
    var southWest = map.unproject([0, mapHeight], map.getMaxZoom());
    var northEast = map.unproject([mapWidth, 0], map.getMaxZoom());
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));
    
    if (null != markers)
        map.removeLayer(markers);
    L.tileLayer(mapUrl, {attribution: ''}).addTo(map);

    var jqxhr = $.ajax({
                           type: "GET",
                           url: getServerRoot() + "api/Pin?mapId=" + mapId,
                           headers: {"Authorization": "bearer " + token}
                       })
        .done(function(data) {
            markers = new L.FeatureGroup();         
            var viewportHeight = mapHeight / mapWidth;
            
            $.each(data, function(key, value) {
                var position = {
                    x: value.X * mapWidth,
                    y: value.Y / viewportHeight * mapHeight
                }
                //var marker = L.marker(map.unproject([position.x, position.y], map.getMaxZoom())).addTo(map).bindPopup(value.Name).openPopup();
                var marker = L.marker(map.unproject([position.x, position.y], map.getMaxZoom()));
                
                var pinIcon = L.icon({
                                         iconUrl: "images/pin_alarm0.png",
                                         iconSize: [25, 37],
                    popupAnchor: [0, -18]
                                     });
                marker.setIcon(pinIcon);
                
                marker.addTo(markers).bindPopup(value.Name).openPopup();
                //var marker = L.marker(map.unproject([position.x, position.y], map.getMaxZoom())).addTo(markers);
                //marker.bindLabel(value.Name, { noHide: true })
                marker.pinId = value.Id;
                marker.pinName = value.Name;
                
                map.addLayer(markers);
            });
            
            timeout = setTimeout('refreshPinData()', 3000);
        })
        .fail(function(j, textStatus, errorThrown) {
            alert(j);
            alert(textStatus);
            alert(errorThrown);
        })
        .always(function() {
        });
}

function refreshPinData() {
    var jqxhr = $.ajax({
                           type: "GET",
                           url: getServerRoot() + "api/PinData?mapId=" + mapId,
                           headers: {"Authorization": "bearer " + token}
                       })
        .done(function(data) {
            console.log(data);
            $.each(data, function(key, value) {
                markers.eachLayer(function(marker) {
                    if (value.PinId == marker.pinId) {
                        var iconUrl = "images/pin_alarm" + value.AlarmType + ".png";
                        var pinIcon = L.icon({
                                                 iconUrl: iconUrl,
                                                 iconSize: [25, 37],
                            popupAnchor: [0, -18]
                                             });
                        marker.setIcon(pinIcon);
                        marker.setPopupContent(marker.pinName + ": " + value.Description);
                    }
                });
            });
            
            timeout = setTimeout('refreshPinData()', 3000);
        })
        .fail(function(j, textStatus, errorThrown) {
            alert(j);
            alert(textStatus);
            alert(errorThrown);
        })
        .always(function() {
        });
}