import { log } from "console";

// Define a global array to cache commands
export const commandCache: unknown[] = [];

// Function to execute cached commands when online
export const executeCachedCommands = async () => {
  try {
    // Loop through the cached commands and execute each one
    for (const command of commandCache) {
      await executeCommand(command);
    }

    // Clear the command cache after executing all commands
    commandCache.length = 0;
  } catch (error) {
    console.error("Error executing cached commands:", error);
  }
};

// Modify cacheCommand to accept the function and its arguments
export const cacheCommand = (commandFunction: Function, ...args: string[]) => {
  console.log("Caching command offline:", commandFunction.name, args);

  // Push the command function and its arguments to the command cache
  commandCache.push({ commandFunction, args });
};

// executeCommand to execute the cached command function with its arguments
const executeCommand = async (command: any) => {
  try {
    // Extract the cached command function and its arguments
    const { commandFunction, args } = command;

    // Execute the cached command function with its arguments
    if (commandCache.length > 0) {
      log("Execute the cached command function with its arguments.");
      commandFunction(...args);
    }

    console.log("Command executed:", commandFunction.name, args);
  } catch (error) {
    console.error("Error executing command:", command, error);
  }
};
