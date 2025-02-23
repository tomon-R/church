// src/services/apiClient.js

export async function callGasApi(functionName, parameters = []) {
	return new Promise((resolve, reject) => {
		// Check if we're in Google Apps Script environment
		if (
			typeof google !== "undefined" &&
			google.script &&
			google.script.run
		) {
			try {
				google.script.run
					.withSuccessHandler((response) => resolve(response))
					.withFailureHandler((error) => reject(error))
					[functionName](...parameters);
			} catch (error) {
				console.error("Failed to call GAS function:", error);
				reject(error);
			}
		} else {
			// In development, use the mock server
			fetch("http://localhost:8080/api", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					function: functionName,
					parameters: parameters,
				}),
			})
				.then((response) => response.json())
				.then((data) => resolve(data.result))
				.catch((error) => {
					console.error(
						"Failed to get environment from mock server:",
						error
					);
					reject(error);
				});
		}
	});
}
