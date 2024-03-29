class RecipeController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.setupEventListeners();
    this.dynamiqueSeach = document.getElementById('cbx-51').checked;
    this.view.renderFavorites(this.model.getFavoritesFromSession());
  }

  // Sets up event listeners for UI elements (search, filter, favorites, and dynamic search toggle).
  setupEventListeners() {
    document.getElementById("search-button").addEventListener("click", () => this.onSearch());
    document.getElementById("filter").addEventListener('click', () => this.view.toggleRecipePanel());
    document.getElementById("favorites-button").addEventListener("click", () => this.addFavorite());
    const toggleDynamiqueSearch = document.getElementById("cbx-51");
    toggleDynamiqueSearch.addEventListener("change", () => {
      this.dynamiqueSeach = toggleDynamiqueSearch.checked;
    });
    document.getElementById("search-input").addEventListener("input", () => this.handleInput());
  }

  // Handles real-time input changes for dynamic search and toggles favorite button.
  handleInput() {
    const query = this.view.getInputValue();
    this.toggleFavoriteButtonState(query);
    this.view.toggleFavoriteStar(this.model.isFavorite(query));
    if (this.dynamiqueSeach && query.length >= 3) {
      this.onSearch();
    } else {
      this.view.clearResults();
    }
  }

  // Initiates the search process by fetching recipes based on input query.
  async onSearch() {
    const query = this.view.getInputValue();
    if (query.length >= 3) {
      try {
        const recipes = await this.model.fetchRecipes(query);
        this.view.renderResults(recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    }
  }
  
  // Adds or removes a recipe from favorites and updates UI accordingly.
  async addFavorite() {
    const query = this.view.getInputValue();
    if (query.length >= 3) {
        this.model.toggleFavoriteInSession(query);
        this.view.renderFavorites(this.model.getFavoritesFromSession());
        const isFavoriteNow = this.model.isFavorite(query);
        this.view.toggleFavoriteStar(isFavoriteNow);
    }
  }

  // Toggles the enabled state of the favorite button based on query length.
  toggleFavoriteButtonState(query) {
    const favBtn = document.getElementById("favorites-button");
    favBtn.disabled = query.length < 3;
    this.view.toggleFavoriteStar(this.model.isFavorite(query));
  }
}
