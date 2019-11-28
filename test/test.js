import axios from "axios";

const apiURL = "https://api.edamam.com/api/nutrition-details/search?q=";
const apiKey = "&app_key=360dfcc569d8706ce6255d3595c6cd68";
const apiId = "&app_id=d583615a";
const maxTime = "&time=30";
const maxIngreds = `&ingr=10`;

const fetchRecipes = async (...ingredients) => {
  const mappedIngreds = ingredients
    .map((ingredient, idx) => {
      if (idx < ingredients.length - 1) {
        return ingredient + "+";
      } else {
        return ingredient;
      }
    })
    .join("");

  const url = `${apiURL}${mappedIngreds}${maxIngreds}${maxTime}${apiId}${apiKey}`;
  const res = await axios.get(url);
  const recipes = res.data;
  console.log(recipes);
  addToList(recipes)
};

fetchRecipes("zucchini", "broccoli", "carrots");
