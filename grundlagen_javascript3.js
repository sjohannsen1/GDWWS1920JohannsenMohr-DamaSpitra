const JSONtools= require("./grundlagen_javascript3_modul.js")
const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

const cities="cities.json"
const testen="testen.json"
const user="user.json"
var arrayErgebnis
const kombinieren=()=>{  
    return new Promise((resolve, reject)=>{
        JSONtools.lesen(user, (err, benutzer)=>
        { 
            if(err){
                console.log('Error: ',err)
                return
            }
            for(let i=0; i<benutzer.user.length;i++){
                JSONtools.suche(cities, benutzer.user[i], (treffer)=>
                arrayErgebnis[i]=benutzer.user[i]+treffer //todo: schreibt nur undefined in json file, testen+debuggen!
                )
                JSONtools.schreiben(JSON.stringify(arrayErgebnis),testen)
            }      
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
    await kombinieren()
    //rl.close()
}
main()