const unirest = require('unirest') //..\\GDWWS1920JohannsenMohr-DamaSpitra\\Abgabe 12.12\\node_modules\\
const _ = require('underscore') 
const express = require('express')
const readline=require('readline')
const joi = require('@hapi/joi') //zur validation von kpd
const reqTools= require("./bedarfModul.js")
const JSONtools=require("./JSONModul.js")
const app = express()
app.use(express.json())
const app_id="d583615a"
const app_id2="13242f" //falsche app_id zum testen von fallbacks bzgl status code 400-500
const app_key="360dfcc569d8706ce6255d3595c6cd68"
var params, query,foodQuery,esc
var userArray
var pathData="userData.json"



const einlesen=(path)=>{ 
  return new Promise((resolve,reject)=>
  {JSONtools.lesen(path, function(x,data){
    resolve(data)
  })
  })
  }


const recipes=[
  {title:"Courgette carbonara",
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

const rezeptWahl=(id)=>{
    return new Promise((resolve,reject)=>{
        resolve(recipepaths[id-1])
    })
 //todo: implementieren: get mit rezept id suchtpassendes rezept aus path array (recipepaths) also: recipepaths[id-1]

}

const rezeptPresent=(recipepath)=>{
    return new Promise((resolve,reject)=>{
    JSONtools.lesen(recipepath, function(x,res){
        resolve(res)
    })
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
//TODO: nur zum testen
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
                            
                          switch(parseInt(activitaet)){
                              case 0: benutzer.activity=1.2 
                                      break
                              case 1: benutzer.activity=1.5
                                      break
                              case 2: benutzer.activity=1.7
                                      break
                              case 3: benutzer.activity=1.9
                                      break
                              case 4: benutzer.activity=2.3
                                      break
                              default: benutzer.activity=1.5
                                       }
                            //benutzer.activity=1.5
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
      //eig ist das nicht nötig 
      let weight=userArray[userId-1].kpd.gewicht
      let height=userArray[userId-1].kpd.groesse
      let activity=userArray[userId-1].kpd.activitaet
      //switch einfügen
      let age=userArray[userId-1].kpd.alter
      let sex=userArray[userId-1].kpd.geschlecht

      let bedarf={}
      bedarf.kcal=(sex==="m" ? (66.47+(13.7*weight)+(5*height)-(6.8*age))*(activity): (655.1+(9.6*weight)+(1.8*height)-(4.7*age))*(activity) )
      bedarf.protein=(age < 65 ? weight*0.8 : weight)
      bedarf.fett=(bedarf.kcal*0.3)/9.3
      bedarf.gesFett=bedarf.fett*0.1
      bedarf.ungesFett=bedarf.fett-bedarf.gesFett
      bedarf.carbs=(bedarf.kcal-bedarf.fett*9.3-bedarf.protein*4.1)/4.1
      bedarf.zucker=bedarf.carbs*0.1
      userArray[userId-1].erreichtBedarf={
        unit: "prozent",  
        kcal:0,
          protein:0,
          fett:0,
          gesFett:0,
          ungesFett:0,
          carbs:0,
          zucker:0
        }
      
        userArray[userId-1].bedarf=bedarf
        resolve(userArray)
    })
}

const rezeptAnEdamam=(recipepath)=>{
  return new Promise((resolve, reject)=>{
    /*unirest.post('https://api.edamam.com/api/nutrition-details?app_id='+app_id+'&app_key='+app_key)
    .headers({
        'Content-Type': ['application/json', 'application/json']
      })
    .attach('file', recipepath)
    .end(function (result) {
      resolve(result.body)*/
    JSONtools.lesen(recipepath, function(etwas,res){
    unirest('POST', 'https://api.edamam.com/api/nutrition-details?app_id='+app_id+'&app_key='+app_key)
      .headers({
        'Content-Type': ['application/json', 'application/json']
      })
    .send(res)
      .end(function (res) { 
        //if (res.error) throw new Error(res.error); 
       resolve(res.body)
       //console.log(res.raw_body)
       //resolve("it works")
      })
    })
   
  })
}
//)}
  


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
          //resolve(foodQuery) //da der fehler am server liegt ist eine erneute sucheingabe nicht nötig, foodQuery wird übergeben
          resolve(true)
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
  let reached={
      unit: user.erreichtBedarf.unit
  }
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
      resolve(false)
      
     }
     userArray[userId-1]=user
     resolve(userArray)
  })
}

//zur validation von kpd
function validateKPD(kpd) {
  const schema = joi.object({
    gewicht: joi.number().min(40).max(300).required(),
    groesse: joi.number().min(100).max(250).required(),
    activitaet: joi.number().integer().min(0).max(4).required(),
    alter: joi.number().integer().min(0).max(120).required(),
    geschlecht: joi.string().valid('m','w').required()
 })
  return schema.validate(kpd)
   
  }

