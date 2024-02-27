import {
  createManufacturer,
  listManufacturers,
  deleteManufacturerById,
  viewModelsByManufacturerId,
  addModelByManufacturerId,
} from "./commands";
import { showHelp } from "./showHelp";
import * as readline from "node:readline";

// Create readline interface
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUser = async () => {
  while (true) {
    const command = await askQuestion(
      "Enter command (c / l / d / v / a / h / q): "
    );
    switch (command) {
      case "c":
        const name = await askQuestion("Enter manufacturer name: ");
        await createManufacturer(name);
        break;
      case "l":
        await listManufacturers();
        break;
      case "d":
        const manufacturerId = await askQuestion(
          "Enter manufacturer ID to delete: "
        );
        await deleteManufacturerById(manufacturerId);
        break;
      case "v":
        const vieModelByID = await askQuestion(
          "Enter manufacturer ID to view models: "
        );
        await viewModelsByManufacturerId(vieModelByID);
        break;
      case "a":
        const addModelByID = await askQuestion(
          "Enter manufacturer ID to add a model: "
        );
        const modelName = await askQuestion("Enter model name: ");
        await addModelByManufacturerId(addModelByID, modelName);
        break;
      case "h":
        showHelp();
        break;
      case "q":
        console.log("Exiting... Goodbye!");
        rl.close(); // Close the readline interface
        process.exit(0);
      default:
        console.log("Invalid command. Type 'h' for help.");
    }
  }
};

const askQuestion = async (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
};

promptUser();
