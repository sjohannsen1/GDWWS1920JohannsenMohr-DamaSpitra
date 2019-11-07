const maxBewertung=5
var bewertungen=[]
var redo=0
var redoZufall=0
var anzBewertung=0
var aktBewertung=0
var neuBewertung=0
var sum=0
var nameBewertung
var Rating=function(anz,bew,name){
    this.anzahl=anz
    this.bewertung=bew
    this.name[anz-1]=name
    this.durchschnittBewertung=durchschnittBew
}
//Aufgabe5
/*const hello = 'hello'
function world() {
    const world = 'world';
    console.log(''+hello +world);
}*/ //Tests auf lokaler Ebende Try + Error




const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})  //User input über stdin ermöglichen

const ausgabe=(akt,anz)=>{
    console.log("Aktuelle Bewertung: "+akt.toFixed(2)+" Anzahl Bewertungen: "+anz)
}

const arrayEintragen=(anz, bew, name) =>{
    bewertungen[anz-1]=[bew, name]
    console.log(" Anzahl Bewertungen "+bewertungen.length+"\t letzte Bewertung: "+bew)
   
}

/*const objEintragen=(anz,bew,name) =>{
    let ratings=new Rating(name,bew,anz)
    console.log("Name Bewertung "+name)
    this.durchschnittBew= function int (){
        return this.bew / this.anz; // A2 Aufgabe3 Ist das mit "Der Druschnistt 'EINER' Bewertung" gemeint? 
    }
    //this.durchschnittBew=()=>(this.bew / this.anz); A2 Aufgabe4: Arrowfunction
    console.log('Druchschniit der Bewertung '+durchschnittBew);
}*/


const a2 =()=>{
    neuBewertung=2
    anzBewertung++
    nameBewertung="aufgabe1"
    //objEintragen(anzBewertung,neuBewertung,nameBewertung)
    arrayEintragen(anzBewertung,neuBewertung,nameBewertung)
    sum+=eval(neuBewertung)
    aktBewertung=bewertungBerechnen(anzBewertung, sum)
    ausgabe(aktBewertung,anzBewertung)
}

var bewertungBerechnen=(anz, summe)=>{
    return (summe/anz)
}

const zufallsBewertung=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Anzahl an zu generierenden Bewertungen: \t', function(answer){
            if(!isNaN(answer)){
                for(let i=0; i<answer;i++){
                    neuBewertung=Math.round(Math.random()*(4)+1)
                    sum+=eval(neuBewertung)
                    anzBewertung++
                    nameBewertung="Zufaellige Bewertung "+(i+1)
                    //objEintragen(anzBewertung,neuBewertung,nameBewertung)
                    arrayEintragen(anzBewertung, neuBewertung, nameBewertung)
                    aktBewertung=bewertungBerechnen(anzBewertung, sum)
                    ausgabe(aktBewertung, anzBewertung)  
                }
                redoZufall=0
            }else{
                console.log("Nur Zahlen zulässig")
                redoZufall++
                
            }
        
         resolve()
         })
    })
}

const benennen=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Bitte Bewertung benennen: ', function(answer){
            nameBewertung=answer
            resolve()
        })
    })
}

//maxBewertung=8 -> Gibt Compilerfehler, da Konstant
//anzBewertung="Hallo" aus der Variable vom Typ Int wird eine Variable vom Typ String
const bewerten=()=>{
    return new Promise((resolve, reject)=>{
        rl.question('Bitte Bewerten: \t',function(answer){
            if(answer>maxBewertung){
                console.log("Nur Bewertungen zwischen 0 und "+maxBewertung+" zulaessig")
                redo++
                
            }else if(isNaN(answer)){
                console.log("Nur Zahlen zulaessig")
                redo++
            }else {
                console.log("Danke fuer die Bewertung")
                redo=0
                anzBewertung++
                //objEintragen(anzBewertung,neuBewertung,nameBewertung)
                arrayEintragen(anzBewertung, answer, nameBewertung)
                sum+=eval(answer) //Fehler war das answer ein string war und so die gesamte variable zu einem String wurde
                aktBewertung=bewertungBerechnen(anzBewertung,sum)
                ausgabe(aktBewertung, anzBewertung)
              
            }
         resolve()
        })
    })
}

const main=async()=>{
    console.log("Hallo Sophia") //Ausgabe von Hallo Sophia auf der Konsole
    console.log("Maximale Bewertung: "+maxBewertung)
    a2()
    await benennen()
    await bewerten()
    while(redo!=0){
        console.log("Versuchen Sie es erneut: ")
        await bewerten()
    }
   
    await zufallsBewertung()
    while(redoZufall!=0){
        console.log("Versuchen Sie es erneut: ")
        await zufallsBewertung()
    }
    
    rl.close()
}
main();






