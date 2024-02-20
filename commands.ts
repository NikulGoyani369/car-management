import * as readline from "node:readline";
import axios from "axios";
import { log, table } from "node:console";

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
    log("Manufacturer created successfully.");
  } catch (error) {
    console.error({
      status: 400,
      data: "Error creating manufacturer for post",
      statusText: "Bad Request",
    });
    return {
      status: 400,
      data: "Error creating manufacturer for post",
      statusText: "Bad Request",
    };
  }
}

// List all manufacturers from the database
export async function listManufacturers() {
  try {
    const response = await axios.get("http://localhost:3000/manufacturers");
    log("List of manufacturers:");

    response.data.forEach(
      (manufacturer: { _id: string; name: string; modelCount: number }) => {
        table([
          {
            ID: `${manufacturer._id}`,
            Name: `${manufacturer.name}`,
            NumberOfModels: `${manufacturer.modelCount}`,
          },
        ]);
      }
    );
  } catch (error) {
    console.error({
      status: 400,
      data: "No manufacturers found",
      statusText: "Bad Request",
    });
    return {
      status: 400,
      data: "No manufacturers found",
      statusText: "Bad Request",
    };
  }
}

// Delete a manufacturer by ID from the database
export async function deleteManufacturerById() {
  const manufacturerId = await askQuestion("Enter manufacturer ID to delete: ");
  try {
    await axios.delete(`http://localhost:3000/manufacturers/${manufacturerId}`);
    log("Manufacturer deleted successfully.");
  } catch (error) {
    console.error({
      status: 400,
      data: "Error deleting manufacturer",
      statusText: "Bad Request",
    });
    return {
      status: 400,
      data: "Error deleting manufacturer",
      statusText: "Bad Request",
    };
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
    log("Models of Manufacturer:");
    models.forEach((model: { name: string }) => {
      table([{ modalName: `${model.name}` }], ["modalName"]);
    });
  } catch (error) {
    console.error({
      status: 400,
      data: "Error viewing models by manufacturer ID",
      statusText: "Bad Request",
    });
    return {
      status: 400,
      data: "Error viewing models by manufacturer ID",
      statusText: "Bad Request",
    };
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
    log("Model added successfully.");
  } catch (error) {
    console.error({
      status: 400,
      data: "Error adding models by manufacturer ID",
      statusText: "Bad Request",
    });
    return {
      status: 400,
      data: "Error adding models by manufacturer ID",
      statusText: "Bad Request",
    };
  }
}

// Prompt user for commands and execute the corresponding function based on the command
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}
