/**
 * 
 */
var m= L.map('map').setView([34.74161249883172,18.6328125], 2);

var shpfile = new L.Shapefile('c:\\eclipse\\teste\\congress.zip',{
		onEachFeature: function (f,l){
			
		}
	});
	shpfile.addTo(m);
