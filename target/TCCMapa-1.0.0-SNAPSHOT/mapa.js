var attribution = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
			var indice = 0;
			var arrayLayers = [];
		 
		 	var m= L.map('map').setView([34.74161249883172,18.6328125], 2);

			 var myStyle = { // Define your style object
			   "color": "#eeeeee"
			};
			 var shp1="";
			 var shp2="";
			 var shp3="";
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
		                layer = e.layer;
					var geoJsonFormas = JSON.stringify(layer.toGeoJSON());
					
					recebeJsonFormas([{ name:'geoJson', value : geoJsonFormas }]);
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
		
		function Carregar(geoJsonFormas){
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
			L.geoJSON(JSON.parse(geoJsonFormas), {
				style: function () {
					return {color: cor};
				}
			}).addTo(m);
		}
		function CarregarShp1(geoJsonFormas){
			shp1 = geoJsonFormas;
		}
		function CarregarShp2(geoJsonFormas){
			shp2 = geoJsonFormas;
		}
		function CarregarShp3(geoJsonFormas){
			shp3 = geoJsonFormas;
			
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
				
			var geoJsonBefore = JSON.parse(shp1+shp2+shp3);
			geoJsonBefore = rewind(geoJsonBefore, true);
			L.geoJson(JSON.parse(JSON.stringify(geoJsonBefore)),{
				style: function () {
					return {color: cor};
				},
				onEachFeature:function (f,l){
					
					l.on('click', function(e){
						htmlPopup="<table>";
							for(var key in e.target.feature.properties){
							   if (e.target.feature.properties.hasOwnProperty(key)) {
									htmlPopup+=" <tr><th>"+key+"</th><td>"+e.target.feature.properties[key]+"</td></tr>";
							   }
							}
							htmlPopup+="</table>";
							l.bindPopup(htmlPopup);
						})
				}
			}).addTo(m);
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
						   }
						}
						htmlPopup+="</table>";
						l.bindPopup(htmlPopup);
					})
				}}).addTo(m);
				layer="";
				layer = arrayLayers[indice].addData(data);
				var rec1;
				var rec2;
				var rec3;
				var collection = {
					    "type": "FeatureCollection",
					    "features": []
					};
				data.features.forEach(function(feature){
				    collection.features.push(feature);
				});
				var receberGeoJson = JSON.stringify(collection);
				if(receberGeoJson.length > 3000000){
					rec1 = receberGeoJson.substring(0,1500000);
					rec2 = receberGeoJson.substring(1500000,3000000);
					rec3 = receberGeoJson.substring(3000000);
				}else if(receberGeoJson.length > 1500000){
					rec1 = receberGeoJson.substring(0,1000000);
					rec2 = receberGeoJson.substring(1000000,2000000);
					rec3 = receberGeoJson.substring(2000000);
				}
				recebeJson([{ name:'geoJson1', value : rec1 }]);
				recebeJson([{name:'geoJson2', value : rec2}]);
				recebeJson([{name:'geoJson3', value : rec3}]);
				
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
		
		function rewind(gj, outer) {
	          switch ((gj && gj.type) || null) {
	              case 'FeatureCollection':
	                  gj.features = gj.features.map(curryOuter(rewind, outer));
	                  return gj;
	              case 'Feature':
	                  gj.geometry = rewind(gj.geometry, outer);
	                  return gj;
	              case 'Polygon':
	              case 'MultiPolygon':
	                  return correct(gj, outer);
	              default:
	                  return gj;
	          }
	      }
	      function curryOuter(a, b) {
	          return function(_) { return a(_, b); };
	      }
	      function correct(_, outer) {
	          if (_.type === 'Polygon') {
	              _.coordinates = correctRings(_.coordinates, outer);
	          } else if (_.type === 'MultiPolygon') {
	              _.coordinates = _.coordinates.map(curryOuter(correctRings, outer));
	          }
	          return _;
	      }
	      function correctRings(_, outer) {
	          outer = !!outer;
	          _[0] = wind(_[0], !outer);
	          for (var i = 1; i < _.length; i++) {
	              _[i] = wind(_[i], outer);
	          }
	          return _;
	      }

	      function wind(_, dir) {
	          return cw(_) === dir ? _ : _.reverse();
	      }

	      function cw(_) {
	          return ringArea(_) >= 0;
	      }
	      function geometry(_) {
	          if (_.type === 'Polygon') return polygonArea(_.coordinates);
	          else if (_.type === 'MultiPolygon') {
	              var area = 0;
	              for (var i = 0; i < _.coordinates.length; i++) {
	                  area += polygonArea(_.coordinates[i]);
	              }
	              return area;
	          } else {
	              return null;
	          }
	      }

	      function polygonArea(coords) {
	          var area = 0;
	          if (coords && coords.length > 0) {
	              area += Math.abs(ringArea(coords[0]));
	              for (var i = 1; i < coords.length; i++) {
	                  area -= Math.abs(ringArea(coords[i]));
	              }
	          }
	          return area;
	      }

	      function ringArea(coords) {
	          var area = 0;

	          if (coords.length > 2) {
	              var p1, p2;
	              for (var i = 0; i < coords.length - 1; i++) {
	                  p1 = coords[i];
	                  p2 = coords[i + 1];
	                  area += rad(p2[0] - p1[0]) * (2 + Math.sin(rad(p1[1])) + Math.sin(rad(p2[1])));
	              }

	              area = area * 6378137 * 6378137 / 2;
	          }

	          return area;
	      }

	      function rad(_) {
	          return _ * Math.PI / 180;
	      }