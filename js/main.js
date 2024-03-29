// Adds an event listener for the 'load' event on the window object. This ensures that the code inside the callback function runs only after the entire page has loaded, including all dependent resources like stylesheets and images.
window.addEventListener('load', () => {
  // Creates an instance of the RecipeModel class. The model is responsible for managing the data of the application.
  const model = new RecipeModel();

  // Creates an instance of the RecipeView class, passing the model as an argument. The view is responsible for rendering the output and interacting with the user interface.
  const view = new RecipeView(model); 

  // Creates an instance of the RecipeController class, passing both the model and the view as arguments. The controller acts as an intermediary between the model and the view, handling user input and updating the view/model as necessary.
  const controller = new RecipeController(model, view);

  // Sets the controller for the view. This step allows the view to communicate with the controller, typically for event handling and updates triggered by user actions.
  view.setController(controller); 
});
