class Upload{

    constructor(){
        
        this.btnUploadFileEl = document.querySelector(".upload");
        this.inputUploadEl = document.querySelector(".file-upload");
        this.formUploadEl = document.querySelector(".input-upload-form");
        this.btnUploadMobileEl = document.querySelector(".mobile-btn-upload");
        this.upload_FileOptions = document.querySelector(".file-options-buttons");
        this.optionContentEl = document.querySelector(".option-content form");
        this.btnCancelOptions = this.upload_FileOptions.querySelector(".cancel");
        this.btnRenameOptions = this.upload_FileOptions.querySelector(".rename");
        this.btnRemoveOptions = this.upload_FileOptions.querySelector(".remove");
        this.btnNewFolder = this.upload_FileOptions.querySelector(".newFolder");
        this.fileList = document.querySelector(".list-files");
        this.currentFolderEl = document.querySelector(".current-folder");
        this.indexElementsSelect = [];
        this.currentFolder = ["Home"];
        this.initialize();

    }

    initialize(){

        this.initEvents();
        this.readFiles();
        this.toggleBtnsToFile();

    }

    initEventsFile(){

        this.getFileElements().forEach((fileEl,index)=>{

            fileEl.addEventListener("click",event=>{


                if(event.ctrlKey){

                    this.selectFile(fileEl,{mult:true});
                    this.indexElementsSelect.push(index);

                }
                else if(event.shiftKey){

                    this.selectElementWithShift(index);

                }
                else{

                    this.indexElementsSelect = [];
                    this.removeActiveClass();
                    this.selectFile(fileEl);
                    this.indexElementsSelect.push(index);

                }

                this.toggleBtnsToFile();
                this.toggleOptionsElement("_active_file-option");
                

            })

            fileEl.addEventListener("dblclick",event=>{

                let {originalFilename, mimetype, newFilename} = JSON.parse(fileEl.dataset.infofile);

                if(mimetype == "folder"){

                    this.openFolder(originalFilename);
                    this.toggleOptionsElement();

                }
                else{

                    this.downloadFile(newFilename);

                }

            })

        })

    }

    initEventsBtnPath(){

        let btnsPathFolder = [...document.querySelectorAll(".btn-folder")];

        btnsPathFolder.forEach(btnPath=>{
            
            btnPath.addEventListener("click",event=>{

                this.getFirebaseRef().off("value");

                let folderPath = event.target.dataset.path.split("/");

                this.currentFolder = folderPath;

                this.openFolder();

            })

        })

    }

    initEvents(){

        this.btnUploadFileEl.addEventListener("click",event=>{

            this.inputUploadEl.click();

        })

        this.inputUploadEl.addEventListener("change",event=>{

            let form = this.formUploadEl;

            this.uploadFile(form);

            form.reset();

            this.toggleOptionsElement();

        })

        this.btnUploadMobileEl.addEventListener("click",event=>{

            this.toggleOptionsElement("_active_upload-option");

        })

        this.btnCancelOptions.addEventListener("click",event=>{

            this.toggleOptionsElement();
            this.removeActiveClass();

        })

        this.btnRenameOptions.addEventListener("click",event=>{

            this.renameFile();

        })

        this.btnNewFolder.addEventListener("click",event=>{

            this.newFolder();

        })

        this.btnRemoveOptions.addEventListener("click",event=>{

            let filesSelected = this.getFileElementsActive();
            this.deleteFile(filesSelected);

        })

    }

    selectElementWithShift(index){

        let filesEl = this.getFileElements();

            let firstSelect = this.indexElementsSelect[0] || 0;
            let start;
            let end;

            this.removeActiveClass();

            if(firstSelect>index){

                start = index;
                end = firstSelect;

            }
            else{

                start = firstSelect;
                end = index;

            }

            while(start<=end){

                this.selectFile(filesEl[start]);

                start++;

            }

    }

    downloadFile(newFilename){

        let LinkDownload = document.createElement("a");

        LinkDownload.setAttribute("href",`/${newFilename}`);

        LinkDownload.setAttribute("download","");

        LinkDownload.click();

    }

    newFolder(){

        let currentFolders = this.getFilesFirebase().filter(file=>{

            return file.mimetype === "folder";

        })

        let folderName = prompt("Digite o nome da pasta:");

        folderName = this.replaceSpaceNamefile(folderName,true);

        if(!folderName) return;

        for(let folder of currentFolders){

            if(folderName === folder.originalFilename){

                alert("o nome já existe");

                return;

            }

        }

        let folderProps = {
            originalFilename:folderName,
            mimetype:"folder"
        }

        this.getFirebaseRef().push().set(folderProps);

        this.toggleOptionsElement();

    }

    toggleBtnsToFile(remove){

        let filesSelected = this.getFileElementsActive();

        if(filesSelected.length > 1){

            this.btnRenameOptions.style.display = "none";

        }
        else if(filesSelected.length == 0 || remove){

            this.btnRenameOptions.style.display = "none";
            this.btnRemoveOptions.style.display = "none";

        }
        else{

            this.btnRenameOptions.style.display = "";
            this.btnRemoveOptions.style.display = "";

        }

    }

