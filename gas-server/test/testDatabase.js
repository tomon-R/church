// Step 1: Define the PersonTest class
class PersonTest {
	constructor(name, sex, age) {
		this.name = name;
		this.sex = sex;
		this.age = age;
	}
}

function testDatabase() {
	// Step 2: Create a Database instance for the PersonTest class
	const dbName = "PersonTest";
	const db = new Database(dbName, PersonTest);

	// Step 3: Test Data
	const person1 = new PersonTest("David", "male", 25);
	const person2 = new PersonTest("Anna", "female", 30);

	// Step 4: Test Creating Entries
	Logger.log("=== Creating Entries ===");
	const createResponse1 = db.create("001", person1);
	Logger.log(`Create 001: ${createResponse1.message}`);

	const createResponse2 = db.create("002", person2);
	Logger.log(`Create 002: ${createResponse2.message}`);

	// Step 5: Test Getting Entries
	Logger.log("=== Getting Entries ===");
	const getResponse1 = db.get("001");
	Logger.log(`Get 001: ${JSON.stringify(getResponse1.data)}`);

	const getResponse2 = db.get("002");
	Logger.log(`Get 002: ${JSON.stringify(getResponse2.data)}`);

	// Step 6: Test Upserting Entries
	Logger.log("=== Upserting Entries ===");
	const updatedPerson = new PersonTest("David", "male", 26);
	const upsertResponse = db.upsert({ "001": updatedPerson });
	Logger.log(`Upsert 001: ${upsertResponse.message}`);

	const getUpdatedResponse = db.get("001");
	Logger.log(`Get Updated 001: ${JSON.stringify(getUpdatedResponse.data)}`);

	// Step 7: Test Validation
	Logger.log("=== Validation ===");
	const invalidObject = { name: "John", sex: "male" }; // Missing age field
	const validateResponse = db.validate_(invalidObject);
	Logger.log(`Validate Invalid Object: ${validateResponse}`);

	// Step 8: Test Deleting Entries
	Logger.log("=== Deleting Entries ===");
	const deleteResponse = db.delete("001");
	Logger.log(`Delete 001: ${deleteResponse.message}`);

	const getAfterDeleteResponse = db.get("001");
	Logger.log(`Get 001 After Delete: ${getAfterDeleteResponse.message}`);
}
