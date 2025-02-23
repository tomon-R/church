# Server Design

Building upon Google App Script and Spreadsheet.

## Database design

Database object is defined in `gas-server/database/Database.js`.

This `Database` class is a Google Apps Script (GAS) utility that provides a structured way to store, retrieve, update, and delete data in a Google Sheets spreadsheet, treating it as a simple database.

### How to use

1. Define a class to store
2. Define a Database
3. Access the Database with methods

Example:

1. Define a class to store

```javascript
class Person {
	constructor(
		id,
		name,
		age,
		gender,
		interests,
		friends,
		teachingProgress,
		type
	) {
		this.id = id;
		this.name = name;
		this.age = age;
		this.gender = gender;
		this.interests = interests;
		this.friends = friends;
		this.teachingProgress = teachingProgress;
		this.type = type;
	}
}
```

2. Define a Database

```javascript
const db = new Database("PersonsDB", Person);
```

3. Access the Database with methods

```javascript
const person1 = new Person(
	123,
	"John",
	0,
	0,
	"cooking, fishing",
	friendsList,
	teachingProgress,
	type
);

db.create(person1.id, person1);
```

### Available methods

    - `get(id)`: Retrieve a single record by ID.
    - `getAll(ids)`: Retrieve multiple records (expects an array of IDs).
    - `contains(id)`: Check if an ID exists.
    - `upsert(object)`: Insert or update multiple records.
    - `create(id, object)`: Insert a new record.
    - `createAll(object)`: Insert multiple new records.
    - `delete(id)`: Remove a single record.
    - `deleteAll(ids)`: Remove multiple records.
