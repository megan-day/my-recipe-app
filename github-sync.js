// github-sync.js
// Handles loading/saving recipes.json directly from GitHub

const GITHUB_USER = "YOUR_USERNAME";        // <-- your GitHub username
const GITHUB_REPO = "YOUR_REPO_NAME";       // <-- your repo name (no .github.io)
const FILE_PATH = "recipes.json";
const BRANCH = "main";                      // or 'master' if your repo uses that

// Store token securely in browser (user enters it once)
async function getToken() {
  let token = localStorage.getItem("github_token");
  if (!token) {
    token = prompt("Enter your GitHub token (starts with ghp_):");
    if (token) localStorage.setItem("github_token", token);
  }
  return token;
}

// Fetch the current recipes.json file from GitHub
async function loadRecipesFromGitHub() {
  const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/${FILE_PATH}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load recipes.json");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Save updated recipes.json back to GitHub
async function saveRecipesToGitHub(recipes) {
  const token = await getToken();
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

  // Get current file SHA (required for GitHub updates)
  const current = await fetch(apiUrl);
  const currentData = await current.json();
  const sha = currentData.sha;

  const message = "Update recipes.json from website";
  const content = btoa(JSON.stringify(recipes, null, 2)); // encode to base64

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content,
      sha,
      branch: BRANCH
    })
  });

  if (res.ok) {
    alert("✅ Recipes saved to GitHub!");
  } else {
    alert("❌ Save failed! Check your token or repo permissions.");
  }
}
