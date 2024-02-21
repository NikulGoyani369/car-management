import { log } from "console";

// Define a global array to cache commands
const commandCache: any = [];

// Function to execute cached commands when online
export const executeCachedCommands = async () => {
  try {
    // Loop through the cached commands and execute each one

    for (const command of commandCache) {
      await executeCommand(command);
    }

    // Clear the command cache after executing all commands
    commandCache.length = 0;

    console.log("Cached commands executed successfully.");
  } catch (error) {
    console.error("Error executing cached commands:", error);
  }
};

// Function to cache commands when offline
export const cacheCommand = (command: any) => {
  log("Caching command....................:", command);
  commandCache.push(command);
};

// Function to execute a single command
export const executeCommand = async (command: string) => {
  try {
    // Execute the command
    await eval(command);
    console.log("Command executed:", command);
  } catch (error) {
    console.error("Error executing command:", command, error);
  }
};
