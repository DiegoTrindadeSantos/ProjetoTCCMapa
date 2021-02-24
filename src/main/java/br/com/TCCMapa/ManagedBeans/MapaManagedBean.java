package br.com.TCCMapa.ManagedBeans;

import java.awt.Desktop;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;

import org.primefaces.event.FileUploadEvent;
import org.primefaces.model.UploadedFile;

import br.com.TCCMapa.model.Usuario;
import br.com.TCCMapa.utils.GeradorMapaHtml;

@ManagedBean(name = "MapaMB")
@SessionScoped
public class MapaManagedBean {
	private UploadedFile file;
	private static String FS = File.separator;
	


	public UploadedFile getFile() {
        return file;
    }
 
    public void setFile(UploadedFile file) {
        this.file = file;
    }
 
    public void upload() {
    	if (file != null) {
        	FacesMessage message = new FacesMessage("Successful ss", file.getFileName() + " is uploaded.");
            FacesContext.getCurrentInstance().addMessage(null, message);
        }
    }
    
    public void copyFile(String fileName, InputStream in) {
        try {
        	
        	Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
        	String caminho = FacesContext.getCurrentInstance().getExternalContext().getRealPath("/");
        	
        	criarPastaUsuario(caminho,fileName,usuarioLogado.getNomeUsuario());
        	System.out.println(new File(usuarioLogado.getNomeUsuario()).getCanonicalPath());
            // write the inputStream to a FileOutputStream
            OutputStream out = new FileOutputStream(new File(usuarioLogado.getNomeUsuario()).getCanonicalPath()+FS+fileName);
            
            
            int read = 0;
            byte[] bytes = new byte[1024];
 
            while ((read = in.read(bytes)) != -1) {
            	out.write(bytes, 0, read);
            }
            
            in.close();
            out.flush();
            out.close();
 
            System.out.println("New file created!");
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
    
    public void carregarArquivos() {
    	Usuario usuarioLogado = (Usuario) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("usuarioLogado");
    	String nomeUsuario = usuarioLogado.getNomeUsuario();
    	try {
			File f = new File(new File(nomeUsuario).getCanonicalPath());
			File[] arquivos = f.listFiles();
			
			GeradorMapaHtml geradorMapaHtml = new GeradorMapaHtml();
			
			String html = geradorMapaHtml.gerarHtml();
			
			for (File file : arquivos) {
				if(file.getName().contains(".zip")) {
					html+=geradorMapaHtml.gerarShapefileArquivo(file.getName());
				}
			}
			
			html+=geradorMapaHtml.gerarFinalHtml();
			
			File arquivoHtml = new File(new File(usuarioLogado.getNomeUsuario()).getCanonicalPath()+FS+"teste.html");
			
			BufferedWriter bw = new BufferedWriter(new FileWriter(arquivoHtml));
			bw.write(html);
			bw.close();
			Desktop.getDesktop().browse(arquivoHtml.toURI());
			
			
		} catch (IOException e) {
			e.printStackTrace();
		}
    }
     
    private void criarPastaUsuario(String caminho, String fileName, String nomeUsuario) {
		try {
	    	if(!new File(new File(nomeUsuario).getCanonicalPath()).exists()) {
				new File(new File(nomeUsuario).getCanonicalPath()).mkdir();
			}
		}catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void handleFileUpload(FileUploadEvent event) {
        FacesMessage msg = new FacesMessage("Successful", event.getFile().getFileName() + " is uploaded.");
        FacesContext.getCurrentInstance().addMessage(null, msg);
    }
    
    public void buttonAction() {
        addMessage("Welcome to teste!!");
    }
    
    public void addMessage(String summary) {
        FacesMessage message = new FacesMessage(FacesMessage.SEVERITY_INFO, summary, null);
        FacesContext.getCurrentInstance().addMessage(null, message);
    }
}
