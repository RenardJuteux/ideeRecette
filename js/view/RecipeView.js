class RecipeView {
  constructor(model) {
    this.model = model;
    // Initialization of DOM elements by ID, ensuring elements exist in the HTML.
    this.searchInput = document.getElementById("search-input");
    this.blocResults = document.getElementById("block-results");
    this.favList = document.getElementById("list-favorite");
    // Initial setup methods to prepare the UI on load.
    this.initRecipePanel(); // Prepares the recipe panel for displaying saved recipes.
    this.renderFavorites(); // Populates the favorites list based on stored session data.
  }

  //Retrieves the current value from the search input field.
  getInputValue() {
    return this.searchInput.value;
  }

  //Clears the search results display area, preparing it for new results.
  clearResults() {
    this.blocResults.innerHTML = "";
  }

  //Displays search results. Each result can be clicked to show more details.
  renderResults(recipes) {
    this.clearResults(); //Ensures the area is clear before adding new results.
    recipes.forEach((recipe) => {
      const paragraphe = document.createElement("p");
      paragraphe.textContent = recipe.recipe.label;
      this.blocResults.appendChild(paragraphe);
      // Adds click listener to each result for displaying detailed popup.
      paragraphe.addEventListener("click", () =>
        this.showRecipePopup(recipe.recipe)
      );
    });
  }

  //Generates the HTML structure for a recipe popup, including save (bookmark) functionality.
  showRecipePopup(recipe) {
    const popup = this.createPopup(recipe);
    this.setupSaveRecipeListener(popup, recipe);
    this.setupClosePopupListener(popup);
    this.loadYouTubeVideo(popup, recipe);
    document.body.appendChild(popup); // Adds the popup to the document.
  }

  //Generates the HTML structure for a recipe popup, including save (bookmark) functionality.
  createPopup(recipe) {
    const isSaved = this.model.isRecipeSaved(recipe.uri);
    //Detailed popup creation with conditional content based on the recipe's saved status.
    const popup = document.createElement("div");
    popup.id = "recipe-popup";
    popup.innerHTML = `
        <div class="popup-content" style="position: relative;">
        <div style="position: absolute; top: 10px; left: 10px;">
          <label class="bookmark" style="cursor: pointer;">
            <input type="checkbox" ${
              isSaved ? "checked" : ""
            } style="display: none;">
            <svg width="15" viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg" class="svgIcon bookmark-icon" style="fill: ${
              isSaved ? "white" : "none"
            }; stroke: white; stroke-width: 7;">
              <path d="M46 62.0085L46 3.88139L3.99609 3.88139L3.99609 62.0085L24.5 45.5L46 62.0085Z"></path>
            </svg>
          </label>
        </div>
        <button id="close-popup" class="close-popup-btn" style="position: absolute; top: 10px; right: 10px;">X</button>
        <div class="popup-header" style="padding-top: 50px;">
          <img src="${recipe.image}" alt="${recipe.label}" class="popup-img">
          <div id="youtube-video-container" class="popup-video"></div>
        </div>
        <h2 class="title-recette">${recipe.label}</h2>
        <ul class="popup-ingredients">${recipe.ingredientLines.join(
          "</li><li>"
        )}</ul>
        ${
          recipe.url
            ? `
        <div class="plusButton" onclick="window.open('${recipe.url}', '_blank')">
          <svg class="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
            <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z"></path>
          </svg>
        </div>
        `
            : ""
        }
      </div>
    `;
    return popup;
  }
 //Sets up an event listener for saving or unsaving a recipe. It toggles the visual state of the bookmark icon and updates the model accordingly.
  setupSaveRecipeListener(popup, recipe) {
    const checkbox = popup.querySelector("input[type=checkbox]");
    const bookmarkIcon = popup.querySelector(".bookmark-icon");
    checkbox.addEventListener("change", () => {
      this.model.toggleRecipeInSession(recipe);
      // Visually updates the bookmark icon based on the checkbox's checked state.
      bookmarkIcon.style.fill = checkbox.checked ? "white" : "none";
      this.updateRecipePanel(); // Assurez-vous que cette ligne est présente
    });
  }

  //Attaches an event listener to the popup's close button, allowing users to close the popup.
  setupClosePopupListener(popup) {
    const closeButton = popup.querySelector("#close-popup");
    closeButton.addEventListener("click", () => {
      popup.remove(); // Removes the popup from the DOM when the close button is clicked.
    });
  }

  // Asynchronously fetches and displays a YouTube video related to the recipe within the popup.
  async loadYouTubeVideo(popup, recipe) {
    try {
      const videoUrl = await this.model.fetchYouTubeVideo(recipe.label);
      if (videoUrl) {
        const videoContainer = popup.querySelector("#youtube-video-container");
        videoContainer.innerHTML = `<iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
      }
    } catch (error) {
      console.error("Error loading YouTube video:", error);
    }
  }


  //Adds a search query to the favorites list if it meets the length requirement. This method integrates with the model to store the favorite and updates the UI accordingly.
  addFavorite(query) {
    if (query.length < 3) return;
    this.model.addFavoriteToSession(query);
    this.renderFavorites();
    this.toggleFavoriteStar(true);
  }

  //Toggles the favorite star icon between filled and empty states based on the isFavorite boolean. This visual cue helps users identify if the current search or recipe is marked as a favorite.
  toggleFavoriteStar(isFavorite) {
    const starImg = document.getElementById("favorites-button").querySelector("img");
    starImg.src = isFavorite ? "images/etoile-pleine.svg": "images/etoile-vide.svg";
  }

  //Checks if the current search query is a favorite and updates the favorite button's appearance and functionality based on this status.
  updateFavoriteStatus() {
    const query = this.getInputValue();
    const isFavorite = this.model.isFavorite(query);
    this.toggleFavoriteStar(isFavorite);
    const favBtn = document.getElementById("favorites-button");
    favBtn.disabled = query.length < 3;
  }

  //Dynamically populates the favorites list with items from session storage. Each favorite can be clicked to perform a new search.
  renderFavorites() {
    const favorites = this.model.getFavoritesFromSession();
    this.favList.innerHTML = "";
    favorites.forEach((fav) => {
      const li = document.createElement("li");
      li.textContent = fav;
      this.favList.appendChild(li);
      li.addEventListener("click", () => {
        this.searchInput.value = fav; //Sets the search input to the selected favorite.
        this.controller.onSearch(); //Triggers a search for the selected favorite.
        this.updateFavoriteStatus(); // Updates the favorite status based on the new query.
      });
    });
    const currentQuery = this.getInputValue();
    this.toggleFavoriteStar(favorites.includes(currentQuery));
  }

  //Toggles the display of the recipe panel, showing or hiding it based on its current state.
  toggleRecipePanel() {
    this.recipePanel.style.display =
      this.recipePanel.style.display === "none" ? "block" : "none";
    this.updateRecipePanel(); // Updates the recipe panel content.
  }

  //Refreshes the content of the recipe panel to show saved recipes from session storage. If no recipes are saved, it displays a message.
  updateRecipePanel() {
    this.recipePanel.innerHTML = ""; // Clears existing content.
    const savedRecipes = this.model.getSavedRecipesFromSession();
    if (savedRecipes.length === 0) {
      const noSavedRecipesMessage = document.createElement("p");
      noSavedRecipesMessage.textContent = "Pas de recette sauvegarder.";
      this.recipePanel.appendChild(noSavedRecipesMessage);
      return;
    }
    savedRecipes.forEach((recipe) => {
      const recipeItem = document.createElement("p");
      recipeItem.textContent = recipe.label;
      this.recipePanel.appendChild(recipeItem);
      recipeItem.addEventListener("click", () => this.showRecipePopup(recipe));
    });
  }
  
  //Initializes the recipe panel with predefined styles and appends it to the document body. This method sets up the panel for displaying saved recipes.
  initRecipePanel() {
    this.recipePanel = document.createElement("div");
    // Sets various styling properties to ensure the panel is properly positioned and styled.
    this.recipePanel.id = "recipe-panel";
    this.recipePanel.style.position = "fixed";
    this.recipePanel.style.left = "0";
    this.recipePanel.style.top = "0";
    this.recipePanel.style.width = "300px";
    this.recipePanel.style.height = "100vh";
    this.recipePanel.style.backgroundColor = "#fff";
    this.recipePanel.style.zIndex = "1000";
    this.recipePanel.style.overflowY = "scroll";
    this.recipePanel.style.display = "none";
    document.body.appendChild(this.recipePanel);
  }

  //Allows the view to communicate with its controller, facilitating MVC (Model-View-Controller) interaction patterns.
  setController(controller) {
    this.controller = controller; // Associates a controller with the view
  }
}
