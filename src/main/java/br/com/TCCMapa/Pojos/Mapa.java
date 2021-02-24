package br.com.TCCMapa.Pojos;

import org.primefaces.model.UploadedFile;

public class Mapa {
	private String nomeArquivo;
	private UploadedFile arquivo;

	public String getNomeArquivo() {
		return nomeArquivo;
	}

	public void setNomeArquivo(String nomeArquivo) {
		this.nomeArquivo = nomeArquivo;
	}

	public UploadedFile getArquivo() {
		return arquivo;
	}

	public void setArquivo(UploadedFile arquivo) {
		this.arquivo = arquivo;
	}
	
	
	
}
