
/*const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})  //User input über stdin ermöglichen
const sucheName=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Bitte Suchbegriff: ', function(answer){
            //suchBegriff=answer
            resolve(answer)
        })
    })
}*/

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


const loeschenSuche=(pathIn, pathOut,suchBegriff)=>{
    lesen(pathIn, (err, staedte)=>
    { 
        if(err){
            console.log('Error: ',err)
            return
        }
        for(let i=0; i<staedte.cities.length;i++){
            
            if(suchBegriff==staedte.cities[i].stadt_name){
                    staedte.cities.splice(i,1)
                    schreiben(JSON.stringify(staedte.cities, null, 2), pathOut)
            }
        }      
    })
}
const suche=(path,suchBegriff, callback)=>{
    lesen(path, (err, staedte)=>
    { 
        if(err){
            console.log('Error: ',err)
            return
        }
        for(let i=0; i<staedte.cities.length;i++){
            
            if(suchBegriff==staedte.cities[i].stadt_name){
                    callback(staedte.cities[i])
            }
        }      
    })
}
const stadtHinzu=(pathIn, pathOut, stadtInfos)=>
{
    lesen(pathIn, (err, staedte)=>{
        if(err){console.log("Error: ", err); return}
        staedte.cities.push(/*[staedte.cities.length]=*/stadtInfos)
        schreiben(JSON.stringify(staedte.cities,null, 2),pathOut)
    })
}
const stringHinzu=(pathIn, pathOut, aString)=>
{
    //schreiben(aString, pathOut)
    lesen(pathIn, (err, data)=>{
        if(err){console.log("Error: ", err); return}
        //data.users.push(aString)
        data.users[data.length]=aString
        schreiben(JSON.stringify(data.users,null, 2),pathOut)
    })
}


module.exports={
    stadtHinzu,
    loeschenSuche,
    suche,
    lesen,
    schreiben,
    stringHinzu
    
}



/*fs.readFile("cities.json", "utf8", (err,jsonString)=>
{
    if(err){
        console.log("File read failed:", err)
        return
    }
    try{
        let jsonDaten=JSON.parse(jsonString)
        for(let i=0; i<jsonDaten.cities.length;i++){
            let staedte=jsonDaten.cities[i]
            console.log(staedte.stadt_name)
        }
        //console.log("Stadtname ist:", stadt.cities)
    } catch(err){
        console.log("Error parsing JSON string:", err)
    }
    //console.log("File data:", jsonString) //Printed einfach die komplette json file
}) */
//const main=async()=>{}
/*rl.question('Bitte Suchbegriff eingeben: ', function(answer){
    //suchBegriff=answer
    loeschenSuche('./cities.json', answer)
    rl.close()   
})*/



