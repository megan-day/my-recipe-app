<script>
/* ------------------------------
   Utility Helpers
------------------------------ */
function escapeHtml(s) {
  return (s || '').toString()
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function makeStepRow(text='') {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-row';
  wrapper.innerHTML = `
    <textarea class="step-txt" rows="2" placeholder="Step description">${escapeHtml(text)}</textarea>
    <button class="small-btn remove-row">✖</button>
  `;
  return wrapper;
}

/* ------------------------------
   MAIN LOGIC
------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("new-ingredient-name");
  const qtyInput = document.getElementById("new-ingredient-qty");
  const unitSelect = document.getElementById("new-ingredient-unit");
  const calInput = document.getElementById("new-ingredient-cal");
  const proInput = document.getElementById("new-ingredient-pro");
  const carbInput = document.getElementById("new-ingredient-carb");
  const fatInput = document.getElementById("new-ingredient-fat");
  const addBtn = document.getElementById("add-ingredient-btn");
  const listDiv = document.getElementById("ingredient-list");
  const datalist = document.getElementById("saved-ingredients");
  const stepsContainer = document.getElementById('stepsRows');
  const addStepBtn = document.getElementById('addStepRow');
  const clearStepsBtn = document.getElementById('clearSteps');

  const currentIngredients = [];

  /* --- Load existing ingredients --- */
  function updateDatalist() {
    const saved = loadUserIngredients();
    datalist.innerHTML = "";
    saved.forEach(ing => {
      const option = document.createElement("option");
      option.value = ing.name;
      datalist.appendChild(option);
    });
  }
  updateDatalist();

  /* --- Render ingredients list --- */
  function renderIngredients() {
    listDiv.innerHTML = "";
    currentIngredients.forEach((ing, idx) => {
      const div = document.createElement("div");
      div.innerHTML = `
        ${ing.name} — ${ing.quantity} ${ing.unit} |
        🔥${ing.macros.calories} kcal,
        🥩${ing.macros.protein}P,
        🍞${ing.macros.carbs}C,
        🧈${ing.macros.fat}F
      `;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.addEventListener("click", () => {
        currentIngredients.splice(idx, 1);
        renderIngredients();
      });
      div.appendChild(removeBtn);
      listDiv.appendChild(div);
    });
  }

  /* --- Autofill macros if ingredient exists --- */
  nameInput.addEventListener("input", () => {
    const found = findUserIngredientByName(nameInput.value.trim());
    if (found) {
      qtyInput.value = found.quantity || "";
      unitSelect.value = found.unit || "g";
      calInput.value = found.macros.calories || "";
      proInput.value = found.macros.protein || "";
      carbInput.value = found.macros.carbs || "";
      fatInput.value = found.macros.fat || "";
    }
  });

  /* --- Add ingredient button --- */
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const qty = parseFloat(qtyInput.value);
    const unit = unitSelect.value;
    const calories = parseFloat(calInput.value) || 0;
    const protein = parseFloat(proInput.value) || 0;
    const carbs = parseFloat(carbInput.value) || 0;
    const fat = parseFloat(fatInput.value) || 0;

    if (!name || isNaN(qty)) {
      alert("Please enter a valid name and quantity.");
      return;
    }

    const ingredient = {
      name,
      quantity: qty,
      unit,
      macros: { calories, protein, carbs, fat }
    };

    addUserIngredient(ingredient);
    updateDatalist();

    currentIngredients.push(ingredient);
    renderIngredients();

    nameInput.value = "";
    qtyInput.value = "";
    calInput.value = "";
    proInput.value = "";
    carbInput.value = "";
    fatInput.value = "";
  });

  /* --- Steps logic --- */
  addStepBtn.addEventListener("click", () => {
    stepsContainer.appendChild(makeStepRow());
  });

  clearStepsBtn.addEventListener("click", () => {
    stepsContainer.innerHTML = "";
  });

  // Start with 3 empty steps
  for (let i = 0; i < 3; i++) {
    stepsContainer.appendChild(makeStepRow());
  }

  /* --- Save / Preview / Export --- */
  document.getElementById('saveRecipe').addEventListener('click', ()=> {
    const recipe = gatherForm(currentIngredients);
    if(!recipe.title) return alert('Title required');
    addUserRecipe(recipe);
    alert('Saved locally. It will appear on the Home page.');
  });

  document.getElementById('previewRecipe').addEventListener('click', ()=> {
    const recipe = gatherForm(currentIngredients);
    renderPreview(recipe);
  });

  document.getElementById('exportJson').addEventListener('click', ()=> exportAllRecipes());

  /* --- Remove step handler --- */
  document.body.addEventListener('click', (ev)=>{
    if(ev.target && ev.target.classList.contains('remove-row')){
      ev.target.closest('.form-row').remove();
    }
  });
});

/* ------------------------------
   Form gather & preview
------------------------------ */
function gatherForm(currentIngredients){
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const tagsRaw = document.getElementById('tags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [];

  const ingredients = currentIngredients.map(i => ({
    name: i.name,
    baseQuantity: i.quantity,
    quantity: i.quantity,
    unit: i.unit,
    macros: i.macros
  }));

  const steps = Array.from(document.querySelectorAll('#stepsRows .step-txt'))
    .map(stepInput => stepInput.value.trim())
    .filter(Boolean);

  const id = makeId('r');
  return { id, title, description, ingredients, steps, tags };
}

function renderPreview(recipe){
  const previewArea = document.getElementById('previewArea');
  if(!recipe){ previewArea.innerHTML = '<p>No preview</p>'; return; }
  const div = document.createElement('div');
  div.innerHTML = `
    <h3>${escapeHtml(recipe.title)}</h3>
    <p>${escapeHtml(recipe.description || '')}</p>
    <h4>Ingredients</h4>
    <ul>
      ${recipe.ingredients.map(i=>`<li>${escapeHtml(i.name)} — ${i.quantity} ${i.unit} (${i.macros.calories} kcal, ${i.macros.protein}P/${i.macros.carbs}C/${i.macros.fat}F)</li>`).join('')}
    </ul>
    <h4>Steps</h4>
    <ol>${recipe.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>
    <div class="tags">${(recipe.tags||[]).join(' • ')}</div>
  `;
  previewArea.innerHTML = '';
  previewArea.appendChild(div);
}
</script>
