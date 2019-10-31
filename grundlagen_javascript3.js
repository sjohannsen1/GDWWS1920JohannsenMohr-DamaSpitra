const JSONtools= require("./grundlagen_javascript3_modul.js")
const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

const cities="cities.json"
const testen="testen.json"
const user="user.json"
var arrayErgebnis=[]

const kombinieren=()=>{  
    return new Promise((resolve, reject)=>{
        JSONtools.lesen(user, (err, benutzer)=>
        { 
            if(err){
                console.log('Error: ',err)
                reject(err)
            }
            
            for(let i=0; i<benutzer.user.length;i++){
                JSONtools.suche(cities, benutzer.user[i].user_wohnort, (treffer)=>{
                //arrayErgebnis[i]=treffer//+benutzer.user[i]
                JSONtools.stadtHinzu(cities,testen,benutzer.user[i])//ansatz um an JSONfile zu konkatenieren, cities müssen durch testen ersetzt werden
                //console.log(arrayErgebnis[i])//todo: schreibt nur "" in JSON file ?????
                }) 
            }
           //console.log(arrayErgebnis[0])
           // JSONtools.schreiben(JSON.stringify(arrayErgebnis.toString()),testen)
            resolve(arrayErgebnis)      
        })
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
    kombinieren().then(function(arrayE){
        JSONtools.schreiben(JSON.stringify(arrayE.toString()),testen)
    }, function(err){
        console.log(err)
    })
    rl.close()
}
main()