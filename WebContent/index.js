L.Control.EasyPrint = L.Control.extend({
  options: {
    title: 'Print map',
    position: 'topleft',
    sizeModes: ['Current'],
    filename: 'map',
    exportOnly: false,
    hidden: false,
    tileWait: 500,
    hideControlContainer: true,
    hideClasses: [],
    customWindowTitle: window.document.title,
    spinnerBgCOlor: '#0DC5C1',
    customSpinnerClass: 'epLoader',
    defaultSizeTitles: {
      Current: 'Current Size',
      A4Landscape: 'A4 Landscape',
      A4Portrait: 'A4 Portrait'
    }
  },

  onAdd: function () { 
    this.mapContainer = this._map.getContainer();
    this.options.sizeModes = this.options.sizeModes.map(function (sizeMode) {
      if (sizeMode === 'Current') {
        return {
          name: this.options.defaultSizeTitles.Current,
          className: 'CurrentSize'
        }
      }
      if (sizeMode === 'A4Landscape') {
        return {
          height: this._a4PageSize.height,
          width: this._a4PageSize.width,
          name: this.options.defaultSizeTitles.A4Landscape,
          className: 'A4Landscape page'
        }
      }
      if (sizeMode === 'A4Portrait') {
        return {
          height: this._a4PageSize.width,
          width: this._a4PageSize.height,
          name: this.options.defaultSizeTitles.A4Portrait,
          className: 'A4Portrait page'
        }
      };
      return sizeMode;
    }, this);
    
    var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');
    if (!this.options.hidden) {
      this._addCss();

      L.DomEvent.addListener(container, 'mouseover', this._togglePageSizeButtons, this);
      L.DomEvent.addListener(container, 'mouseout', this._togglePageSizeButtons, this);

      var btnClass = 'leaflet-control-easyPrint-button'
      if (this.options.exportOnly) btnClass = btnClass + '-export'

      this.link = L.DomUtil.create('a', btnClass, container);
      this.link.id = "leafletEasyPrint";
      this.link.title = this.options.title;
      this.holder = L.DomUtil.create('ul', 'easyPrintHolder', container);

      this.options.sizeModes.forEach(function (sizeMode) {
        var btn = L.DomUtil.create('li', 'easyPrintSizeMode', this.holder);
        btn.title = sizeMode.name;
        var link = L.DomUtil.create('a', sizeMode.className, btn);
        L.DomEvent.addListener(btn, 'click', this.printMap, this);
      }, this);

      L.DomEvent.disableClickPropagation(container);
    }
    return container;
  },

  printMap: function (event, filename) {
    if (filename) {
      this.options.filename = filename
    }
    if (!this.options.exportOnly) {
      this._page = window.open("", "_blank", 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10, top=10, width=200, height=250, visible=none');
      this._page.document.write(this._createSpinner(this.options.customWindowTitle, this.options.customSpinnerClass, this.options.spinnerBgCOlor));
    }
    this.originalState = {
      mapWidth: this.mapContainer.style.width,
      widthWasAuto: false,
      widthWasPercentage: false,
      mapHeight: this.mapContainer.style.height,
      zoom: this._map.getZoom(),
      center: this._map.getCenter()
    };
    if (this.originalState.mapWidth === 'auto') {
      this.originalState.mapWidth = this._map.getSize().x  + 'px'
      this.originalState.widthWasAuto = true
    } else if (this.originalState.mapWidth.includes('%')) {
      this.originalState.percentageWidth = this.originalState.mapWidth
      this.originalState.widthWasPercentage = true
      this.originalState.mapWidth = this._map.getSize().x  + 'px'
    }
    this._map.fire("easyPrint-start", { event: event });
    if (!this.options.hidden) {
      this._togglePageSizeButtons({type: null});
    }
    if (this.options.hideControlContainer) {
      this._toggleControls();    
    }
    if (this.options.hideClasses) {
      this._toggleClasses(this.options.hideClasses);
    }
    var sizeMode = typeof event !== 'string' ? event.target.className : event;
    if (sizeMode === 'CurrentSize') {
      return this._printOpertion(sizeMode);
    }
    this.outerContainer = this._createOuterContainer(this.mapContainer)
    if (this.originalState.widthWasAuto) {
      this.outerContainer.style.width = this.originalState.mapWidth
    }
    this._createImagePlaceholder(sizeMode)
  },

  _createImagePlaceholder: function (sizeMode) {
    var plugin = this;
    domtoimage.toPng(this.mapContainer, {
        width: parseInt(this.originalState.mapWidth.replace('px')),
        height: parseInt(this.originalState.mapHeight.replace('px'))
      })
      .then(function (dataUrl) {
        plugin.blankDiv = document.createElement("div");
        var blankDiv = plugin.blankDiv;
        plugin.outerContainer.parentElement.insertBefore(blankDiv, plugin.outerContainer);
        blankDiv.className = 'epHolder';
        blankDiv.style.backgroundImage = 'url("' + dataUrl + '")';
        blankDiv.style.position = 'absolute';
        blankDiv.style.zIndex = 1011;
        blankDiv.style.display = 'initial';
        blankDiv.style.width = plugin.originalState.mapWidth;
        blankDiv.style.height = plugin.originalState.mapHeight;
        plugin._resizeAndPrintMap(sizeMode);
      })
      .catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
  },

  _resizeAndPrintMap: function (sizeMode) {
    this.outerContainer.style.opacity = 0;
    var pageSize = this.options.sizeModes.filter(function (item) {
      return item.className.indexOf(sizeMode) > -1;
    });
    pageSize = pageSize[0]
    this.mapContainer.style.width = pageSize.width + 'px';
    this.mapContainer.style.height = pageSize.height + 'px';
    if (this.mapContainer.style.width > this.mapContainer.style.height) {
      this.orientation = 'portrait';
    } else {
      this.orientation = 'landscape';
    }
    this._map.setView(this.originalState.center);
    this._map.setZoom(this.originalState.zoom);
    this._map.invalidateSize();
    if (this.options.tileLayer) {
      this._pausePrint(sizeMode)
    } else {
      this._printOpertion(sizeMode)
    }
  },

  _pausePrint: function (sizeMode) {
    var plugin = this
    var loadingTest = setInterval(function () { 
      if(!plugin.options.tileLayer.isLoading()) {
        clearInterval(loadingTest);
        plugin._printOpertion(sizeMode)
      }
    }, plugin.options.tileWait);
  },

  _printOpertion: function (sizemode) {
    var plugin = this;
    var widthForExport = this.mapContainer.style.width
    if (this.originalState.widthWasAuto && sizemode === 'CurrentSize' || this.originalState.widthWasPercentage && sizemode === 'CurrentSize') {
      widthForExport = this.originalState.mapWidth
    }
    domtoimage.toPng(plugin.mapContainer, {
        width: parseInt(widthForExport),
        height: parseInt(plugin.mapContainer.style.height.replace('px'))
      })
      .then(function (dataUrl) {
          var blob = plugin._dataURItoBlob(dataUrl);
          if (plugin.options.exportOnly) {
            fileSaver.saveAs(blob, plugin.options.filename + '.png');
          } else {
            plugin._sendToBrowserPrint(dataUrl, plugin.orientation);
          }
          plugin._toggleControls(true);
          plugin._toggleClasses(plugin.options.hideClasses, true);

          if (plugin.outerContainer) {
            if (plugin.originalState.widthWasAuto) {
              plugin.mapContainer.style.width = 'auto'
            } else if (plugin.originalState.widthWasPercentage) {
              plugin.mapContainer.style.width = plugin.originalState.percentageWidth
            }
            else {
              plugin.mapContainer.style.width = plugin.originalState.mapWidth;              
            }
            plugin.mapContainer.style.height = plugin.originalState.mapHeight;
            plugin._removeOuterContainer(plugin.mapContainer, plugin.outerContainer, plugin.blankDiv)
            plugin._map.invalidateSize();
            plugin._map.setView(plugin.originalState.center);
            plugin._map.setZoom(plugin.originalState.zoom);
          }
          plugin._map.fire("easyPrint-finished");
      })
      .catch(function (error) {
          console.error('Print operation failed', error);
      }); 
  },

  _sendToBrowserPrint: function (img, orientation) {
    this._page.resizeTo(600, 800); 
    var pageContent = this._createNewWindow(img, orientation, this)
    this._page.document.body.innerHTML = ''
    this._page.document.write(pageContent);
    this._page.document.close();  
  },

  _createSpinner: function (title, spinnerClass, spinnerColor) {
    return `<html><head><title>`+ title + `</title></head><body><style>
      body{
        background: ` + spinnerColor + `;
      }
      .epLoader,
      .epLoader:before,
      .epLoader:after {
        border-radius: 50%;
      }
      .epLoader {
        color: #ffffff;
        font-size: 11px;
        text-indent: -99999em;
        margin: 55px auto;
        position: relative;
        width: 10em;
        height: 10em;
        box-shadow: inset 0 0 0 1em;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
      }
      .epLoader:before,
      .epLoader:after {
        position: absolute;
        content: '';
      }
      .epLoader:before {
        width: 5.2em;
        height: 10.2em;
        background: #0dc5c1;
        border-radius: 10.2em 0 0 10.2em;
        top: -0.1em;
        left: -0.1em;
        -webkit-transform-origin: 5.2em 5.1em;
        transform-origin: 5.2em 5.1em;
        -webkit-animation: load2 2s infinite ease 1.5s;
        animation: load2 2s infinite ease 1.5s;
      }
      .epLoader:after {
        width: 5.2em;
        height: 10.2em;
        background: #0dc5c1;
        border-radius: 0 10.2em 10.2em 0;
        top: -0.1em;
        left: 5.1em;
        -webkit-transform-origin: 0px 5.1em;
        transform-origin: 0px 5.1em;
        -webkit-animation: load2 2s infinite ease;
        animation: load2 2s infinite ease;
      }
      @-webkit-keyframes load2 {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes load2 {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      </style>
    <div class="`+spinnerClass+`">Loading...</div></body></html>`;
  },

  _createNewWindow: function (img, orientation, plugin) {
    return `<html><head>
        <style>@media print {
          img { max-width: 98%!important; max-height: 98%!important; }
          @page { size: ` + orientation + `;}}
        </style>
        <script>function step1(){
        setTimeout('step2()', 10);}
        function step2(){window.print();window.close()}
        </script></head><body onload='step1()'>
        <img src="` + img + `" style="display:block; margin:auto;"></body></html>`;
  },

  _createOuterContainer: function (mapDiv) {
    var outerContainer = document.createElement('div'); 
    mapDiv.parentNode.insertBefore(outerContainer, mapDiv); 
    mapDiv.parentNode.removeChild(mapDiv);
    outerContainer.appendChild(mapDiv);
    outerContainer.style.width = mapDiv.style.width;
    outerContainer.style.height = mapDiv.style.height;
    outerContainer.style.display = 'inline-block'
    outerContainer.style.overflow = 'hidden';
    return outerContainer;
  },

  _removeOuterContainer: function (mapDiv, outerContainer, blankDiv) {
    if (outerContainer.parentNode) {
      outerContainer.parentNode.insertBefore(mapDiv, outerContainer);
      outerContainer.parentNode.removeChild(blankDiv);
      outerContainer.parentNode.removeChild(outerContainer);      
    }
  },

  _addCss: function () {
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `.leaflet-control-easyPrint-button { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTI4LDMyaDI1NnY2NEgxMjhWMzJ6IE00ODAsMTI4SDMyYy0xNy42LDAtMzIsMTQuNC0zMiwzMnYxNjBjMCwxNy42LDE0LjM5OCwzMiwzMiwzMmg5NnYxMjhoMjU2VjM1Mmg5NiAgIGMxNy42LDAsMzItMTQuNCwzMi0zMlYxNjBDNTEyLDE0Mi40LDQ5Ny42LDEyOCw0ODAsMTI4eiBNMzUyLDQ0OEgxNjBWMjg4aDE5MlY0NDh6IE00ODcuMTk5LDE3NmMwLDEyLjgxMy0xMC4zODcsMjMuMi0yMy4xOTcsMjMuMiAgIGMtMTIuODEyLDAtMjMuMjAxLTEwLjM4Ny0yMy4yMDEtMjMuMnMxMC4zODktMjMuMiwyMy4xOTktMjMuMkM0NzYuODE0LDE1Mi44LDQ4Ny4xOTksMTYzLjE4Nyw0ODcuMTk5LDE3NnoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: 16px 16px; 
      cursor: pointer; 
    }
    .leaflet-control-easyPrint-button-export { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzMy41IDQzMy41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MzMuNSA0MzMuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJmaWxlLWRvd25sb2FkIj4KCQk8cGF0aCBkPSJNMzk1LjI1LDE1M2gtMTAyVjBoLTE1M3YxNTNoLTEwMmwxNzguNSwxNzguNUwzOTUuMjUsMTUzeiBNMzguMjUsMzgyLjV2NTFoMzU3di01MUgzOC4yNXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: 16px 16px; 
      cursor: pointer; 
    }
    .easyPrintHolder a {
      background-size: 16px 16px;
      cursor: pointer;
    }
    .easyPrintHolder .CurrentSize{
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTZweCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiPgogIDxnPgogICAgPGcgZmlsbD0iIzFEMUQxQiI+CiAgICAgIDxwYXRoIGQ9Ik0yNS4yNTUsMzUuOTA1TDQuMDE2LDU3LjE0NVY0Ni41OWMwLTEuMTA4LTAuODk3LTIuMDA4LTIuMDA4LTIuMDA4QzAuODk4LDQ0LjU4MiwwLDQ1LjQ4MSwwLDQ2LjU5djE1LjQwMiAgICBjMCwwLjI2MSwwLjA1MywwLjUyMSwwLjE1NSwwLjc2N2MwLjIwMywwLjQ5MiwwLjU5NCwwLjg4MiwxLjA4NiwxLjA4N0MxLjQ4Niw2My45NDcsMS43NDcsNjQsMi4wMDgsNjRoMTUuNDAzICAgIGMxLjEwOSwwLDIuMDA4LTAuODk4LDIuMDA4LTIuMDA4cy0wLjg5OC0yLjAwOC0yLjAwOC0yLjAwOEg2Ljg1NWwyMS4yMzgtMjEuMjRjMC43ODQtMC43ODQsMC43ODQtMi4wNTUsMC0yLjgzOSAgICBTMjYuMDM5LDM1LjEyMSwyNS4yNTUsMzUuOTA1eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgICA8cGF0aCBkPSJtNjMuODQ1LDEuMjQxYy0wLjIwMy0wLjQ5MS0wLjU5NC0wLjg4Mi0xLjA4Ni0xLjA4Ny0wLjI0NS0wLjEwMS0wLjUwNi0wLjE1NC0wLjc2Ny0wLjE1NGgtMTUuNDAzYy0xLjEwOSwwLTIuMDA4LDAuODk4LTIuMDA4LDIuMDA4czAuODk4LDIuMDA4IDIuMDA4LDIuMDA4aDEwLjU1NmwtMjEuMjM4LDIxLjI0Yy0wLjc4NCwwLjc4NC0wLjc4NCwyLjA1NSAwLDIuODM5IDAuMzkyLDAuMzkyIDAuOTA2LDAuNTg5IDEuNDIsMC41ODlzMS4wMjctMC4xOTcgMS40MTktMC41ODlsMjEuMjM4LTIxLjI0djEwLjU1NWMwLDEuMTA4IDAuODk3LDIuMDA4IDIuMDA4LDIuMDA4IDEuMTA5LDAgMi4wMDgtMC44OTkgMi4wMDgtMi4wMDh2LTE1LjQwMmMwLTAuMjYxLTAuMDUzLTAuNTIyLTAuMTU1LTAuNzY3eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==)
    }
    .easyPrintHolder .page {
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ0NC44MzMgNDQ0LjgzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQ0LjgzMyA0NDQuODMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTUuMjUsNDQ0LjgzM2gzMzQuMzMzYzkuMzUsMCwxNy03LjY1LDE3LTE3VjEzOS4xMTdjMC00LjgxNy0xLjk4My05LjM1LTUuMzgzLTEyLjQ2N0wyNjkuNzMzLDQuNTMzICAgIEMyNjYuNjE3LDEuNywyNjIuMzY3LDAsMjU4LjExNywwSDU1LjI1Yy05LjM1LDAtMTcsNy42NS0xNywxN3Y0MTAuODMzQzM4LjI1LDQzNy4xODMsNDUuOSw0NDQuODMzLDU1LjI1LDQ0NC44MzN6ICAgICBNMzcyLjU4MywxNDYuNDgzdjAuODVIMjU2LjQxN3YtMTA4LjhMMzcyLjU4MywxNDYuNDgzeiBNNzIuMjUsMzRoMTUwLjE2N3YxMzAuMzMzYzAsOS4zNSw3LjY1LDE3LDE3LDE3aDEzMy4xNjd2MjI5LjVINzIuMjVWMzR6ICAgICIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=);
    }
    .easyPrintHolder .A4Landscape { 
      transform: rotate(-90deg);
    }

    .leaflet-control-easyPrint-button{
      display: inline-block;
    }
    .easyPrintHolder{
      margin-top:-31px;
      margin-bottom: -5px;
      margin-left: 30px;
      padding-left: 0px;
      display: none;
    }

    .easyPrintSizeMode {
      display: inline-block;
    }
    .easyPrintHolder .easyPrintSizeMode a {
      border-radius: 0px;
    }

    .easyPrintHolder .easyPrintSizeMode:last-child a{
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      margin-left: -1px;
    }

    .easyPrintPortrait:hover, .easyPrintLandscape:hover{
      background-color: #757570;
      cursor: pointer;
    }`;
    document.body.appendChild(css);
  },

  _dataURItoBlob: function (dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var dw = new DataView(ab);
    for(var i = 0; i < byteString.length; i++) {
        dw.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([ab], {type: mimeString});
  },

  _togglePageSizeButtons: function (e) {
    var holderStyle = this.holder.style
    var linkStyle = this.link.style
    if (e.type === 'mouseover') {
      holderStyle.display = 'block';
      linkStyle.borderTopRightRadius = '0'
      linkStyle.borderBottomRightRadius = '0'
    } else {
      holderStyle.display = 'none';
      linkStyle.borderTopRightRadius = '2px'
      linkStyle.borderBottomRightRadius = '2px'      
    }
  },

  _toggleControls: function (show) {
    var controlContainer = document.getElementsByClassName("leaflet-control-container")[0];
    if (show) return controlContainer.style.display = 'block';
    controlContainer.style.display = 'none';
  },
  _toggleClasses: function (classes, show) {
    classes.forEach(function (className) {
      var div = document.getElementsByClassName(className)[0];
      if (show) return div.style.display = 'block';
      div.style.display = 'none';
    });
  },

  _a4PageSize: {
    height: 715,
    width: 1045
  }

});

L.easyPrint = function(options) {
  return new L.Control.EasyPrint(options);
};

(function(){

	// This is for grouping buttons into a bar
	// takes an array of `L.easyButton`s and
	// then the usual `.addTo(map)`
	L.Control.EasyBar = L.Control.extend({

	  options: {
	    position:       'topleft',  // part of leaflet's defaults
	    id:             null,       // an id to tag the Bar with
	    leafletClasses: true        // use leaflet classes?
	  },


	  initialize: function(buttons, options){

	    if(options){
	      L.Util.setOptions( this, options );
	    }

	    this._buildContainer();
	    this._buttons = [];

	    for(var i = 0; i < buttons.length; i++){
	      buttons[i]._bar = this;
	      buttons[i]._container = buttons[i].button;
	      this._buttons.push(buttons[i]);
	      this.container.appendChild(buttons[i].button);
	    }

	  },


	  _buildContainer: function(){
	    this._container = this.container = L.DomUtil.create('div', '');
	    this.options.leafletClasses && L.DomUtil.addClass(this.container, 'leaflet-bar easy-button-container leaflet-control');
	    this.options.id && (this.container.id = this.options.id);
	  },


	  enable: function(){
	    L.DomUtil.addClass(this.container, 'enabled');
	    L.DomUtil.removeClass(this.container, 'disabled');
	    this.container.setAttribute('aria-hidden', 'false');
	    return this;
	  },


	  disable: function(){
	    L.DomUtil.addClass(this.container, 'disabled');
	    L.DomUtil.removeClass(this.container, 'enabled');
	    this.container.setAttribute('aria-hidden', 'true');
	    return this;
	  },


	  onAdd: function () {
	    return this.container;
	  },

	  addTo: function (map) {
	    this._map = map;

	    for(var i = 0; i < this._buttons.length; i++){
	      this._buttons[i]._map = map;
	    }

	    var container = this._container = this.onAdd(map),
	        pos = this.getPosition(),
	        corner = map._controlCorners[pos];

	    L.DomUtil.addClass(container, 'leaflet-control');

	    if (pos.indexOf('bottom') !== -1) {
	      corner.insertBefore(container, corner.firstChild);
	    } else {
	      corner.appendChild(container);
	    }

	    return this;
	  }

	});

	L.easyBar = function(){
	  var args = [L.Control.EasyBar];
	  for(var i = 0; i < arguments.length; i++){
	    args.push( arguments[i] );
	  }
	  return new (Function.prototype.bind.apply(L.Control.EasyBar, args));
	};

	// L.EasyButton is the actual buttons
	// can be called without being grouped into a bar
	L.Control.EasyButton = L.Control.extend({

	  options: {
	    position:  'topleft',       // part of leaflet's defaults

	    id:        null,            // an id to tag the button with

	    type:      'replace',       // [(replace|animate)]
	                                // replace swaps out elements
	                                // animate changes classes with all elements inserted

	    states:    [],              // state names look like this
	                                // {
	                                //   stateName: 'untracked',
	                                //   onClick: function(){ handle_nav_manually(); };
	                                //   title: 'click to make inactive',
	                                //   icon: 'fa-circle',    // wrapped with <a>
	                                // }

	    leafletClasses:   true,     // use leaflet styles for the button
	    tagName:          'button',
	  },



	  initialize: function(icon, onClick, title, id){

	    // clear the states manually
	    this.options.states = [];

	    // add id to options
	    if(id != null){
	      this.options.id = id;
	    }

	    // storage between state functions
	    this.storage = {};

	    // is the last item an object?
	    if( typeof arguments[arguments.length-1] === 'object' ){

	      // if so, it should be the options
	      L.Util.setOptions( this, arguments[arguments.length-1] );
	    }

	    // if there aren't any states in options
	    // use the early params
	    if( this.options.states.length === 0 &&
	        typeof icon  === 'string' &&
	        typeof onClick === 'function'){

	      // turn the options object into a state
	      this.options.states.push({
	        icon: icon,
	        onClick: onClick,
	        title: typeof title === 'string' ? title : ''
	      });
	    }

	    // curate and move user's states into
	    // the _states for internal use
	    this._states = [];

	    for(var i = 0; i < this.options.states.length; i++){
	      this._states.push( new State(this.options.states[i], this) );
	    }

	    this._buildButton();

	    this._activateState(this._states[0]);

	  },

	  _buildButton: function(){

	    this.button = L.DomUtil.create(this.options.tagName, '');

	    if (this.options.tagName === 'button') {
	        this.button.setAttribute('type', 'button');
	    }

	    if (this.options.id ){
	      this.button.id = this.options.id;
	    }

	    if (this.options.leafletClasses){
	      L.DomUtil.addClass(this.button, 'easy-button-button leaflet-bar-part leaflet-interactive');
	    }

	    // don't let double clicks and mousedown get to the map
	    L.DomEvent.addListener(this.button, 'dblclick', L.DomEvent.stop);
	    L.DomEvent.addListener(this.button, 'mousedown', L.DomEvent.stop);
	    L.DomEvent.addListener(this.button, 'mouseup', L.DomEvent.stop);

	    // take care of normal clicks
	    L.DomEvent.addListener(this.button,'click', function(e){
	      L.DomEvent.stop(e);
	      this._currentState.onClick(this, this._map ? this._map : null );
	      this._map && this._map.getContainer().focus();
	    }, this);

	    // prep the contents of the control
	    if(this.options.type == 'replace'){
	      this.button.appendChild(this._currentState.icon);
	    } else {
	      for(var i=0;i<this._states.length;i++){
	        this.button.appendChild(this._states[i].icon);
	      }
	    }
	  },


	  _currentState: {
	    // placeholder content
	    stateName: 'unnamed',
	    icon: (function(){ return document.createElement('span'); })()
	  },



	  _states: null, // populated on init



	  state: function(newState){

	    // when called with no args, it's a getter
	    if (arguments.length === 0) {
	      return this._currentState.stateName;
	    }

	    // activate by name
	    if(typeof newState == 'string'){

	      this._activateStateNamed(newState);

	    // activate by index
	    } else if (typeof newState == 'number'){

	      this._activateState(this._states[newState]);
	    }

	    return this;
	  },


	  _activateStateNamed: function(stateName){
	    for(var i = 0; i < this._states.length; i++){
	      if( this._states[i].stateName == stateName ){
	        this._activateState( this._states[i] );
	      }
	    }
	  },

	  _activateState: function(newState){

	    if( newState === this._currentState ){

	      // don't touch the dom if it'll just be the same after
	      return;

	    } else {

	      // swap out elements... if you're into that kind of thing
	      if( this.options.type == 'replace' ){
	        this.button.appendChild(newState.icon);
	        this.button.removeChild(this._currentState.icon);
	      }

	      if( newState.title ){
	        this.button.title = newState.title;
	      } else {
	        this.button.removeAttribute('title');
	      }

	      // update classes for animations
	      for(var i=0;i<this._states.length;i++){
	        L.DomUtil.removeClass(this._states[i].icon, this._currentState.stateName + '-active');
	        L.DomUtil.addClass(this._states[i].icon, newState.stateName + '-active');
	      }

	      // update classes for animations
	      L.DomUtil.removeClass(this.button, this._currentState.stateName + '-active');
	      L.DomUtil.addClass(this.button, newState.stateName + '-active');

	      // update the record
	      this._currentState = newState;

	    }
	  },

	  enable: function(){
	    L.DomUtil.addClass(this.button, 'enabled');
	    L.DomUtil.removeClass(this.button, 'disabled');
	    this.button.setAttribute('aria-hidden', 'false');
	    return this;
	  },

	  disable: function(){
	    L.DomUtil.addClass(this.button, 'disabled');
	    L.DomUtil.removeClass(this.button, 'enabled');
	    this.button.setAttribute('aria-hidden', 'true');
	    return this;
	  },

	  onAdd: function(map){
	    var bar = L.easyBar([this], {
	      position: this.options.position,
	      leafletClasses: this.options.leafletClasses
	    });
	    this._anonymousBar = bar;
	    this._container = bar.container;
	    return this._anonymousBar.container;
	  },

	  removeFrom: function (map) {
	    if (this._map === map)
	      this.remove();
	    return this;
	  },

	});

	L.easyButton = function(/* args will pass automatically */){
	  var args = Array.prototype.concat.apply([L.Control.EasyButton],arguments);
	  return new (Function.prototype.bind.apply(L.Control.EasyButton, args));
	};

	/*************************
	 *
	 * util functions
	 *
	 *************************/

	// constructor for states so only curated
	// states end up getting called
	function State(template, easyButton){

	  this.title = template.title;
	  this.stateName = template.stateName ? template.stateName : 'unnamed-state';

	  // build the wrapper
	  this.icon = L.DomUtil.create('span', '');

	  L.DomUtil.addClass(this.icon, 'button-state state-' + this.stateName.replace(/(^\s*|\s*$)/g,''));
	  this.icon.innerHTML = buildIcon(template.icon);
	  this.onClick = L.Util.bind(template.onClick?template.onClick:function(){}, easyButton);
	}

	function buildIcon(ambiguousIconString) {

	  var tmpIcon;

	  // does this look like html? (i.e. not a class)
	  if( ambiguousIconString.match(/[&;=<>"']/) ){

	    // if so, the user should have put in html
	    // so move forward as such
	    tmpIcon = ambiguousIconString;

	  // then it wasn't html, so
	  // it's a class list, figure out what kind
	  } else {
	      ambiguousIconString = ambiguousIconString.replace(/(^\s*|\s*$)/g,'');
	      tmpIcon = L.DomUtil.create('span', '');

	      if( ambiguousIconString.indexOf('fa-') === 0 ){
	        L.DomUtil.addClass(tmpIcon, 'fa '  + ambiguousIconString)
	      } else if ( ambiguousIconString.indexOf('glyphicon-') === 0 ) {
	        L.DomUtil.addClass(tmpIcon, 'glyphicon ' + ambiguousIconString)
	      } else {
	        L.DomUtil.addClass(tmpIcon, /*rollwithit*/ ambiguousIconString)
	      }

	      // make this a string so that it's easy to set innerHTML below
	      tmpIcon = tmpIcon.outerHTML;
	  }

	  return tmpIcon;
	}

	})();

