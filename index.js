const unirest = require('unirest') 
const _ = require('underscore') 
const express = require('express')
const joi = require('@hapi/joi') //zur validation von kpd und zutat
const JSONtools=require("./JSONModul.js")
const app = express()
app.use(express.json())
const app_id="d583615a"
//const app_id2="13242f" //falsche app_id zum testen von fallbacks bzgl status code 400-500
const app_key="360dfcc569d8706ce6255d3595c6cd68"
var params, query,foodQuery,esc
var userArray
const pathData="userData.json"

//Array mit allen Rezepttiteln und des zugehörigen IDs
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
    id:5},
  {title:"Sir Patrick Stewart's mole enchiladas",
    id:6},
  {title:"Shrimp & black bean quesadillas",
    id:7},
  {title:"South American-style guacamole with popped black beans",
    id:8},
  {title:"Mega veggie nachos",
    id:9},
  {title:"Mark Hamill's roast sirloin & Yorkshire puddings",
    id:10}
  ]

//Array mit allen Rezeptdateipfaden
const recipepaths=[
  "./Recipes/Recipe1.json",
  "./Recipes/Recipe2.json",
  "./Recipes/Recipe3.json",
  "./Recipes/Recipe4.json",
  "./Recipes/Recipe5.json",
  "./Recipes/Recipe6.json",
  "./Recipes/Recipe7.json",
  "./Recipes/Recipe8.json",
  "./Recipes/Recipe9.json",
  "./Recipes/Recipe10.json"
]


//Funktionen

//ermöglicht das synchrone Einlesen
const einlesen=(path)=>{ 
  return new Promise((resolve,reject)=>
  {JSONtools.lesen(path, function(x,data){
    resolve(data)
  })
  })
  }

//ordnet dem gewählten Rezept den passenden String mit dem zugehörigen Dateipfad zu
const rezeptWahl=(id)=>{
    return new Promise((resolve,reject)=>{
        resolve(recipepaths[id-1])
    })
 //todo: implementieren: get mit Rezept ID sucht passendes Rezept aus path array (recipepaths) also: recipepaths[id-1]

}

//zur Formatierung des einzelnen Foodstrings
const mkString=(foodStr)=>{
  return new Promise((resolve,reject)=>{
    var ingredients = new Array()
    ingredients.push(foodStr)
   //console.log(foodStr)
      params = {
        ingr: ingredients,
        }
      esc = encodeURIComponent
      query = Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&')
      foodQuery = query.replace(/%20/g, "+")
      resolve(foodQuery)

  })
}

//liest das Rezept aus recipepath ein und gibt es aus
const rezeptPresent=(recipepath)=>{
    return new Promise((resolve,reject)=>{
    JSONtools.lesen(recipepath, function(x,res){
        resolve(res)
    })
})
}

//errechnet Bedarfwerte des Nutzers, getestet und funktioniert
const bedarfNutzer=(userId)=>{
    return new Promise((resolve, reject)=>{
      //eig ist das nicht nötig 
      let weight=userArray[userId-1].kpd.gewicht
      let height=userArray[userId-1].kpd.groesse
      let activity
      switch(userArray[userId-1].kpd.activitaet){
        case 0:activity=1.2 
                break
        case 1: activity=1.5
                break
        case 2: activity=1.7
                break
        case 3: activity=1.9
                break
        case 4: activity=2.3
                break
        default: activity=1.5
                 }
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

//nimmt einen Dateipfad an, liest das Rezept ein und sendet das an Edamam. Gibt die Antwort von Edamam zurück
const rezeptAnEdamam=(recipepath)=>{
  return new Promise((resolve, reject)=>{
    
    JSONtools.lesen(recipepath, function(etwas,res){
    unirest('POST', 'https://api.edamam.com/api/nutrition-details?app_id='+app_id+'&app_key='+app_key)
      .headers({
        'Content-Type': ['application/json', 'application/json']
      })
    .send(res)
      .end(function (res) { 
        //if (res.error) throw new Error(res.error) //??? vllt drin lassen?
       resolve(res.body)
       
      })
    })
   
  })
}

//schickt die formatierte Suchquery und schickt diese an die API, falls der StatusCode der Rückgabe einen Fehler indiziert, wird dieser
// in entsprechenden fallbacks behandelt, die fallbacks landen in den heroku logs
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
          //resolve(foodQuery) //da der Fehler am Server liegt, ist eine erneute Sucheingabe nicht nötig foodQuery wird übergeben
          resolve(true)
        } 
      }else if(!_.isEmpty(result.body.totalNutrients)){ //Wenn es in der If-Abfrage ist lief alles gut
          resolve(result.body)
      }else { //fallback falls Eingabe invalid ist
          console.log("invalid argument")
          resolve(foodQuery) //sagt dem then, dass eine neue Eingabe nötig ist
                     
      }
   })
  })
}

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

