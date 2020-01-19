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
const userArray=[]

const recipes=[
  {title:"courgette carbonara",
     id:1},  
  {title:"Brussels sprouts",
    id:2},
  {title:"Roasted black bean burgers",
    id:3},
  {title:"Chicken & tofu noodle soup",
    id:4},
  {title:"Tuna fettuccine",
    id:5}
  ]
const recipepaths=[
  "./Recipes/Recipe1.json",
  "./Recipes/Recipe2.json",
  "./Recipes/Recipe3.json",
  "./Recipes/Recipe4.json",
  "./Recipes/Recipe5.json"
]

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 
/* Vermutlich nicht nötig, da edamam auch komplette rezeptfiles analysiert
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
*/

const rezeptWahl=(recipe)=>{
 //todo: implementieren: get mit rezept id suchtpassendes rezept aus path array (recipepaths) also: recipepaths[id+1]

}

const rezeptPresent=(recipeList)=>{
  console.log(recipeList) //vllt auch einfach globale variable nutzen, array wird ja nicht verändert
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
        let benutzer={}
        benutzer.id=userArray.length+1 //so fortlaufend
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

                        rl.question('Aktivitätslevel (ganzzahlig von 0 (keine Aktivität) bis 4 (sehr Aktiv)): \n', function(activitaet){
                            switch(activitaet){
                              case 0: benutzer.activity=1.2 
                                      break
                              case 1: benutzer.activity=1.5
                                      break
                              case 2: benutzer.activity=1.7
                                      break
                              case 3: benutzer.activity=1.9
                                      break
                              case 4: benutzer.activity=2.3
                                       }
                            
                            userArray[benutzer.id-1]=benutzer 
                            resolve(benutzer.id)
                        })
                    })
                })
            })
         })
    })
}
//errechnet Bedarfwerte des Nutzers, getestet und funktioniert
const bedarfNutzer=(userId)=>{
    return new Promise((resolve, reject)=>{
      let weight=userArray[userId-1].weight
      let height=userArray[userId-1].height
      let activity=userArray[userId-1].activity
      let age=userArray[userId-1].age
      let sex=userArray[userId-1].sex
       // userArray[userId-1].bedarf=reqTools.bedarfErrechnen(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        /*userArray[userId-1].bedarf.kcal=reqTools.calBedarf(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        userArray[userId-1].bedarf.fett=reqTools.fatBedarf(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        userArray[userId-1].bedarf.gesFett=reqTools.maxSatFat(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        userArray[userId-1].bedarf.ungesFett=reqTools.fatBedarf(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        userArray[userId-1].bedarf.protein=reqTools.proBedarf(userArray[userId-1].gewicht, userArray[userId-1].alter) 
        userArray[userId-1].bedarf.carbs=reqTools.carbBedarf(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
        userArray[userId-1].bedarf.zucker=reqTools.maxSugar(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
       */ 
      //userArray[userId-1].bedarf=reqTools.test(userArray[userId-1].groesse, userArray[userId-1].gewicht, userArray[userId-1].geschlecht, userArray[userId-1].activity, userArray[userId-1].alter)
      let bedarf={}
      if(sex=="m")
         bedarf.kcal=66.47+(13.7*weight)+(5*height)-(6.8*age)*(activity) 
      else
        bedarf.kcal=655.1+(9.6*weight)+(1.8*height)-(4.7*age)*(activity)
     
       if(userArray[userId-1].age < 65)
        bedarf.protein= userArray[userId-1].weight*0.8 
      else
        bedarf.protein= userArray[userId-1].weight
      
      bedarf.fett=bedarf.kcal*0.3/9.3
      bedarf.gesFett=bedarf.fett*0.1
      bedarf.ungesFett=bedarf.fett-bedarf.gesFett
      bedarf.carbs=(bedarf.kcal-bedarf.fett*9.3-bedarf.protein*4.1)/4.1
      bedarf.zucker=bedarf.carbs*0.1
      userArray[userId-1].erreichtBedarf={
          kcal:0,
          protein:0,
          fett:0,
          gesFett:0,
          ungesFett:0,
          carbs:0,
          zucker:0
        }
      
        userArray[userId-1].bedarf=bedarf
        resolve(userArray[userId-1])
    })
}

const rezeptAnEdamam=(rezept)=>{
  return new Promise((resolve, reject)=>{
    unirest.post('https://api.edamam.com/api/nutrition-details?app_id='+app_id+'&app_key='+app_key)
    .header("Content-Type", "application/json")//WILL NICHT FUNKTIONIEREN
    .attach('file', rezept)
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
//relikt aus POC, vermutlich nicht mehr notwendig
/*const ausgabeCals=async(result)=>{
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
*/

//errechnet wie viel Prozent der Nährwertvorgaben erreicht wurden
const reachedNut=(result,userId)=>{
  return new Promise((resolve,reject)=>{
  let user=userArray[userId-1]
  let reached=new Object()
  if (typeof result === "object"){
    if(!_.isEmpty(result.totalNutrients.ENERC_KCAL))
      reached.kcal=user.erreichtBedarf.kcal+(result.totalNutrients.ENERC_KCAL.quantity/user.bedarf.kcal)*100
    else
      reached.kcal=user.erreichtBedarf.kcal
    if(!_.isEmpty(result.totalNutrients.PROCNT))
      reached.protein=user.erreichtBedarf.protein+(result.totalNutrients.PROCNT.quantity/user.bedarf.protein)*100
    else
      reached.protein=user.erreichtBedarf.protein
    if(!_.isEmpty(result.totalNutrients.FAT))
      reached.fett=user.erreichtBedarf.fett+(result.totalNutrients.FAT.quantity/user.bedarf.fett)*100
    else
      reached.fett=user.erreichtBedarf.fett
    if(!_.isEmpty(result.totalNutrients.FASAT))
      reached.gesFett=user.erreichtBedarf.gesFett+(result.totalNutrients.FASAT.quantity/user.bedarf.gesFett)*100
    else
      reached.gesFett=user.erreichtBedarf.gesFett
    if(!_.isEmpty(result.totalNutrients.FAMS) && !_.isEmpty(result.totalNutrients.FAPU))
      reached.ungesFett=user.erreichtBedarf.ungesFett+((result.totalNutrients.FAMS.quantity+result.totalNutrients.FAPU.quantity)/user.bedarf.ungesFett)*100
    else 
      reached.ungesFett=user.erreichtBedarf.ungesFett
    if(!_.isEmpty(result.totalNutrients.CHOCDF))
      reached.carbs=user.erreichtBedarf.carbs+(result.totalNutrients.CHOCDF.quantity/user.bedarf.carbs)*100
    else
      reached.carbs=user.erreichtBedarf.carbs
    if(!_.isEmpty(result.totalNutrients.SUGAR))
      reached.zucker=user.erreichtBedarf.zucker+(result.totalNutrients.SUGAR.quantity/user.bedarf.zucker)*100
    else
      reached.zucker=user.erreichtBedarf.zucker
    user.erreichtBedarf=reached
    
  }else{
      console.log("an error occurred")
      
     }
     userArray[userId-1]=user
     resolve(userId)
  })
}
const main=async()=>{ 
  let aktNutzer//nur zum testen
  await eingabeNutzer().then(user=>bedarfNutzer(user)).then(function(user){
    console.log(user)
    aktNutzer=user.id})

  /*await eingabe().then(foodQuery=>anfrage(foodQuery)).then(result=>reachedNut(result, aktNutzer).then(function(id){
    aktNutzer=id
    console.log(userArray[id-1])
  }))*/

 //rezeptPresent()
 //await rezeptAnEdamam("./Recipes/Recipe1.json").then(function(res){console.log(res) })
  rl.close()
  }
main()

module.exports={
  //add exporte
}