//REST methoden implementation:

//READ bzw GET Requests -> getestet und funktionieren
app.get('/', (req,res)=>{
  res.send('Willkomen bei unserem GDW Projekt')
})

app.get('/rezepte', (req, res) => {
  res.send(recipes)
  })

app.get('/rezepte/:id', (req, res) => {
  if(parseInt(req.params.id)<0 || req.params.id>recipes.length){
    res.status(404).send("Recipe ID nicht gefunden")
    return 
  }

rezeptWahl(parseInt(req.params.id))
.then(path=> rezeptPresent(path))
.then(function(result){
    res.send(result)
})
})

app.get('/benutzer/:id/bedarf', (req, res) => {
 
  einlesen(pathData).then(function(data){
    userArray=data
    if(parseInt(req.params.id)<0 || req.params.id>userArray.length){
      res.status(404).send("User ID nicht gefunden")
      return 
    }
    res.send(userArray[parseInt(req.params.id)-1].bedarf)
  })
  
    })

app.get('/benutzer/:id/erreichtBedarf', (req, res) => {
  
  einlesen(pathData).then(function(data){
    userArray=data
    if(parseInt(req.params.id)<0 || req.params.id>userArray.length){
      res.status(404).send("User ID nicht gefunden")
      return 
    }
    res.send(userArray[parseInt(req.params.id)-1].erreichtBedarf)
    })
  })

  app.get('/benutzer/', (req, res)=> {
    einlesen(pathData).then(function(data){
      res.send(data)
    })
})
  

//CREATE bzw POST -> getestet und funktionieren

app.post('/benutzer/:id/kpd', (req, res)=> {
  
  const { error } = validateKPD(req.body)
  if (error){
  res.status(400).send(error.details[0].message)
 return
  }
  einlesen(pathData).then(function(result){
    userArray=result
    if(parseInt(req.params.id)<0 || parseInt(req.params.id)>userArray.length+1){
      res.status(404).send("User ID nicht gefunden")
      return 
    }
    userArray.push={
     id: parseInt(req.params.id)
     }
    userArray[parseInt(req.params.id)-1].kpd=req.body
    bedarfNutzer(parseInt(req.params.id)).then(data =>JSONtools.schreibenSync(data,pathData)).then(function(flag,path){
      //vllt probleme mit async, evt callback oder promise
      pathData=path
      if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return  
      }

      res.send(userArray[parseInt(req.params.id)-1])
    })
})
})

  app.post('/benutzer/', (req, res)=> {
    einlesen(pathData).then(function(data){
      userArray=data
      let id=userArray.length
      res.send("Benutzer ID: "+id)
    })
})

//UPDATE bzw PUT

app.put('/benutzer/:id/erreichtBedarf/analyse_rezept/:rid', (req,res)=>{
  einlesen(pathData).then(function(result){
    userArray=result
if(parseInt(req.params.rid)<0 || req.params.rid>recipes.length){
  res.status(404).send("Recipe ID nicht gefunden")
  return 
}
if(parseInt(req.params.id)<0 || req.params.id>userArray.length){
  res.status(404).send("User ID nicht gefunden")
  return 
}
rezeptWahl(parseInt(req.params.rid)).then(path=>rezeptAnEdamam(path))
.then(result=>reachedNut(result,parseInt(req.params.id)))
.then(data => JSONtools.schreiben(data,pathData)) //vllt probleme mit async, evt callback oder promise
.then(function(flag,path){
  pathData=path
  if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return 
      }
  res.send(userArray[parseInt(req.params.id)-1].erreichtBedarf)
}) 
})
})

//edamam will iwie unsere app id bzw app key nicht annehmen
app.put('/benutzer/:id/erreichtBedarf/analyse_zutat/:zutat', (req,res)=>{
  einlesen(pathData).then(function(result){
    userArray=result
  if(parseInt(req.params.id)<0 || req.params.id>userArray.length){
    res.status(404).send("User ID nicht gefunden")
    return 
  }
  anfrage(req.params.zutat)
  .then(result=>reachedNut(result,parseInt(req.params.id)))
  .then(function(newId){
    if(typeof newId === "boolean"){
      res.status(400).send("hoppla, da ist ein fehler beim kontaktieren von Edamam passiert")  
      resolve()
    }
    else
      resolve(newId)
  }).then(data => JSONtools.schreiben(data,pathData)) //vllt probleme mit async, evt callback oder promise
  .then(function(flag,path){
  pathData=path
  if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return
      }
  res.send(userArray[parseInt(req.params.id)-1].erreichtBedarf)
})
})
})


const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}..`))


/*
  userArray[0].kpd={
    gewicht: 60,
    groesse: 170,
    activitaet: 2,
    alter: 30,
    geschlecht: "m"
    }

bedarfNutzer(1)*/
//main()

//module.exports={}