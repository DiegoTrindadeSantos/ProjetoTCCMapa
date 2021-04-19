package br.com.TCCMapa.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class UsuarioShpImport {

	@Id
    @Column(name="id", nullable=false, unique=true)
    private int id;
	
	private int idUsuario;
	
	@Column(name="primeiraParte", nullable=false, unique=true, insertable=false, updatable=false)
	private String primeiraParte;
	
	@Column(name="primeiraParte", nullable=false, unique=true, insertable=false, updatable=false)
	private String segundaParte;
	
	@Column(name="primeiraParte", nullable=false, unique=true, insertable=false, updatable=false)
	private String terceiraParte;
	

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(int idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getPrimeiraParte() {
		return primeiraParte;
	}

	public void setPrimeiraParte(String primeiraParte) {
		this.primeiraParte = primeiraParte;
	}

	public String getSegundaParte() {
		return segundaParte;
	}

	public void setSegundaParte(String segundaParte) {
		this.segundaParte = segundaParte;
	}

	public String getTerceiraParte() {
		return terceiraParte;
	}

	public void setTerceiraParte(String terceiraParte) {
		this.terceiraParte = terceiraParte;
	}
	
}
