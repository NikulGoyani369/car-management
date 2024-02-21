export const showHelp = () => {
  console.log("\n", "Available commands:");
  console.log("'c' - Create a new manufacturer");
  console.log("'l' - List all manufacturers (ID, Name, Number of models)");
  console.log("'d' - Delete a manufacturer by ID");
  console.log("'v' - View all models of manufacturer by manufacturer-ID");
  console.log("'a' - Add a new model (Name) by manufacturer-ID");
  console.log("'h' - Show help");
  console.log("'q' - Quit the application", "\n");
};
