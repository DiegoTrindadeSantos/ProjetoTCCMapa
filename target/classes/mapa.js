var attribution = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
			var indice = 0;
			var arrayLayers = [];
		 
		 	var m= L.map('map').setView([34.74161249883172,18.6328125], 2);

			 var myStyle = { // Define your style object
			   "color": "#eeeeee"
			};
			 
			 var drawnItems = new L.FeatureGroup();
		        m.addLayer(drawnItems);

		        var drawControl = new L.Control.Draw({
		        	   draw: {
		        	    polygon: {
		        	     shapeOptions: {
		        	      color: 'purple'
		        	     },
		        	    },
		        	    polyline: {
		        	     shapeOptions: {
		        	      color: 'red'
		        	     },
		        	    },
		        	    rect: {
		        	     shapeOptions: {
		        	      color: 'green'
		        	     },
		        	    },
		        	    circle: {
		        	     shapeOptions: {
		        	      color: 'steelblue'
		        	     },
		        	    },
		        	   },
		        	   edit: {
		        	    featureGroup: drawnItems
		        	   }
		        	  });
		        	  m.addControl(drawControl);

		        m.on('draw:created', function (e) {
		            var type = e.layerType,
		                layer = e.layer;
		            drawnItems.addLayer(layer);
		        });
		 
			var mapnik = L.tileLayer(
			        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			        , {attribution: attribution}
			).addTo(m);

		 
			 var blackAndWhite = L.tileLayer(
			         'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
			         , {attribution: attribution}
			 )
		 
			 var baseMaps = {
			       "Mapnik": mapnik, "Black and White": blackAndWhite
			   };
		 
		 	var grupoLayer = L.control.layers(baseMaps).addTo(m);
		 	
		 	var printer = L.easyPrint({
	      		tileLayer: mapnik,
	      		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
	      		filename: 'myMap',
	      		exportOnly: true,
	      		hideControlContainer: true
			}).addTo(m);

		 	
		function Add(file){
			var files = file.files;
			if (files.length == 0) {
			   return; //do nothing if no file given yet
			 }
				 
			 var file = files[0];
			 
			 if (file.name.slice(-3) != 'zip') { //Demo only tested for .zip. All others, return.
			   document.getElementById('warning').innerHTML = 'Select .zip file';
			   return;
			 } else {
			   document.getElementById('warning').innerHTML = ''; //clear warning message.
			   handleZipFile(file);
			 }
		}

		//More info: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
		function handleZipFile(file) {
		 var reader = new FileReader();
		 reader.onload = function() {
		   if (reader.readyState != 2 || reader.error) {
		    return;
		   } else {
		    convertToLayer(reader.result);
		    
		   }
		 }
		 reader.readAsArrayBuffer(file);
		 
		}

		function convertToLayer(buffer) {
			var layer;
			
			shp(buffer).then(function(data){
			
				var arrayCoresHexa= [
				'#b01207',
				'#099104',
				'#041187',
				'#d4d00d',
				'#24bfab',
				'#e053bd',
				'#9ae053',
				'#f09116'
				];
				var randomNumber = Math.floor(Math.random()*arrayCoresHexa.length);
				var cor = arrayCoresHexa[randomNumber];
				var htmlPopup;
				
				
				arrayLayers[indice]=L.geoJson({features:[]},{onEachFeature:function (f,l){
				
				l.on('click', function(e){
					htmlPopup="<table>";
						for(var key in e.target.feature.properties){
						   if (e.target.feature.properties.hasOwnProperty(key)) {
								htmlPopup+=" <tr><th>"+key+"</th><td>"+e.target.feature.properties[key]+"</td></tr>";
								//modal.style.display = "block";
						   }
						}
						htmlPopup+="</table>";
						l.bindPopup(htmlPopup);
					})
				}}).addTo(m);
				layer="";
				layer = arrayLayers[indice].addData(data);
				layer.setStyle({
				       color: cor,
				   });
				indice+=1;
				
				adicionarLayer(layer,data.fileName);
			});
		
		
		 }

		function adicionarLayer(layerShp,arquivo){
		
			grupoLayer.addOverlay(layerShp,'ShapeFile_'+arquivo);
		}
		