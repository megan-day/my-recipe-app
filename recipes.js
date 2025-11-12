// Key for user's personal ingredient database
const USER_INGREDIENTS_KEY = "myrecipes_ingredients";

// Load personal ingredients from localStorage
function loadUserIngredients() {
  try {
    return JSON.parse(localStorage.getItem(USER_INGREDIENTS_KEY)) || [];
  } catch {
    return [];
  }
}

// Save personal ingredients to localStorage
function saveUserIngredients(list) {
  localStorage.setItem(USER_INGREDIENTS_KEY, JSON.stringify(list || []));
}
// Add a new ingredient to personal database if it doesn't exist
function addUserIngredient(ingredient) {
  const list = loadUserIngredients();
  
  // Check if ingredient with same name already exists
  const exists = list.find(i => i.name.toLowerCase() === ingredient.name.toLowerCase());
  if (!exists) {
    list.push(ingredient);
    saveUserIngredients(list);
    console.log("✅ Ingredient saved:", ingredient.name);
  }
}

// Find ingredient by name from personal database
function findUserIngredientByName(name) {
  const list = loadUserIngredients();
  return list.find(i => i.name.toLowerCase() === name.toLowerCase());
}


/* recipes.js
   Base recipes + helpers to persist user recipes in localStorage,
   merge them at runtime, and export as JSON.
*/
// Try to load recipes from GitHub if available
async function loadRecipesFromGitHubIfAvailable() {
  try {
    if (typeof loadRecipesFromGitHub === "function") {
      const ghRecipes = await loadRecipesFromGitHub();
      if (Array.isArray(ghRecipes) && ghRecipes.length) {
        console.log("✅ Loaded recipes from GitHub");
        setUserRecipes(ghRecipes.filter(r => !BASE_RECIPES.find(b => b.id === r.id)));
      }
    }
  } catch (e) {
    console.warn("GitHub load skipped:", e);
  }
}

const BASE_RECIPES = [
  {
    id: "sourdough",
    title: "Artisan Sourdough Bread",
    description: "Simple, classic sourdough made with only flour, water, salt, and starter.",
    ingredients: [
      { name: "Sourdough starter (100% hydration, at peak)", baseQuantity: 110, quantity: 110, macros: { calories: 100, protein: 3.5, carbs: 20, fat: 0.2 } },
      { name: "Water (room temperature)", baseQuantity: 350, quantity: 350, macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Bread flour", baseQuantity: 500, quantity: 500, macros: { calories: 364, protein: 10, carbs: 76, fat: 1 } },
      { name: "Fine salt", baseQuantity: 10, quantity: 10, macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Feed and prepare your sourdough starter; it should be at its peak.",
      "In a large bowl, mix water and starter until dissolved.",
      "Add flour and salt, then mix until combined. Let rest for 30 minutes (autolyse).",
      "Perform stretch and folds every 30 minutes for 2 hours.",
      "Let dough rise until doubled, then shape and proof overnight in the fridge.",
      "Bake in a preheated Dutch oven at 450°F (230°C) for 35–40 minutes."
    ],
    tags: ["bread","vegan","baking"]
  }
];

/* localStorage key */
const USER_KEY = "myrecipes_user";

/* generate a simple unique id */
function makeId(prefix="r") {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7);
}

/* get user recipes from localStorage */
function loadUserRecipes(){
  try{
    const raw = localStorage.getItem(USER_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) return parsed;
    return [];
  }catch(e){
    console.error("loadUserRecipes error", e);
    return [];
  }
}

/* save user recipes array */
function saveUserRecipes(arr){
  localStorage.setItem(USER_KEY, JSON.stringify(arr || []));
}

/* returns merged list (base recipes first, then user recipes) */
function getAllRecipes(){
  const user = loadUserRecipes();
  // shallow merge; user recipes should have unique ids
  return [...BASE_RECIPES, ...user];
}
// Async version that loads from GitHub before merging
async function getAllRecipesAsync() {
  await loadRecipesFromGitHubIfAvailable();
  return getAllRecipes();
}

/* add a new recipe (from Add UI) */
function addUserRecipe(recipeObj){
  const user = loadUserRecipes();
  user.unshift(recipeObj); // newest first
  saveUserRecipes(user);

  // 💾 also push to GitHub if the helper is available
  if (typeof saveRecipesToGitHub === "function") {
    try {
      const all = getAllRecipes();
      saveRecipesToGitHub(all);
      console.log("✅ Synced with GitHub");
    } catch (e) {
      console.warn("GitHub sync failed:", e);
    }
  }
}


/* overwrite user recipes (used by import) */
function setUserRecipes(list){
  saveUserRecipes(list);
}

/* export function: produce a downloadable JSON file with all recipes */
function exportAllRecipes(){
  const all = getAllRecipes();
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recipes-export.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 5000);
}

/* helper: find recipe by id */
function findRecipeById(id){
  return getAllRecipes().find(r => r.id === id);
}


