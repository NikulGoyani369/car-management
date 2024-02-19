import * as readline from "node:readline";
import axios from "axios";

// Create readline interface
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a new manufacturer and save it to the database
export async function createManufacturer() {
  const name = await askQuestion("Enter manufacturer name: ");
  try {
    await axios.post("http://localhost:3000/manufacturers", {
      name,
    });
    console.log("Manufacturer created successfully.");
  } catch (error: any) {
    console.error("Error creating manufacturer for post:", error.message);
  }
}
// List all manufacturers from the database
export async function listManufacturers() {
  try {
    const response = await axios.get("http://localhost:3000/manufacturers");
    console.log("List of manufacturers:");
    response.data.forEach((manufacturer: any) => {
      console.log(`ID: ${manufacturer._id}, Name: ${manufacturer.name}`);
    });
  } catch (error: any) {
    console.error("Error listing manufacturers:", error.message);
  }
}

// Delete a manufacturer by ID from the database
export async function deleteManufacturerById() {
  const manufacturerId = await askQuestion("Enter manufacturer ID to delete: ");
  try {
    await axios.delete(`http://localhost:3000/manufacturers/${manufacturerId}`);
    console.log("Manufacturer deleted successfully.");
  } catch (error: any) {
    console.error("Error deleting manufacturer:", error.message);
  }
}

// View models by manufacturer ID from the database
export async function viewModelsByManufacturerId() {
  const manufacturerId = await askQuestion(
    "Enter manufacturer ID to view models: "
  );
  try {
    const response = await axios.get(
      `http://localhost:3000/models?manufacturer=${manufacturerId}`
    );
    const models = response.data;
    console.log("Models of Manufacturer:");
    models.forEach((model: any) => {
      console.log(`- ${model.name}`);
    });
  } catch (error: any) {
    console.error("Error viewing models:", error.message);
  }
}

// Add a new model by manufacturer ID to the database
export async function addModelByManufacturerId() {
  const manufacturerId = await askQuestion(
    "Enter manufacturer ID to add a model: "
  );
  const modelName = await askQuestion("Enter model name: ");
  try {
    await axios.post(`http://localhost:3000/models`, {
      name: modelName,
      manufacturer: manufacturerId,
    });
    console.log("Model added successfully.");
  } catch (error: any) {
    console.error("Error adding model:", error.message);
  }
}

// Prompt user for commands and execute the corresponding function based on the command
// c - Create a new manufacturer
// l - List all manufacturers
// d - Delete a manufacturer by ID
// v - View all models of manufacturer by manufacturer-ID
// a - Add a new model (Name) by manufacturer-ID
// h - Help
// q - Quit
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}
