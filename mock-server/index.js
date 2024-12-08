// mock-server/index.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const apiFunctions = {};

// Helper function to dynamically load all files from a directory
function loadFunctionsFromDirectory(directoryPath) {
	fs.readdirSync(directoryPath).forEach((file) => {
		if (file.endsWith(".js") || file.endsWith(".ts")) {
			const functionName = path.basename(file, path.extname(file));
			const modulePath = path.join(directoryPath, file);
			import(modulePath).then((module) => {
				apiFunctions[functionName] = module[functionName];
			});
		}
	});
}

// Load all API functions from the 'api' directory
const apiDirectoryPath = path.resolve("./api");
loadFunctionsFromDirectory(apiDirectoryPath);

// Load all configuration functions from the 'config' directory
const configDirectoryPath = path.resolve("./config");
loadFunctionsFromDirectory(configDirectoryPath);

// Main API endpoint
app.post("/api", async (req, res) => {
	const { function: funcName, parameters } = req.body;

	if (apiFunctions[funcName]) {
		try {
			// Call the requested function with provided parameters
			const result = await apiFunctions[funcName](parameters);
			return res.json({ response: { result } });
		} catch (error) {
			console.error(`Error executing ${funcName}:`, error);
			return res.status(500).json({ error: error.message });
		}
	} else {
		return res.status(400).json({ error: "Unknown function" });
	}
});

app.listen(8080, () => {
	console.log("Mock API server running on port 8080");
});
