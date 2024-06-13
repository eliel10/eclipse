var express = require('express');
var router = express.Router();
var fs = require("fs");
var formidable = require("formidable");
var path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eclipse' });
});

router.post("/upload",(req,res)=>{

  let uploadFolder = path.join(__dirname,"..","upload");

  let form = new formidable.IncomingForm(
    {
      uploadDir:uploadFolder,
      keepExtensions:true
    }
  );

  if(!fs.existsSync(uploadFolder)){

    fs.mkdir(uploadFolder,err=>{

      if(err){

        return res.json({err});

      }

    });

  }

  form.parse(req,(err,fields,files)=>{

    if(err){

      return res.json({err});
      
    }
    else{

      let filesUpload = [...files.upload];

      let listFiles = [];

      filesUpload.forEach(file=>{

        let {filepath,newFilename,originalFilename,mimetype} = file;

        let propsFile = {
          filepath,
          newFilename,
          originalFilename,
          mimetype
        }

        listFiles.push(
          Object.assign(
            {},
            propsFile,
            isUploaded(uploadFolder.concat(`/${newFilename}`))
          ));


      })

      return res.json({listFiles});

    }

  })

})

function isUploaded(path){
  
  if(fs.existsSync(path)){
    
    return {msg:"uploaded success",status:200}

  }

  return {msg:"uploaded fail",status:500};

}

module.exports = router;