    getFileElementsActive(){

        let filesSelected = [...this.fileList.querySelectorAll(".active_li")];

        let objectFiles = filesSelected.map(file=>JSON.parse(file.dataset.infofile))

        
        return objectFiles;

    }


    openFolder(folderName){

        this.getFirebaseRef().off("value");

        if(folderName) {

            this.currentFolder.push(folderName);

        }

        this.readFiles();

    }

    replaceSpaceNamefile(name,remove){

        if(!name) return false;

        let newName;

        if(remove){

            newName = name.replace(/\s/g,"@");

        }
        else{

            newName = name.replace(/@/g," ");

        }

        return newName;

    }

    renameFile(){

        if(this.getFileElementsActive().length < 1) return;

        let fileToRename = this.getFileElementsActive()[0];

        let currentFiles = this.getFilesFirebase();

        let oldFilename = fileToRename.originalFilename;

        let lastDot;

        let isFolder = false;

        if(fileToRename.mimetype === "folder"){

            isFolder = true;

            lastDot = oldFilename.lastIndexOf("");
            

        }
        else{

            lastDot = oldFilename.lastIndexOf(".");

        }

        let fileExt = oldFilename.slice(lastDot);

        let newFilename = 
        prompt("Digite o novo nome do arquivo:",this.replaceSpaceNamefile(oldFilename.slice(0,lastDot)));

        if(isFolder){

            newFilename = this.replaceSpaceNamefile(newFilename,true);

        }

        for(let file of currentFiles){

            if(file.originalFilename === newFilename.concat(fileExt) && fileToRename.mimetype === file.mimetype){

                alert("o nome já existe");

                return;

            }

        }


        fileToRename.originalFilename = newFilename.concat(fileExt);

        let fileKey = fileToRename.key;

        this.getFirebaseRef().child(fileKey).set(fileToRename);

        this.toggleOptionsElement();

    }

    deleteFile(files){

        let filesToDelete = [];

        for(let file of files){

            if(!file.mimetype) return;

            if(file.mimetype == "folder"){

                this.deleteFolderFirebase(file);

            }
            else{
                
                let {newFilename,key} = file;
                
                filesToDelete.push({newFilename,key});

            }

        }
        
        let data = new FormData();

        data.append("files",JSON.stringify(filesToDelete));
        
        axios.delete("/remove",
            {
                data,
                headers:{"Content-Type":"multipart/form-data"}
            }).then(result=>{

                let files = result.data;

              this.removeFileFirebase(files);

        }).catch(err=>{

            alert(err);

        })


    }

    deleteFolderFirebase(folder,folderPath){
        
        if(!folderPath){

            folderPath = [...this.currentFolder];
            folderPath.push(folder.originalFilename);

        }

        this.getFirebaseRef(folderPath.join("/")).on("value",snapshot=>{

            snapshot.forEach(snap=>{
                
                let fileValue = snap.val();
                let key = snap.key;
                let filePath = [...folderPath];
                filePath.push(fileValue.originalFilename);

                let file = {...fileValue,key};

                if(fileValue.mimetype != "folder"){

                    this.deleteFile([file]);

                }
                else{

                    this.deleteFolderFirebase(file,filePath);

                }

            })

        })
        
        this.getFirebaseRef().child(folder.key).remove();
        this.currentFolder.push(folder.originalFilename);
        this.getFirebaseRef().remove();
        this.currentFolder.pop();
    
    }

    removeFileFirebase(files){

        let filesSuccess = files.infoSuccessFile;
        let filesError = files.infoErrorFile;
        
        for(let file of filesError){
            
            alert(`FileError: ${file.fileError.newFilename} | ${file.msgError.code}`);

        }

        for(let file of filesSuccess){

            this.getFirebaseRef().child(file.fileSuccess.key).remove();

        }

        this.toggleOptionsElement();
        this.toggleBtnsToFile();

    }

    removeActiveClass(){

        this.getFileElements().forEach(el=>{

            if(el.className == "active_li"){

                el.classList.remove("active_li");

            }

        })

    }


    getFileElements(){

        return [...this.fileList.querySelectorAll("li")];

    }

