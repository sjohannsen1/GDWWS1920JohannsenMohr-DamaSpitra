const unirest = require('unirest')
const readline=require('readline')
var params, query,foodQuery,esc
var ingredientArray = new Array();
const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
}) 
const mkString= function (ingredients) {
    
    //console.log(foodStr)
    params = {
      ingr: ingredients,

    };

    esc = encodeURIComponent;
    query = Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');

    foodQuery = query.replace(/%20/g, "+");
    return (foodQuery);
  }
const eingabe=()=>{
    return new Promise((resolve,reject)=>{
        rl.question('Zutaten eingeben \t', function(foodStr){
            ingredientArray.push(foodStr);
                /*var ingredients = new Array();
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
              
            
         resolve()
         })
    })
}
const wievieleEingaben=()=>{
    return new Promise((resolve, reject)=>{
        rl.question('Wie viele Zutaten sollen eingegeben werden? ', function(answer){
            resolve(answer)
        })

    })
}
/*var Request =*/ 
//console.log(Request)
const main=async()=>{
await wievieleEingaben().then(async function(anzahl){
    for(let i=0; i<anzahl; i++){
        await eingabe()
    }
})
unirest.get('https://api.edamam.com/api/nutrition-data?app_id=d583615a&app_key=360dfcc569d8706ce6255d3595c6cd68'+'&'+mkString(ingredientArray))
.end(function (result) {
    //console.log(result)
let cals = result.body.totalNutrients.ENERC_KCAL.quantity
 console.log(cals + " first")
 })

rl.close()
}
main()
