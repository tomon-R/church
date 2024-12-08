function doGet() {
	return HtmlService.createHtmlOutputFromFile("src/index.html")
		.setTitle("web app")
		.setFaviconUrl(
			"https://drive.google.com/uc?id=1Z1f6_lOBVuZHg8i0YgIYoIdqyX0qtQaK&.png"
		);
}
