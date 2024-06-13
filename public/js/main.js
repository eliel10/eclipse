class Upload{

    constructor(){
        
        this.btnUploadFileEl = document.querySelector(".upload");
        this.inputUploadEl = document.querySelector(".file-upload");
        this.formUploadEl = document.querySelector(".input-upload-form");
        this.btnUploadMobileEl = document.querySelector(".mobile-btn-upload");
        this.upload_FileOptions = document.querySelector(".file-options-buttons");
        this.optionContentEl = document.querySelector(".option-content form");
        this.btnCancelOptions = this.upload_FileOptions.querySelector(".cancel");
        this.fileList = document.querySelector(".list-files");
        this.initEvents();

    }

    initEvents(){

        this.btnUploadFileEl.addEventListener("click",event=>{

            this.inputUploadEl.click();

        })

        this.inputUploadEl.addEventListener("change",event=>{

            let form = this.formUploadEl;

            this.uploadFile(form);

            form.reset();

            this.getFirebaseRef();

            this.toggleOptionsElement();

        })

        this.btnUploadMobileEl.addEventListener("click",event=>{

            this.toggleOptionsElement("_active_upload-option");

        })

        this.btnCancelOptions.addEventListener("click",event=>{

            this.toggleOptionsElement();

        })


        this.getFiles().forEach(file=>{

            file.addEventListener("click",event=>{

                this.selectFile(file);
                this.toggleOptionsElement("_active_file-option");

            })

        })

    }

    uploadFile(form){

        let data = new FormData(form);

        fetch("/upload",{method:"POST",body:data}).then(response=>{

            response.json().then(files=>{

                files.listFiles.forEach(file=>{

                    if(file.status == 200){

                    try{

                        this.addFileFirebase(file);
                        
                    }
                    catch(err){

                        alert(err);

                    }
                    
                }
                else{

                    alert("erro no upload");

                }

            })

            this.readFiles();

        })

        })

    }

    readFiles(){

        this.getFirebaseRef().on("value",snapshot=>{

            snapshot.forEach(file=>{
                
                let fileKey = file.key;
                let fileValue = file.val();

                this.addFileIcon(fileValue);

            })

        })

    
    }

    addFileIcon(file){

        this.fileList.innerHTML += 
            `
            <li>
                <img class="img-file" src="/icons/${this.getFileIcon(file.mimetype)}">
                <span>title.txt</span>
            </li>
            `;
    }

    getFileIcon(mimetype){

        let icon;

        switch(mimetype){

            case "image/jpeg":
                icon = "mp3.png";
                break;

            case "image/png":
                icon = "mp4.png";
                break;

            default:
                alert("icone não disponivel");
                return;
        }

        return icon;

    }


    addFileFirebase(file){

        this.getFirebaseRef().push().set(file);
    }

    selectFile(file){

        file.classList.add("active_li");

    }


    getFiles(){

        let files = this.fileList.querySelectorAll("li");

        return [...files];

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