const maxBewertung=5
var redo=0
var redoZufall=0
var anzBewertung=0
var aktBewertung=0
var neuBewertung=0
var sum=0
const readline=require('readline')
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})  //User input über stdin ermöglichen
const ausgabe=(akt,anz)=>{
    console.log("Aktuelle Bewertung: "+akt+" Anzahl Bewertungen: "+anz)
}
const a2 =()=>{
    neuBewertung=2
    //sum+=neuBewertung
    sum=Math.add(sum, neuBewertung)
    anzBewertung++
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
                    //sum=sum+neuBewertung
                    sum=Math.add(sum, neuBewertung)
                    console.log(sum)
                    anzBewertung++
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
                //sum=sum+answer
                sum=Math.add(sum, answer)
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






