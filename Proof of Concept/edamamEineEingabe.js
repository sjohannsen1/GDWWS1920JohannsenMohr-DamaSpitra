const unirest = require('unirest')
const readline=require('readline')
var params, query,foodQuery,esc
//var ingredientArray = new Array();
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 

//FAIL und so implementieren -> in Proof of Concept rtf file

const eingabe=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Zutaten eingeben \t', function(foodStr){
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

const main=async()=>{
await eingabe().then(function(foodQuery){
  unirest.get('https://api.edamam.com/api/nutrition-data?app_id=d583615a&app_key=360dfcc569d8706ce6255d3595c6cd68'+'&'+foodQuery)
  .end(function (result) {
    //console.log(result.body)
    if(result.statusCode<200 || result.statusCode>299){
      console.log("an error occurred")
      //eingabe()
      //wie repeate ich hier
    }
    console.log(result.statusCode)
let cals = result.body.totalNutrients.ENERC_KCAL.quantity
 console.log(cals + "calories")
 })
})


rl.close()
}
main()
