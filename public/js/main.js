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
        this.initialize();

    }

    initialize(){

        this.initEvents();
        this.readFiles();
        this.toggleBtnsToFile();

    }

    initEventsFile(){

        this.getFileElements().forEach(fileEl=>{

            fileEl.addEventListener("click",event=>{

                if(event.ctrlKey){

                    this.selectFile(fileEl,{mult:true});

                }
                else if(event.shiftKey){

                }
                else{

                    this.removeActiveClass();
                    this.selectFile(fileEl);

                }

                this.toggleBtnsToFile();
                this.toggleOptionsElement("_active_file-option");
                

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

            this.deleteFile();

        })

    }

    newFolder(){

        let folderName = prompt("Digite o nome da pasta:");

        if(!folderName) return;

        let folderProps = {
            originalFilename:folderName,
            mimetype:"folder"
        }

        this.getFirebaseRef().push().set(folderProps);

    }

    toggleBtnsToFile(){

        let filesSelected = this.getFileElementsActive();

        if(filesSelected.length > 1){

            this.btnRenameOptions.style.display = "none";

        }
        else if(filesSelected.length == 0){

            this.btnRenameOptions.style.display = "none";
            this.btnRemoveOptions.style.display = "none";

        }
        else{

            this.btnRenameOptions.style.display = "";
            this.btnRemoveOptions.style.display = "";

        }

    }

    getFileElementsActive(){

        return [...this.fileList.querySelectorAll(".active_li")];

    }

    renameFile(){

        if(this.getFileElementsActive().length < 1) return;

        let fileToRename = this.getFileElementsActive()[0];

        let fileInfo = JSON.parse(fileToRename.dataset.infofile);

        let oldFilename = fileInfo.originalFilename;

        let lastDot = oldFilename.lastIndexOf(".");

        let fileExt = oldFilename.slice(lastDot);

        let newFilename = 
        prompt("Digite o novo nome do arquivo:",oldFilename.slice(0,lastDot));

        fileInfo.originalFilename = newFilename.concat(fileExt);

        let fileKey = fileInfo.key;

        this.getFirebaseRef().child(fileKey).set(fileInfo);

        this.toggleOptionsElement();

    }

    deleteFile(){

        let filesToDelete = [];

        this.getFileElementsActive().forEach(file=>{

            let {key,newFilename} = JSON.parse(file.dataset.infofile);

            filesToDelete.push({newFilename,key});

        })

        let data = new FormData();

        data.append("files",JSON.stringify(filesToDelete));

        fetch("/remove",
            {
                method:"DELETE",
                body:data
            }
        ).then(result=>{
            result.json().then(files=>{

              this.removeFileFirebase(files);

            })
        })

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

        fetch("/upload",{method:"POST",body:data}).then(response=>{

            response.json().then(files=>{
                
                files.forEach(file=>{

                    console.log(file);
                    this.addFileFirebase(file);

                })

            })

        })

    }

    resetIconsFile(){

        this.fileList.innerHTML = "";

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

    }

    addFileIcon(file){

        let fileInfoString = JSON.stringify(file);

        this.fileList.innerHTML += 
            `
            <li data-infoFile='${fileInfoString}'>
                <img class="img-file" src="/icons/${this.getFileIcon(file.mimetype)}">
                <span>${file.originalFilename}</span>
            </li>
            `;

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
            "video/quicktime":"mp4.png",
            "video/webm":"mp4.png",
            "video/ogg":"mp4.png",
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

    getFirebaseRef(){

        return firebase.database().ref("home");

    }

}