const unirest = require('unirest') //..\\GDWWS1920JohannsenMohr-DamaSpitra\\Abgabe 12.12\\node_modules\\
const _ = require('underscore') 

const readline=require('readline')
const reqTools= require("./bedarfModul.js")
const JSONtools=require("./JSONModul.js")
const fs=require('fs')
const app_id="d583615a"
const app_id2="13242f" //falsche app_id zum testen von fallbacks bzgl status code 400-500
const app_key="360dfcc569d8706ce6255d3595c6cd68"
var params, query,foodQuery,esc
//var recipepaths,recipes=[] //Woher die rezepte?

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 

const rezepteReinBrute=(paths)=>{ //Läuft auch nicht
  return new Promise((resolve, reject)=>{
    let recipes=new Array()
    paths.forEach(elem=>recipes.push(fs.readFileSync(elem)))
     resolve(recipes)
  })
}
const rezepteLesen=(recipepaths,recipes)=>{
  return new Promise((resolve, reject)=>{
  if(recipepaths.length>0)
  JSONtools.lesen(recipepaths.shift(),function(x,string){ //Problem: funktion kennt recipes nicht.
    
  })
  else 
    resolve(recipes)
})
}



const rezeptPresent=(recipeArray)=>{
  return new Promise((resolve, reject)=>{
    for(let i=0;i++;i<recipeArray.length){
      console.log(i+":")
      console.log(recipeArray[i])
    }
    resolve()//Auswahl ermöglichen
  })
}
//Fordert user zur eingabe einer Zutat. Formatiert diese und return dies
const eingabe=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Zutaten eingeben: ', function(foodStr){

                var ingredients = new Array();
                ingredients.push(foodStr);
                console.log(foodStr)
                params = {
                  ingr: ingredients,
            
                };
            
                esc = encodeURIComponent;
                query = Object.keys(params)
                  .map(k => esc(k) + '=' + esc(params[k]))
                  .join('&');
            
                foodQuery = query.replace(/%20/g, "+");
 
              
            
         resolve(foodQuery)
         })
    })
}
//TODO: funktion sichern (fehlerhafte Eingaben abfangen), vielleicht in eigene Promises aufsplitten, dann mit then verknüpfen
const eingabeNutzer=()=>{
    return new Promise((resolve,reject)=>{
        benutzer={}
        benutzer.id=1 //fortlaufend (???)
        rl.question('Alter Eingeben \t', function(age){
            benutzer.alter=age
            rl.question('Groesse eingeben (in cm) \t', function(height){
                benutzer.groesse=height
                rl.question('Gewicht eingeben (in kg) \t', function(weight){
                    benutzer.gewicht=weight
                    rl.question('Geschlecht eingeben (m für männlich, w für weiblich) \t', function(sex){
                        
                        if(sex=="m"||sex=="w"){
                            benutzer.geschlecht=sex
                        }
                        else benutzer.geschlecht="m"
                        // reject("Invalid Argument")

                        rl.question('Aktivitätslevel eingeben: \n keine Aktivität = 1.2 \n kaum Aktivität = 1.5 \n mäßige Aktivität = 1.7 \n Aktiv = 1.9 \n sehr Aktiv = 2.3 \n', function(activitaet){
                            benutzer.activity=activitaet
                            resolve(benutzer)
                        })
                    })
                })
            })
         })
    })
}
//errechnet Bedarfwerte des Nutzers, getestet und funktioniert
const bedarfNutzer=(user)=>{
    return new Promise((resolve, reject)=>{
        bedarf=new Object()
        bedarf.kcal=reqTools.calBedarf(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        bedarf.fett=reqTools.fatBedarf(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        bedarf.gesFett=reqTools.maxSatFat(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        bedarf.ungesFett=reqTools.fatBedarf(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)-reqTools.maxSatFat(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        bedarf.protein=reqTools.proBedarf(user.gewicht, user.alter) 
        bedarf.carbs=reqTools.carbBedarf(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        bedarf.zucker=reqTools.maxSugar(user.groesse, user.gewicht, user.geschlecht, user.activity, user.alter)
        user.bedarf=bedarf
        resolve(user)
    })
}

const rezeptAnEdamam=(rezept)=>{
  return new Promise((resolve, reject)=>{
    unirest.post('https://api.edamam.com/api/nutrition-details?app_id='+app_id+'&app_key='+app_key)
    .headers({'Content-Type': 'application/json'})//WILL NICHT FUNKTIONIEREN
    .attach('file', './Recipes/Recipe1.json')
    .end(function (result) {
      resolve(result.body)
  })
  

})
}
//Fehlermenu, ermöglicht dem User die wahl zwischen einem Weiteren Versuch oder dem Programmabbruch
const menu=(result1)=>{
 return new Promise((resolve,reject)=>{
    rl.question('1: Nochmal versuchen \n2: Abort \nEingabe: ', function(answer){
      if(answer==1){
        console.log("retrying \n")
        if(typeof result1 === "boolean"){
          eingabe().then(query=>anfrage(query)).then(res=>ausgabeCals(res)).then(function(){ rl.close()}) //wiederholt alles
        
        }
        else{
          anfrage(result1).then(result=>ausgabeCals(result)).then(function(){ rl.close()}) //wiederholt alles bis auf die eingabe
        }
      }
      else if(answer==2){
        console.log("fatal error occured, please try again later") 
        resolve(false)
        
      }
      else{
        console.log("invalid argument, aborted") //falls die eingabe weder 1 noch 2 ist
        resolve()
      }
  })
  })
}

//schickt die formatierte Suchquery und schickt diese an die API, falls der StatusCode der Rückgabe einen Fehler indiziert, wird dieser
// in entsprechenden fallbacks behandelt
const anfrage=(foodQuery)=>{
  return new Promise((resolve,reject)=>{
    unirest.get('https://api.edamam.com/api/nutrition-data?app_id='+app_id+'&app_key='+app_key+'&'+foodQuery)
    .end(function (result) {
      if(result.statusCode>299){ //error fallbacks
        if(result.statusCode<400){
          console.log("a redirection error occurred. HTTP error code:  "+ result.statusCode)
          console.log("Please check your connection")
          resolve(true)
        }else if(result.statusCode<500){
          console.log("connection could not be established. HTTP error code: "+ result.statusCode)
          console.log("please check application id and/or application key ")
          resolve(true)
        }else if(result.statusCode>=500){
          console.log("server unavailable. HTTP error code:  "+ result.statusCode)
          resolve(foodQuery) //da der fehler am server liegt ist eine erneute sucheingabe nicht nötig, foodQuery wird übergeben
        } 
      }else if(!_.isEmpty(result.body.totalNutrients)){ //Wenns in der If-Abfrage ist lief alles gut
          resolve(result.body)
      }else { //fallback falls eingabe invalid ist
          console.log("invalid argument")
          resolve(false) //sagt dem then dass eine neue eingabe nötig ist
          
           
      }
   })
  })
}

const ausgabeCals=async(result)=>{
if(typeof result ==="boolean" && result){ 
    return
  }else if (typeof result === "object"){
  console.log("total calories: "+result.totalNutrients.ENERC_KCAL.quantity+" kcal")
  console.log("total protein: "+result.totalNutrients.PROCNT.quantity+" g \t \t"+`totalling ${result.totalNutrientsKCal.PROCNT_KCAL.quantity} ${result.totalNutrientsKCal.PROCNT_KCAL.label}`)
  console.log("total fat: "+result.totalNutrients.FAT.quantity+" g \t \t "+`totalling ${result.totalNutrientsKCal.FAT_KCAL.quantity} ${result.totalNutrientsKCal.FAT_KCAL.label}`)
  if(typeof result.totalNutrients.FASAT !== "undefined")
  console.log("of which saturated fat: "+result.totalNutrients.FASAT.quantity+" g")
  if(typeof result.totalNutrients.FAMS !== "undefined" && typeof result.totalNutrients.FAPU !== "undefined")
  console.log("and unsaturated fat: "+(result.totalNutrients.FAMS.quantity+result.totalNutrients.FAPU.quantity)+" g")
  console.log("total carbohydrates: "+result.totalNutrients.CHOCDF.quantity+" g \t"+`totalling ${result.totalNutrientsKCal.CHOCDF_KCAL.quantity} ${result.totalNutrientsKCal.CHOCDF_KCAL.label}`)  
  if(typeof result.totalNutrients.SUGAR !== "undefined")
  console.log("of which sugars: "+result.totalNutrients.SUGAR.quantity+" g")
}else{
    await menu(result) //es ist ein fehler passiert und dem User wird das Fehlermenu angezeigt
   }
}
const main=async()=>{ 
  //await eingabe().then(foodQuery=>anfrage(foodQuery)).then(result=>ausgabeCals(result))
  //await eingabeNutzer().then(user=>bedarfNutzer(user)).then(function(user){console.log(user) })
  //console.log(rezepteLesen(["./Recipes/Recipe1.json"]))
  
 //rezepteReinBrute(["./Recipes/Recipe1.json","./Recipes/Recipe2.json"],new Array()).then(recipes=>function(recipes){ console.log(recipes)})
  await rezeptAnEdamam("./Recipes/Recipe1.json").then(function(res){
    console.log(res)
  })
  rl.close()
  }
main()

