const JSONtools= require("./grundlagen_javascript3_modul.js")
const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

const cities="cities.json"
const testen="testen.json"
const user="user.json"
//var arrayErgebnis=[]

const kombinieren=()=>{  
    return new Promise((resolve, reject)=>{
        JSONtools.lesen(user, (err, benutzer)=>
        { 
            if(err){
                console.log('Error: ',err)
                reject(err)
            }
            var arrayErgebnis=[]
            for(let i=0; i<benutzer.user.length;i++){
                JSONtools.suche(cities, benutzer.user[i].user_wohnort, (treffer)=>{
                arrayErgebnis.push([treffer,benutzer.user[i]])
                //console.log(arrayErgebnis[0])
                //JSONtools.stringHinzu(testen, testen, arrayErgebnis[i])
                //ansatz um an JSONfile zu konkatenieren, cities müssen durch testen ersetzt werden
                //JSONtools.stadtHinzu(cities, testen, JSON.stringify(treffer+benutzer.user[i]))
                //console.log(arrayErgebnis[i])//todo: schreibt nur "" in JSON file ?????
              
                }) 
            }
            arrayErgebnis.push("hallo")
            resolve(arrayErgebnis)      
        })
    })
}


const kombinieren2=()=>{  
    return new Promise((resolve, reject)=>{
        /*JSONtools.lesen(user, (err, benutzer)=>
        { 
            if(err){
                console.log('Error: ',err)
                reject(err)
            }
            */
            resolve(JSONtools.getData(cities),JSONtools.getData(user))//benutzer)        
       // })
        
    })
}
const suchenUndLoeschen=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Bitte den Suchbegriff eingeben ', function(answer){
            JSONtools.loeschenSuche(cities,testen,answer)
            resolve()
        })
    })
}
const stadtHinzufuegen=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Bitte Stadtdaten eingeben ', function(answer){
            JSONtools.stadtHinzu(cities,testen, answer)
            resolve()
        })
    })
}
const main=async()=>{
    //await suchenUndLoeschen()
    //await stadtHinzufuegen() //TODO: formatierung des Hinzugefügten fixen
   //await kombinieren()
   /* kombinieren().then(function(arrayE){
        JSONtools.schreiben(JSON.stringify(arrayE.toString()),testen)
    }, function(err){
        console.log(err)
    })*/
    //wie kombinieren2 nur mit zwei thens
    kombinieren2()/*.then(function(nutzer){
        console.log("vor lesen"+nutzer.user[1].user_wohnort)
        
       //JSONtools.lesen(cities, (staedte) => {
           //console.log("in lesen"+staedte.cities.toString)
            
        //})
      return(JSONtools.getData(cities),nutzer)
    },function(err){
        console.log(err)
    })*/
    .then(function(staedte, nutzer){
        let arrayErgebnis=[]
        console.log("in 2. then "+nutzer)
        console.log("in 2. then "+staedte)
        /*nutzer.user.forEach(person => {
            staedte.cities.forEach(stadt=>{
                if(person.user_wohnort==stadt.stadt_name)
                    arrayErgebnis.push([stadt,person])
                
            })
            
          //Aus dem Workshop: Foreach ist blöd, lösung unpraktisch
            
        })*/
        return arrayErgebnis
    }, function(err){
        console.log(err)
    })
    .then(function(arrayE){
        JSONtools.schreiben(JSON.stringify(arrayE.toString()),testen)
    }, function(err){
        console.log(err)
    })
    
    rl.close()
}
main()