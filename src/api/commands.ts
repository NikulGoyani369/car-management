import * as readline from "node:readline";
import axios from "axios";
import { log, table } from "node:console";

// Create readline interface
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a new manufacturer and save it to the database
export const createManufacturer = async () => {
  const name = await askQuestion("Enter manufacturer name: ");
  try {
    log("Manufacturer created successfully.");

    await axios.post("http://localhost:3000/manufacturers", {
      name,
    });
  } catch (error) {
    return {
      status: 400,
      data: "Error creating manufacturer for post",
      statusText: "Bad Request",
    };
  }
};

// List all manufacturers from the database
export const listManufacturers = async () => {
  try {
    log("List of manufacturers:");

    const response = await axios.get("http://localhost:3000/manufacturers");

    table(response.data);

    return response.data;
  } catch (error) {
    return {
      status: 400,
      data: "No manufacturers found",
      statusText: "Bad Request",
    };
  }
};

// Delete a manufacturer by ID from the database
export const deleteManufacturerById = async () => {
  const manufacturerId = await askQuestion("Enter manufacturer ID to delete: ");
  try {
    log("Manufacturer deleted successfully.");

    await axios.delete(`http://localhost:3000/manufacturers/${manufacturerId}`);

    const models = await axios.get(`http://localhost:3000/models`);

    const modelsData = models.data;

    modelsData.forEach(async (model: { manufacturer: string }) => {
      if (model.manufacturer === manufacturerId) {
        await axios.delete(
          `http://localhost:3000/models/${model.manufacturer}`
        );
      }
    });
  } catch (error) {
    return {
      status: 400,
      data: "Error deleting manufacturer",
      statusText: "Bad Request",
    };
  }
};

// View models by manufacturer ID from the database
export const viewModelsByManufacturerId = async () => {
  const manufacturerId = await askQuestion(
    "Enter manufacturer ID to view models: "
  );
  try {
    log("List of models by manufacturer ID:");

    const response = await axios.get(
      `http://localhost:3000/models?manufacturer=${manufacturerId}`
    );

    const models = response.data;

    table(models);

    return models;
  } catch (error) {
    return {
      status: 400,
      data: "Error viewing models by manufacturer ID",
      statusText: "Bad Request",
    };
  }
};

// Add a new model by manufacturer ID to the database
export const addModelByManufacturerId = async () => {
  const manufacturerId = await askQuestion(
    "Enter manufacturer ID to add a model: "
  );

  const modelName = await askQuestion("Enter model name: ");

  try {
    log("Model added successfully.");

    await axios.post(`http://localhost:3000/models`, {
      name: modelName,
      manufacturer: manufacturerId,
    });
  } catch (error) {
    return {
      status: 400,
      data: "Error adding models by manufacturer ID",
      statusText: "Bad Request",
    };
  }
};

// Prompt user for commands and execute the corresponding function based on the command
const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
};
