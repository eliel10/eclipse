var express = require('express');
var router = express.Router();
var fs = require("node:fs/promises")
var formidable = require("formidable");
var path = require("path");
const { info } = require('console');
const { access } = require('node:fs');

let uploadFolder = path.join(__dirname,"..","upload");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eclipse' });
});

router.post("/upload",async(req,res)=>{

  await createFolderToUpload(uploadFolder);

  let form = new formidable.IncomingForm(
    {
      uploadDir:uploadFolder,
      keepExtensions:true,
      maxFileSize:1024 * 1024 * 10
    }
  );

    form.parse(req,(err,fields,files)=>{

      if(err){
  
        if(err.code == 1009){

          return res.json({msg:"arquivo muito grande"});

        }

        return res.json({msg:err});
        
      }
      else{
  
        let filesUpload = [...files.upload];
  
        let listFiles = [];
  
        filesUpload.forEach(async file=>{
  
          let {filepath,newFilename,originalFilename,mimetype} = file;
  
          let propsFile = {
            filepath,
            newFilename,
            originalFilename,
            mimetype
          }
  
          let infoFile = isUploaded(uploadFolder.concat(`/${newFilename}`));

          listFiles.push(
            Object.assign(
              {},
              propsFile,
              infoFile
            ));
  
        })

        return res.json(listFiles);
      }
  
    })
 
})

router.delete("/remove",(req,res)=>{

    let form = new formidable.IncomingForm();

    form.parse(req,async(err,fields,files)=>{

      if(err) res.json({Errir:err});

      let filesToDelete = fields.files;

      let infoDeleteFiles = await deleteFiles(filesToDelete,uploadFolder);

      return res.json(infoDeleteFiles);
      
    })

})

async function createFolderToUpload(uploadFolder){

  try{

    await fs.access(uploadFolder);

  }
  catch(err){
    
    await fs.mkdir(uploadFolder);

  }


}

async function deleteFiles(files,uploadFolder){

  let infoErrorFile = [];
  let infoSuccessFile = [];

  files = JSON.parse(files);

  for(let file of files){

    try{

     await fs.rm(uploadFolder.concat(`/${file.newFilename}`));

     infoSuccessFile.push(
      {
        msgSuccess:"removed",
        fileSuccess:file
      }
      )

    }
    catch(err){
      
      infoErrorFile.push(
        {
          msgError:err,
          fileError:file
        }
        );

    }
    

  }

  return {infoErrorFile,infoSuccessFile};

}

function isUploaded(path){

  try{

    fs.access(path);

    return {msg:"uploaded success",status:200}

  }
  catch(err){

    return {msg:`uploaded fail: ${err}`,status:500};

  }


}

module.exports = router;



