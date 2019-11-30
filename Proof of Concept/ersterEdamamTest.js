'use strict';

const unirest = require('unirest');

var params, esc, query, url, foodQuery, searchQuery

var getNutritionInfo = {
  mkString: function (foodStr) {
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
    return (foodQuery);
  },

   analyse: function (foodStr) {
     url="https://api.edamam.com/api/nutrition-data?app_id=d583615a&app_key=360dfcc569d8706ce6255d3595c6cd68"
     //url = "https://edamam-edamam-nutrition-analysis.p.rapidapi.com/api/nutrition-data";
    searchQuery = getNutritionInfo.mkString(foodStr);
    function requestData(callback) {
      unirest.get(url + "?" + searchQuery)
        .header("X-RapidAPI-Key", " 360dfcc569d8706ce6255d3595c6cd68	")
        .end(function (result) {
          console.log(result)
          let cals = result.body.totalNutrients.ENERC_KCAL.quantity;
          console.log(cals + " first");
          callback(cals); // pass value here
        });
    }
    requestData(function (cals) { // get value after completion
      console.log(cals + " second");
      getNutritionInfo.getData(cals);
    });
  },

  getData: function (calories) {
   // var calories = getNutritionInfo.analyse.cals;
    console.log(calories + " third");
    return calories;
  }
};
getNutritionInfo.analyse("10oz Chickpeas");