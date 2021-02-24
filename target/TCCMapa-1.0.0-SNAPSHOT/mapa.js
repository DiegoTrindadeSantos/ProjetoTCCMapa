/**
 * 
 */
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
	var attribution = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
	var indice = 0;
	var arrayLayers = [];
 
 	var m= L.map('map').setView([34.74161249883172,18.6328125], 2);

	 var myStyle = { // Define your style object
	   "color": "#eeeeee"
	};

 
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
			
			
			
			arrayLayers[indice]=L.geoJson({features:[]},{onEachFeature:function (f,l){
			
			l.on('click', function(e){
				document.getElementById("teste").innerHTML="";
					for(var key in e.target.feature.properties){
					   if (e.target.feature.properties.hasOwnProperty(key)) {
							document.getElementById("teste").innerHTML+=" <tr><th>"+key+"</th><td>"+e.target.feature.properties[key]+"</td></tr>"
					        //alert(key +" - "+ e.target.feature.properties[key]);
					   }
					}
				})
			}}).addTo(map);
			layer="";
			layer = arrayLayers[indice].addData(data);
			layer.setStyle({
			       color: cor,
			   });
			indice+=1;
			
			adicionarLayer(layer,data.fileName);
		});
	
	
	 }
	
	function onInitFs(fs){
		fs.root.getFile("c://info.txt", {create: true}, function(DatFile) {
		    DatFile.createWriter(function(DatContent) {
		      DatContent.write(new File(["teste"], {type: "text/plain;charset=utf-8"}));
		    });
		  });
	}
	
	function errorHandler(e) {
		  var msg = '';

		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
		  };

		  console.log('Error: ' + msg);
		}
	
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

	function adicionarLayer(layerShp,arquivo){
	
		grupoLayer.addOverlay(layerShp,'ShapeFile_'+arquivo);
	}

	