//zur validation des Körperdatenobjekts
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

//zur validation des Zutatobjekts
function validateZutat(zutat){
  const schemaZ= joi.object({
    zutat: joi.string().required()
  })
  return schemaZ.validate(zutat)
}


//REST methoden Implementation:

//GET 

//sendet Willkommensnachricht
app.get('/', (req,res)=>{
  res.send('Willkomen bei unserem GDW Projekt')
})

//sendet alle Rezepte
app.get('/rezepte', (req, res) => {
  res.send(recipes)
  })

//sendet das komplette Rezept mit der spezifizierten ID
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

//sendet die Bedarfsdaten des Nutzers mit der spezifizierten ID
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


//sendet die Bedarfserreichtdaten des Nutzers mit der spezifizierten ID
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

//sendet alle gespeicherten Benutzer
  app.get('/benutzer/', (req, res)=> {
    einlesen(pathData).then(function(data){
      res.send(data)
    })
})
  

//POST

//erzeugt einen neuen Benutzer mit der spezifizierten id. 
//Körperdaten werden übergeben und daraus die Bedarfsdaten errechnet. Bedarfserreichtdaten werden initialisiert.
//gibt den Benutzer zurück
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
    userArray.push({
     id: parseInt(req.params.id)
     })
    userArray[parseInt(req.params.id)-1].kpd=req.body
    bedarfNutzer(parseInt(req.params.id))
    .then(data =>JSONtools.schreibenSync(data,pathData))
    .then(function(flag){
      //vllt probleme mit async, evt callback oder promise
      
      if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return  
      }

      res.send(userArray[parseInt(req.params.id)-1])
    })
})
})

//erzeugt einen neuen Benutzer und gibt die ID zurück
app.post('/benutzer/', (req, res)=> {
    einlesen(pathData).then(function(data){
      //userArray=data
      let id=data.length+1
      res.send("Benutzer ID: "+id)
    })
})

//PUT

//Analysiert das Rezept mit der passenden RID, errechnet wie viel Prozent des Bedarfs dadurch gedeckt wurden.
//gibt den Benutzer zurück
app.put('/benutzer/:id/erreichtBedarf/analyse_rezept/:rid', (req,res)=>{
  einlesen(pathData).then(function(result){
    userArray=result
if(parseInt(req.params.rid)<0 || parseInt(req.params.rid)>recipes.length){
  res.status(404).send("Recipe ID nicht gefunden")
  return 
}
if(parseInt(req.params.id)<0 || parseInt(req.params.id)>userArray.length){
  res.status(404).send("User ID nicht gefunden")
  return 
}
rezeptWahl(parseInt(req.params.rid)).then(path=>rezeptAnEdamam(path))
.then(result=>reachedNut(result,parseInt(req.params.id)))
.then(data => JSONtools.schreiben(data,pathData)) //vllt probleme mit async, evt callback oder promise
.then(function(flag){
 
  if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return 
      }
  res.send(userArray[parseInt(req.params.id)-1])
}) 
})
})

//Analysiert die übergebene Zutat, errechnet wie viel Prozent des Bedarfs dadurch gedeckt wurden.
//gibt den Benutzer zurück
app.put('/benutzer/:id/erreichtBedarf/analyse_zutat/', (req,res)=>{
  const { error } = validateZutat(req.body)
  if (error){
  res.status(400).send(error.details[0].message)
 return
  }
  einlesen(pathData).then(function(result){
    userArray=result
  if(parseInt(req.params.id)<0 || parseInt(req.params.id)>userArray.length){
    res.status(404).send("User ID nicht gefunden")
    return 
  }
  mkString(req.body.zutat)
  .then(foodString => anfrage(foodString))
  .then(result=>reachedNut(result,parseInt(req.params.id)))
  .then(function(newId){
    if(typeof newId === "boolean"){
      res.status(400).send("hoppla, da ist ein fehler beim kontaktieren von Edamam passiert")  
      return
    }
    else if(typeof newId === "string"){
      res.status(400).send("eingabe invalid")  
      return
    }
    else
      return(newId)
  }).then(data => JSONtools.schreiben(data,pathData)) //vllt probleme mit async, evt callback oder promise
  .then(function(flag){
  if (typeof flag === "boolean"){
        res.status(404).send("Problem beim Speichern des Users")
        return
      }
  res.send(userArray[parseInt(req.params.id)-1])
})
})
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}..`))


