package br.com.TCCMapa.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.faces.context.FacesContext;

import org.hibernate.HibernateException;

import br.com.TCCMapa.model.Usuario;
import br.com.TCCMapa.model.UsuarioShpImport;

public class ArquivosDAO {

	private UsuarioDAO usuarioDao = new UsuarioDAO();
	
	public int salvarShp(String geoJson,String indice,int idInserido) {
		PreparedStatement ps = null;
		Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
    	String nomeUsuario = usuarioLogado.getNomeUsuario();
		try {
			Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/ProjetoFinal", "postgres", "147862Dj");
			
			int proximoId = 0;
			
			if(indice=="1") {
				proximoId = this.getNextIdShpImport();
				ps = conn.prepareStatement("insert into UsuarioShpImport (id,primeiraparte,usuario) values (?,?,?)");
				ps.setInt(1, proximoId);
				ps.setString(2,geoJson);
				ps.setInt(3,usuarioDao.getUsuario(nomeUsuario).getId());
				ps.executeUpdate();
				ps.close();
				return proximoId;
			}else if(indice=="2") {
				ps = conn.prepareStatement("update UsuarioShpImport set segundaparte=? where id=?");
				ps.setString(1,geoJson);
				ps.setInt(2,idInserido);
				ps.executeUpdate();
				ps.close();
			}else if(indice=="3") {
				ps = conn.prepareStatement("update UsuarioShpImport set terceiraparte=? where id=?");
				ps.setString(1,geoJson);
				ps.setInt(2,idInserido);
				ps.executeUpdate();
				ps.close();
			}
			
		} catch (HibernateException ex) {
			ex.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return 0;

	}
	
	public void salvarGeoJsonFormas(String geoJsonFormas) {
		PreparedStatement ps = null;
		Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
    	String nomeUsuario = usuarioLogado.getNomeUsuario();
		try {
			Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/ProjetoFinal", "postgres", "147862Dj");
			
			ps = conn.prepareStatement("insert into UsuarioGeoFormas (id,geojsonformas,usuario) values (nextVal('formas_seq'),?,?)");
			ps.setString(1,geoJsonFormas);
			ps.setInt(2,usuarioDao.getUsuario(nomeUsuario).getId());
			ps.executeUpdate();
			ps.close();

			
		} catch (HibernateException ex) {
			ex.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}

	}
	
	public int getNextIdShpImport() {
		PreparedStatement ps = null;
		try {
			Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/ProjetoFinal", "postgres", "147862Dj");
			
			ps = conn.prepareStatement("SELECT nextVal('shape_seq')");
			ResultSet rs = ps.executeQuery();
			if (rs != null) {
				int nextVal = 0 ;
			    while (rs.next()) {
			    	nextVal = rs.getInt(1);
			    }
			    rs.close();
			    return nextVal;
			}
			ps.close();

		} catch (HibernateException ex) {
			ex.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return 0;
	}
	
	
	public List<String> obterGeoJsonFormas() {
		PreparedStatement ps = null;
		Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
    	String nomeUsuario = usuarioLogado.getNomeUsuario();
		try {
			Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/ProjetoFinal", "postgres", "147862Dj");
			
			ps = conn.prepareStatement("SELECT geoJsonFormas FROM usuariogeoformas WHERE usuario = ?");
			ps.setInt(1, usuarioDao.getUsuario(nomeUsuario).getId());
			ResultSet rs = ps.executeQuery();
			List<String> listaGeoFormas = null;
			if (rs != null) {
				listaGeoFormas= new ArrayList<String>();
			    while (rs.next()) {
			    	listaGeoFormas.add(rs.getString(1));
			    }
			    rs.close();
			    return listaGeoFormas;
			}
			ps.close();

		} catch (HibernateException ex) {
			ex.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	
	public List<UsuarioShpImport> obterShpImport() {
		PreparedStatement ps = null;
		Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
    	String nomeUsuario = usuarioLogado.getNomeUsuario();
		try {
			Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/ProjetoFinal", "postgres", "147862Dj");
			
			UsuarioShpImport shpImport;
			List<UsuarioShpImport> listaShpImport;
			
			ps = conn.prepareStatement("SELECT primeiraparte,segundaparte,terceiraparte FROM usuarioshpimport WHERE usuario = ?");
			ps.setInt(1, usuarioDao.getUsuario(nomeUsuario).getId());
			ResultSet rs = ps.executeQuery();
			if (rs != null) {
				shpImport = new UsuarioShpImport();
				listaShpImport = new ArrayList<UsuarioShpImport>();
				while (rs.next()) {
					shpImport.setPrimeiraParte(rs.getString(1));
					shpImport.setSegundaParte(rs.getString(2));
					shpImport.setTerceiraParte(rs.getString(3));
					listaShpImport.add(shpImport);
			    }
			    rs.close();
			    return listaShpImport;
			}


			
		} catch (HibernateException ex) {
			ex.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	
}
