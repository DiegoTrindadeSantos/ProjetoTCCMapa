package br.com.TCCMapa.ManagedBeans;

import java.util.List;
import java.util.Map;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;

import org.primefaces.PrimeFaces;
import org.primefaces.event.FileUploadEvent;
import org.primefaces.model.UploadedFile;

import br.com.TCCMapa.dao.ArquivosDAO;
import br.com.TCCMapa.model.UsuarioShpImport;


@ManagedBean(name = "MapaMB")
@SessionScoped
public class MapaManagedBean {
	private UploadedFile file;
	private ArquivosDAO arquivosDAO = new ArquivosDAO();
	public int idInserido;

	public UploadedFile getFile() {
        return file;
    }
 
    public void setFile(UploadedFile file) {
        this.file = file;
    }
 
    public void upload() {
    	if (file != null) {
        	FacesMessage message = new FacesMessage("Successful", file.getFileName() + " is uploaded.");
            FacesContext.getCurrentInstance().addMessage(null, message);
        }
    }
    
    public void recebeJson() {
    	Map<String, String> requestParamMap = FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap();
    	if(requestParamMap.get("geoJson1")!=null) {
    		this.setIdInserido(arquivosDAO.salvarShp(requestParamMap.get("geoJson1"), "1",0));
    	}
    	if(requestParamMap.get("geoJson2")!=null) {
    		arquivosDAO.salvarShp(requestParamMap.get("geoJson2"), "2",this.getIdInserido());
    	}
    	if(requestParamMap.get("geoJson3")!=null) {
    		arquivosDAO.salvarShp(requestParamMap.get("geoJson3"), "3",this.getIdInserido());
    	}
    }
    
    public void recebeJsonFormas() {
    	Map<String, String> requestParamMap = FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap();
    	String geoJson = requestParamMap.get("geoJson");
    	arquivosDAO.salvarGeoJsonFormas(geoJson);
    }

	public void handleFileUpload(FileUploadEvent event) {
		FacesMessage msg = new FacesMessage("Successful", event.getFile().getFileName() + " is uploaded.");
        FacesContext.getCurrentInstance().addMessage(null, msg);
    }
    
    public void buttonAction() {
        List<String> listaGeoFormas = arquivosDAO.obterGeoJsonFormas();
        for (String geoForma : listaGeoFormas) {
        	PrimeFaces.current().executeScript("Carregar('"+geoForma+"')");			
		}
        this.carregarShpImports();
    }
    public void carregarShpImports() {
        List<UsuarioShpImport> listaShpImport = arquivosDAO.obterShpImport();
        for (UsuarioShpImport usuarioShpImport : listaShpImport) {
        	PrimeFaces.current().executeScript("CarregarShp1('"+usuarioShpImport.getPrimeiraParte()+"')");
        	PrimeFaces.current().executeScript("CarregarShp2('"+usuarioShpImport.getSegundaParte()+"')");
        	PrimeFaces.current().executeScript("CarregarShp3('"+usuarioShpImport.getTerceiraParte()+"')");
		}
    }
    
    public void addMessage(String summary) {
        FacesMessage message = new FacesMessage(FacesMessage.SEVERITY_INFO, summary, null);
        FacesContext.getCurrentInstance().addMessage(null, message);
    }

	public int getIdInserido() {
		return idInserido;
	}

	public void setIdInserido(int idInserido) {
		this.idInserido = idInserido;
	}
    
    
}
