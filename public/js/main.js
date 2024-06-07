class Upload{

    constructor(){
        
        this.btnUploadMobileEl = document.querySelector(".mobile-btn-upload");
        this.upload_FileOptions = document.querySelector(".file-options-buttons");
        this.optionContentEl = document.querySelector(".option-content form");
        this.btnCancelOptions = this.upload_FileOptions.querySelector(".cancel");
        this.fileList = document.querySelector(".list-files");
        this.initEvents();

    }

    initEvents(){

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

}