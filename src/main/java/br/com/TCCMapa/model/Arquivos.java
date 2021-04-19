package br.com.TCCMapa.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
public class Arquivos {

	 @Id
     @Column(name="id", nullable=false, unique=true)
     private int id;
      
     @Column(name="filename", nullable=false, unique=true)
     private String nomeArquivo;
     
     @Column(name="geoJsonFormas", nullable=false, unique=true)
     private String geoJsonFormas;
     
     @Lob
     private byte[] file;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNomeArquivo() {
		return nomeArquivo;
	}

	public void setNomeArquivo(String nomeArquivo) {
		this.nomeArquivo = nomeArquivo;
	}

	public byte[] getFile() {
		return file;
	}

	public void setFile(byte[] file) {
		this.file = file;
	}

	public String getGeoJsonFormas() {
		return geoJsonFormas;
	}

	public void setGeoJsonFormas(String geoJsonFormas) {
		this.geoJsonFormas = geoJsonFormas;
	}
     
	
     
     
     
}
