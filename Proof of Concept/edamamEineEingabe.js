const unirest = require('unirest')
const _ =require('underscore')
const readline=require('readline')
const app_id="d583615a"
const app_id2="13242f" //falsche app_id zum testen von fallbacks bzgl status code 400-500
const app_key="360dfcc569d8706ce6255d3595c6cd68"
var params, query,foodQuery,esc

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 

//Fordert user zur eingabe einer Zutat. Formatiert diese und return dies
const eingabe=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Zutaten eingeben ', function(foodStr){

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

//Fehlermenu, ermöglicht dem User die wahl zwischen einem Weiteren Versuch oder dem Programmabbruch
const menu=(result1)=>{
 return new Promise((resolve,reject)=>{
    rl.question('1: Nochmal versuchen \n2: Abort \nEingabe: ', function(answer){
      if(answer==1){
        console.log("retrying")
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
          resolve(result.body.totalNutrients)
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
  console.log("total Nutrients: "+JSON.stringify(result, 0, 2)) //Reicht das so als ausgabe? sonst gib ich nur die macros aus
  }else{
    await menu(result) //es ist ein fehler passiert und dem User wird das Fehlermenu angezeigt
   }
}
const main=async()=>{
  await eingabe().then(foodQuery=>anfrage(foodQuery)).then(result=>ausgabeCals(result))
  rl.close()
  }
main()

