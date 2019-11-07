//Variabeldefinitionen

const hoehsteBewertung=10
var aktBewertung=3
var mengeBewertung=4
var redo=0
var redoZufall=0
var neuBewertung=0
var sum=0
var bewertungen=[]
var nameBewertung
var arrayRatings=[]
var Rating=function(anz,bew,name,neuBewertung){
    this.anzahl=anz
    this.bewertung=neuBewertung
    this.name[anz-1]=name
    this.durchschnittBewertung=bew
}


//Eingabe und Ausgabe Möglich machen per Modul.
const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

//Aufgabe 1
const main=async()=>{
    console.log("Willkommen Frederik Leon Spitra, möchtest du ein wenig Tee für deinen Schnupfen?") //Ausgabe von meinem Namen
    console.log("Maximale Bewertung: "+hoehsteBewertung)
    a2()
    await bewerten()
    while(redo!=0){
        console.log("Versuchen Sie es erneut: ")
        await bewerten()
    }
    await zufBewertung()
    while(redoZufall!=0){
        console.log("Versuchen Sie es erneut: ")
        await zufBewertung()
    }

    rl.close()
}
//Aufgabe2
//Konstante Variablen (ein Paradoxon btw.) lassen sich nicht von anderer Stelle aus ändern.

const bewerten=()=>{
    return new Promise((resolve, reject)=>{
        rl.question('Bitte Bewerten: \t',function(answer){
            if(answer>hoehsteBewertung){
                console.log("Nur Bewertungen zwischen 0 und "+hoehsteBewertung+" zulaessig")
                redo++

            }else if(isNaN(answer)) {
                console.log("Bitte geben Sie nichts anderes außer Zahlen ein.")
                redo++
            }else{
                console.log("Vielen Dank :D")
                redo=0
                mengeBewertung++
                sum+=eval(answer)
                aktBewertung=bewertungBerechnen(mengeBewertung,sum)
                ausgabe(aktBewertung, mengeBewertung)
            }
         resolve()
        })
    })
}

//Aufgabe 3
const zufBewertung=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Anzahl an zu generierenden Bewertungen: \t', function(answer){
            if(!isNaN(answer)){
                for(let i=0; i<answer;i++){
                    neuBewertung=Math.round(Math.random()*(4)+1)
                    sum+=eval(neuBewertung)
                    mengeBewertung++
                    aktBewertung=bewertungBerechnen(mengeBewertung, sum)
                    ausgabe(aktBewertung, mengeBewertung)
                }
                redoZufall=0
            }else{
                console.log("Bitte nur Zahlen eingeben. Danke")
                redoZufall++

            }

         resolve()
         })
    })
}

//Aufgabe 4
var bewertungBerechnen=(anz, summe)=>{
    return (summe/anz)
}


//Aufgabe 5
const a2 =()=>{
    neuBewertung=2
    sum+=eval(neuBewertung)
    mengeBewertung++
    aktBewertung=bewertungBerechnen(mengeBewertung, sum)
    ausgabe(aktBewertung,mengeBewertung)
}

const ausgabe=(akt,anz)=>{
    console.log("Aktuelle Bewertung: "+akt.toFixed(2)+" Anzahl Bewertungen: "+anz)
}
//Aufgabenblatt 2. Alles noch ein wenig am Kämpfen.
var ratings= {anzahl:mengeBewertung, bewertung:aktBewertung, lastBew:neuBewertung, /*nameBewertung[0]:nameBewertung*/}
//Irgendwie spinnt hier alles.


const arrayEintragen=(anz, bew, name) =>{
    bewertungen[anz-1]=[bew, name]
    console.log(" Anzahl Bewertungen "+bewertungen.length+"\t letzte Bewertung: "+bew)

    const objEintragen=(anz,bew,name,akt) =>{
        let ratings= {
        anzahl:anz,
        bewertung:akt,
        last:bew,
        name: name
    }

    arrayRatings.push(ratings)

        //ratings.nameBewertung[anz-1]=name //ka ob das so geht
        console.log('Druchschniit der Bewertung '+akt);
    }

var bewertungBerechnen=(anz, summe)=> (summe/anz)

const benennen=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Bitte Bewertung benennen: ', function(answer){
            nameBewertung=answer
            resolve()
        })
    })
}

main();


//Alles in allem, gibt es da noch ein paar Verstädnissprobleme, und ich sollte das alles nocheinmal in Ruhe aufarbeiten, sobald ich kann.