    uploadFile(form){

        let data = new FormData(form);

        let files = data.values();

        for(let file of files){

            console.log(file.size);

        }

        axios.post("/upload",data,{onUploadProgress:(progressEvent=>{

            let percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);

            this.toggleUploadProgressEl({percent});

        })}).then(response=>{

            let res = response.data;

                if(!res.length){

                    alert(res.msg);

                }else{

                    res.forEach(file=>{

                        this.addFileFirebase(file);

                    })

                }

        }).catch(err=>{

            alert(err);

        })

    }

    toggleUploadProgressEl(infoUpload){

        let uploadProgressContainerEl = document.querySelector(".upload-time-container");

        uploadProgressContainerEl.style.display = "block";

        let progressBarEl = uploadProgressContainerEl.querySelector(".upload-time-desc-view");

        progressBarEl.style.width = infoUpload.percent + "%";

        if(infoUpload.percent == 100) uploadProgressContainerEl.style.display = "none";

    }

    uploadTimeEl(infoUpload){

        return 
        `<div class="upload-time-desc-info">

          <div class="upload-time-desc-info-head">
          <div class="icon-upload-rotate-container"><img class="icon-upload-rotate" src="/icons/loadUpload.png"></div>

          <div class="upload-time-name-file">fazendo upload do arquivo txt.txt

          </div>
        </div>

          <div class="upload-time-end">tempo restante 00:00:30</div>

        </div>

        <div class="upload-time-desc-view">
          
        </div>`

    }

    resetIconsFile(){

        this.fileList.innerHTML = "";

    }

    getCurrentFolder(){

        return this.currentFolder.join("/");

    }

    getFilesFirebase(){

        let files = [];

        this.getFirebaseRef().on("value",snapshot=>{

            snapshot.forEach(file=>{

                let fileKey = file.key;
                let fileValue = file.val();

                files.push({key:fileKey,...fileValue})

            })

        })

        return files;

    }

    readFiles(){
        
        this.getFirebaseRef().on("value",snapshot=>{

            this.resetIconsFile();

            snapshot.forEach(file=>{
                
                let fileKey = file.key;
                let fileValue = file.val();

                this.addFileIcon(Object.assign({},fileValue,{key:fileKey}));

            })

        })

        this.addFolderPathEl();

        this.toggleBtnsToFile(true);

    }

    addFolderPathEl(){

        let strPathEl = "";
        let strPath = "";

        this.getCurrentFolder().split("/").forEach((folderName,index,obj)=>{

            if(index <= 0){
                strPath += folderName;
                strPathEl+=`<button data-path='${strPath}' class='btn-folder'>${this.replaceSpaceNamefile(folderName)}</button>`;

            }
            else{

                strPath += "/"+ folderName;
                strPathEl+=`<span> > </span>
                <button data-path='${strPath}' class='btn-folder'>${this.replaceSpaceNamefile(folderName)}</button>`;

            }
            

        })

        this.currentFolderEl.innerHTML = strPathEl;

        this.initEventsBtnPath();

    }

    addFileIcon(file){

        let fileInfoString = JSON.stringify(file);

        let icon;

        if(!file.mimetype) return;

        switch(file.mimetype){
            case "image/jpeg":
            case "image/png":
            case "image/jpg":
            case "image/gif":
            case "image/jiff":
                icon =  `
                <li data-infoFile='${fileInfoString}'>
                    <img class="img-file" src="/${file.newFilename}">
                    <span>${this.replaceSpaceNamefile(file.originalFilename)}</span>
                </li>
                `;
                break;

            default:
                icon = `
            <li data-infoFile='${fileInfoString}'>
                <img class="img-file" src="/icons/${this.getFileIcon(file.mimetype)}">
                <span>${this.replaceSpaceNamefile(file.originalFilename)}</span>
            </li>
            `;    


        }

        this.fileList.innerHTML += icon;
            

            this.initEventsFile();            
    }

    getFileIcon(type){

        let mimetypes = {
            "default":"default.png",
            "folder":"folder.png",
            "image/jpeg":"default.png",
            "application/pdf":"pdf.png",
            "application/msword":"docx.png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx.png",
            "application/vnd.ms-excel":"xlsx.png",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx.png",
            "application/vnd.ms-powerpoint":"pptx.png",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation":"pptx.png",
            "text/plain":"txt.png",
            "audio/mpeg":"mp3.png",
            "audio/mp3":"mp3.png",
            "audio/wav":"mp3.png",
            "audio/ogg":"mp3.png",
            "audio/midi":"mp3.png",
            "audio/aac":"mp3.png",
            "video/x-msvideo":"mp4.png",
            "video/mpeg":"mp4.png",
            "video/mp4":"mp4.png",
            "video/quicktime":"mp4.png",
            "video/webm":"mp4.png",
            "video/ogg":"mp4.png",
            "video/avi":"mp4.png",
            "video/x-matroska":"mp4.png",
            "text/html":"html.png",
            "text/html":"html.png"
        }

        
        return mimetypes[type] || mimetypes["default"];

    }


    addFileFirebase(file){

        this.getFirebaseRef().push().set(file);

    }

    selectFile(file,optionSelect = false){

        if(optionSelect.mult){

            file.classList.toggle("active_li");
            return;

        }

        file.classList.add("active_li");
        this.toggleBtnsToFile();

    }

    toggleOptionsElement(classEl){

        let classElToRemove;

        switch(classEl){

            case "_active_file-option":
                classElToRemove = "_active_upload-option";
                break;

            case "_active_upload-option":
                classElToRemove = "_active_file-option"
                break;

            default:
                this.upload_FileOptions.className = "file-options-buttons";
                this.optionContentEl.classList.remove("_disabled");
                return;

        }

        this.upload_FileOptions.classList.add(classEl);
        this.upload_FileOptions.classList.remove(classElToRemove);
        this.optionContentEl.classList.add("_disabled");

    }

    getFirebaseRef(path){

        let currentFolder;

        if(path){

            currentFolder = path;

        }
        else{

            currentFolder = this.getCurrentFolder();

        }
        
        return firebase.database().ref(currentFolder);

    }

}