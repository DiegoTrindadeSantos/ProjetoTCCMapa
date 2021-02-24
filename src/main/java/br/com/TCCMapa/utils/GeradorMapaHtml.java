package br.com.TCCMapa.utils;

public class GeradorMapaHtml {

	public String gerarHtml() {
		StringBuilder html = new StringBuilder();
			html.append("<?xml version='1.0' encoding='UTF-8' ?>\r\n");
			html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\r\n"); 
			html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\"\r\n"); 
			html.append("xmlns:h=\"http://java.sun.com/jsf/html\"\r\n"); 
			html.append(" 	xmlns:f=\"http://java.sun.com/jsf/core\"\r\n"); 
			html.append(" 	xmlns:p=\"http://primefaces.org/ui\">\r\n"); 
			html.append("<h:head>\r\n"); 
			html.append("<meta charset=\"utf-8\" />\r\n"); 
			html.append("<meta name=\"viewport\"\r\n"); 
			html.append("	content=\"width=device-width, initial-scale=1.0\" />\r\n"); 
			html.append("<link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.0.3/dist/leaflet.css\" />\r\n"); 
			html.append("<script src=\"https://unpkg.com/leaflet@1.0.3/dist/leaflet.js\"></script>\r\n"); 
			html.append("<script src=\"http://calvinmetcalf.github.io/shapefile-js/dist/shp.js\"></script>\r\n");
			html.append("<script src=\"http://calvinmetcalf.github.io/leaflet.shapefile/leaflet.shpfile.js\"></script>\r\n");
			html.append("<script src=\"http://calvinmetcalf.github.io/leaflet.shapefile/catiline.js\"></script>\r\n");
			
			
			html.append("<style type=\"text/css\">\r\n");
			html.append("#map {\r\n");
			html.append("height: 300px;\r\n");
			html.append("}\r\n");
			html.append("input {\r\n");
			html.append("margin-top: 10px;\r\n");
			html.append("}\r\n");
			html.append("</style>\r\n");
			html.append("</h:head>\r\n");
			html.append("<h:body>\r\n");
			html.append("<h:form id=\"mapaForm\" enctype=\"multipart/form-data\">\r\n");
			html.append("<div id=\"map\"></div></div>\r\n");
			html.append("<table id=\"teste\" style=\"width: 90%\">\r\n");
			html.append("</table>\r\n");
			
			html.append("<script>\r\n");
			html.append("var attribution = '&copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>';\r\n");
			html.append("var indice = 0;\r\n");
			html.append("var arrayLayers = [];\r\n");
			html.append("var m= L.map('map').setView([34.74161249883172,18.6328125], 2);\r\n");
			html.append("var myStyle = { \r\n");
			html.append("\"color\": \"#eeeeee\"\r\n");
			html.append("};\r\n");
			html.append("var mapnik = L.tileLayer(\r\n");
			html.append("'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'\r\n");
			html.append(", {attribution: attribution}\r\n");
			html.append(").addTo(m);\r\n");
			html.append("var blackAndWhite = L.tileLayer(\r\n");
			html.append("				         'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'\r\n");
			html.append("				         , {attribution: attribution}\r\n");
			html.append(")\r\n");
			html.append("var baseMaps = {\r\n");
			html.append("\"Mapnik\": mapnik, \"Black and White\": blackAndWhite\r\n");
			html.append("};\r\n");
			html.append("var grupoLayer = L.control.layers(baseMaps).addTo(m);\r\n");

			return html.toString();
	}
	
	public String gerarShapefileArquivo(String nomeArquivo) {
		StringBuilder html = new StringBuilder();
			html.append("\r\nvar shp_"+nomeArquivo.replace(".", "")+" = new L.Shapefile('"+nomeArquivo+"',{\r\n"); 
			html.append(" 		onEachFeature: function (f,l){\r\n"); 
			html.append(" 			l.on('click', function(e){\r\n"); 
			html.append("							document.getElementById(\"teste\").innerHTML=\"\";\r\n"); 
			html.append("								for(var key in e.target.feature.properties){\r\n"); 
			html.append("								   if (e.target.feature.properties.hasOwnProperty(key)) {\r\n"); 
			html.append("										document.getElementById(\"teste\").innerHTML+=\" <tr><th>\"+key+\"</th><td>\"+e.target.feature.properties[key]+\"</td></tr>\"\r\n");
			html.append("								   }\r\n"); 
			html.append("								}\r\n"); 
			html.append("							})\r\n"); 
			html.append("						}}).addTo(m);");

			return html.toString();
	}
	
	public String gerarFinalHtml() {
		StringBuilder html = new StringBuilder();
			html.append("</script>\r\n");
			html.append("	</h:form>\r\n"); 
			html.append("</h:body>\r\n");
			html.append("</html>");

			return html.toString();
	}
}
