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

    uploadFile(form){

        let data = new FormData(form);

        fetch("/upload",{method:"POST",body:data}).then(response=>{
            response.json().then(value=>{
                alert(value.status);
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

            this.getFirebaseRef();

        })

        this.btnUploadMobileEl.addEventListener("click",event=>{

            this.toggleOptionsElement("_active_upload-option");

        })

        this.btnCancelOptions.addEventListener("click",event=>{

            this.toggleOptionsElement("cancel");

        })


        this.getFiles().forEach(file=>{

            file.addEventListener("click",event=>{

                this.selectFile(file);
                this.toggleOptionsElement("_active_file-option");

            })

        })

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

            case "cancel":
                this.upload_FileOptions.className = "file-options-buttons";
                this.optionContentEl.classList.remove("_disabled");
                return;

            default:
                return false;

        }

        this.upload_FileOptions.classList.add(classEl);
        this.upload_FileOptions.classList.remove(classElToRemove);
        this.optionContentEl.classList.add("_disabled");

    }

    getFirebaseRef(){

        return firebase.database().ref("home");

    }

}