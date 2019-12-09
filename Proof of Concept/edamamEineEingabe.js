const unirest = require('unirest')
const _=require('underscore')
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

const menu=()=>{
  return new Promise((resolve,reject)=>{
    rl.question("1: Nochmal versuchen \n 2: Abort ", function(answer){
      if(answer==1){
        console.log("retrying")
        setTimeout(function(){
          //main()
          //apiRequest(foodQuery)
          
          main()
         },3000)
         resolve()
      }
      else if(answer==2){
        console.log("fatal error occured, please try again later")
        reject()
        
      }
      else{
        console.log("invalid argument, aborted")
        reject()
      }
  })
  })
}
const main=async()=>{
  eingabe().then(function(foodQuery){
    unirest.get('https://api.edamam.com/api/nutrition-data?app_id='+app_id+'&app_key='+app_key+'&'+foodQuery)
    .end(function (result) {
      if(result.statusCode>299){ //error fallbacks
        if(result.statusCode<400){
          console.log("a redirection error occurred "+ result.statusCode)
        }else if(result.statusCode<500){
          console.log("connection could not be established "+ result.statusCode)
          console.log("please check application id and/or application key "+ result.statusCode)
        }else if(result.statusCode>=500){
          console.log("server unavailable "+ result.statusCode)
          menu() //TODO: menu fixen
        } 
      }else if(!_.isEmpty(result.body.totalNutrients)){ //fallback falls eingabe invalid ist
        let cals = result.body.totalNutrients.ENERC_KCAL.quantity
        console.log(cals + "calories")
      }else {
          console.log("invalid argument")
          menu() //TODO: menu fixen
          rl.close() 
      }
   })
  })
  
  
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
