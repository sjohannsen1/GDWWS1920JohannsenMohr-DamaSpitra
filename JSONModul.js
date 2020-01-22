
const fs= require("fs")
function lesen(path, callback){
    fs.readFile(path,(err, fileData)=>{
        if(err){
            return callback && callback(err)
        }
        try{
            let jsonDaten=JSON.parse(fileData)
            return callback && callback(null,jsonDaten)
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
const schreiben=(unformatString, path)=>{
    jsonString=JSON.stringify(unformatString)
    fs.writeFile(path,jsonString, err=>{
        if(err){
            console.log("Error writing file", err)
        } else{
            //console.log(jsonString)
            console.log("Datei erfolgreich beschrieben")
           
        }
    })
}

const schreibenSync=(unformatString, path)=>{
    return new Promise((resolve,reject)=>{
    jsonString=JSON.stringify(unformatString)
    fs.writeFile(path,jsonString, err=>{
        if(err){
            console.log("Error writing file", err)
            resolve(false)
        } else{
            //console.log(jsonString)
            resolve("Datei erfolgreich beschrieben",path)
           
        }
    })
})
}

module.exports={
    lesen,
    schreiben,
    schreibenSync,
   getData
    
}