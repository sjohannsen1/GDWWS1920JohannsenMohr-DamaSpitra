
const fs= require("fs")
function lesen(path, callback){
    fs.readFile(path,(err, fileData)=>{
        if(err){
            return callback && callback(err)
        }
        try{
            let jsonDaten=JSON.parse(fileData)
            return callback && callback(null, jsonDaten)
        } catch(err){
            return callback && callback(err)
        }
    })
}

const getData=(path)=>{
    fs.readFile(path,(err, fileData)=>{
        if(err){
            return err
        }
        try{
            let jsonDaten=JSON.parse(fileData)
            return jsonDaten
        } catch(err){
            return err
        }
    })
}
const schreiben=(jsonString, path)=>{
    fs.writeFile(path,jsonString, err=>{
        if(err){
            console.log("Error writing file", err)
        } else{
            console.log(jsonString)
            console.log("Datei erfolgreich beschrieben")
        }
    })
}

module.exports={
    lesen,
    schreiben,
   getData
    
}