const unirest = require('unirest')
const _ =require('underscore')
const readline=require('readline')
const app_id="d583615a"
const app_id2="13242f"
const app_key="360dfcc569d8706ce6255d3595c6cd68"
var params, query,foodQuery,esc, repeated=0
//var ingredientArray = new Array();
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 

//FAIL und so implementieren -> in Proof of Concept rtf file

const eingabe=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Zutaten eingeben ', function(foodStr){
            //ingredientArray.push(foodStr);
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
                //return (foodQuery);*/
              
            
         resolve(foodQuery)
         })
    })
}

const menu=(result1)=>{
 return new Promise((resolve,reject)=>{
    rl.question('1: Nochmal versuchen \n2: Abort \nEingabe: ', function(answer){
      if(answer==1){
        console.log("retrying")
        if(typeof result1 === "boolean"){
          eingabe().then(query=>anfrage(query)).then(res=>ausgabeCals(res)).then(function(){ rl.close()})
        
        }
        else{
          anfrage(result1).then(result=>ausgabeCals(result)).then(function(){ rl.close()})
        }
      }
      else if(answer==2){
        console.log("fatal error occured, please try again later")
        resolve(false)
        
      }
      else{
        console.log("invalid argument, aborted")
        resolve()
      }
  })
  })
}

const anfrage=(foodQuery)=>{
  return new Promise((resolve,reject)=>{
    unirest.get('https://api.edamam.com/api/nutrition-data?app_id='+app_id+'&app_key='+app_key+'&'+foodQuery)
    .end(function (result) {
      if(result.statusCode>299){ //error fallbacks
        if(result.statusCode<400){
          console.log("a redirection error occurred. HTTP error code:  "+ result.statusCode)
          resolve(true)
        }else if(result.statusCode<500){
          console.log("connection could not be established. HTTP error code: "+ result.statusCode)
          console.log("please check application id and/or application key ")
          resolve(true)
        }else if(result.statusCode>=500){
          console.log("server unavailable. HTTP error code:  "+ result.statusCode)
          resolve(foodQuery)
           //TODO: menu fixen
          
        } 
      }else if(!_.isEmpty(result.body.totalNutrients)){ //fallback falls eingabe invalid ist
        //let cals = result.body.totalNutrients.ENERC_KCAL.quantity
        //console.log(cals + "calories")
        resolve(result.body.totalNutrients.ENERC_KCAL.quantity)
      }else {
          console.log("invalid argument")
          resolve(false)
          /*menu().then(function (){
            anfrage()
            rl.close()
          },function(){
            rl.close()
          }) *///TODO: menu fixen
           
      }
   })
  })
  }

const ausgabeCals=async(result)=>{
  //return new Promise((resolve,reject)=>{
 /*if(typeof result===String){
   menu(result)
   //eingabe().then(anfrage(result)).then(ausgabeCals(result))
  }
  else */if(typeof result==="boolean" && result){
    return
  }else if (typeof result ==="number"){
  console.log("Calories: "+result)
  }else{
    await menu(result)
    
    //anfrage(result).then(ausgabeCals(result))
  }
//})
}
const main=async()=>{
  await eingabe().then(foodQuery=>anfrage(foodQuery)).then(result=>ausgabeCals(result))
  rl.close()
  }
main()

//tests
/*const apiRequest=(foodQuery)=>{
  return new Promise((resolve,reject)=>{
    console.log("hallo")
    unirest.get('https://api.edamam.com/api/nutrition-data?app_id='+app_id2+'&app_key='+app_key+'&'+foodQuery)
      .end(function (result) {
      //console.log(result.body)
        if(result.statusCode<200 || result.statusCode>299){
          console.log("an error occurred")
          //eingabe()
          //wie repeate ich hier
          if(repeated<3){
            repeated++
            setTimeout(function(){
             //main()
             apiRequest(foodQuery)
            },3000)
          }else{
            //console.log("fatal error occured, please try again later")
            reject(result.statusCode)
          }
      
        }else{
          //console.log(result.statusCode)
          //let cals = result.body.totalNutrients.ENERC_KCAL.quantity
          //console.log(cals + "calories")
           resolve(result.body.totalNutrients.ENERC_KCAL.quantity)
         }

      })
   })
}
const main=async()=>{
await eingabe().then(function(foodQuery){
  unirest.get('https://api.edamam.com/api/nutrition-data?app_id='+app_id2+'&app_key='+app_key+'&'+foodQuery)
  .end(function (result) {
  //console.log(result.body)
    if(result.statusCode<200 || result.statusCode>299){
      console.log("an error occurred")
      //eingabe()
      //wie repeate ich hier
      if(repeated<3){
        repeated++
        /*setTimeout(function(){
         //main()
         //apiRequest(foodQuery)
         main()
        },3000)
      }else{
        //console.log("fatal error occured, please try again later")
        reject(result.statusCode)
      }
  
    }else{
      //console.log(result.statusCode)
      //let cals = result.body.totalNutrients.ENERC_KCAL.quantity
      //console.log(cals + "calories")
       resolve(result.body.totalNutrients.ENERC_KCAL.quantity)
     }
    }).then(function(cals){ /*apiRequest(foodQuery)
    console.log(cals+" Calories")
  }, function(status){
    console.log("fatal error occured, please try again later"+ status)
    })
 })
}


rl.close()

main()
*/
