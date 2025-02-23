/**
 * Represents a database stored in Google Sheets.
 *
 * Available Methods:
 * - get(id)
 * - getAll(ids)
 * - contains(id)
 * - upsert(object)
 * - create(id, object)
 * - createAll(object)
 * - delete(id)
 * - deleteAll(ids)
 */
class Database {
	/**
	 * Creates an instance of Database.
	 * @param {string} databaseName - The name of the Google Sheets database.
	 * @param {Function} Constructor - The constructor function defining the schema.
	 * @throws {Error} If the constructor is not provided when creating a new sheet.
	 */
	constructor(databaseName, Constructor) {
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		let sheet = spreadsheet.getSheetByName(databaseName);

		if (!sheet && typeof Constructor !== "function") {
			throw new Error("You need to provide a constructor");
		} else if (!sheet) {
			sheet = spreadsheet.insertSheet(databaseName);
			sheet.setName(databaseName);
			const metadata = {
				constructor: Constructor.name,
				fields: Object.keys(new Constructor()),
			};
			sheet.getRange("A1").setValue(JSON.stringify(metadata));
		}

		this.sheet_ = sheet;
		this.pull_();
	}

	/**
	 * Returns the maximum chunk size for JSON data storage.
	 * @returns {number} The chunk size limit.
	 */
	static CHUNK_SIZE() {
		return 49000;
	}

	/**
	 * Loads data from the Google Sheet into memory.
	 * @private
	 * @throws {Error} If metadata cannot be read.
	 */
	pull_() {
		let sheet = this.sheet_;
		try {
			const metadata = JSON.parse(sheet.getRange("A1").getValue());
			this.metadata = metadata;
			if (!Array.isArray(metadata.fields) || metadata.fields.length < 1) {
				throw new Error();
			}
		} catch (e) {
			const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
			const sheetId = this.sheet_.getSheetId();
			const url = spreadsheet.getUrl() + "#gid=" + sheetId;
			throw new Error(
				`Cannot read metadata from database. Check ${url} to see if they are input correctly.`
			);
		}

		const lastRow = sheet.getLastRow();
		const lastColumn = sheet.getLastColumn();

		if (lastRow < 2) {
			this.allData_ = {};
			this.total = 0;
			this.ids = [];
			return;
		}

		const dataRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
		const data = dataRange.getValues();

		const allData = {};
		const ids = [];

		for (let row of data) {
			const id = row[0];
			row.shift();
			const stringList = row;
			allData[id] = JSON.parse(stringList.join(""));
			ids.push(id);
		}

		this.allData_ = allData;
		this.total = ids.length;
		this.ids = ids;
	}
	/**
	 * Stores in-memory data back to the Google Sheet.
	 * @private
	 */
	push_() {
		let sheet = this.sheet_;
		const allData = this.allData_;

		this.ids.sort((a, b) => {
			const aStartsWithCapital = /^[A-Z]/.test(a);
			const bStartsWithCapital = /^[A-Z]/.test(b);

			// If one starts with capital and other doesn't, prioritize capital
			if (aStartsWithCapital && !bStartsWithCapital) return -1;
			if (!aStartsWithCapital && bStartsWithCapital) return 1;
			// If both are capital or both are not, do normal string comparison
			return a.localeCompare(b);
		});

		const ids = this.ids;

		let maxColumn = 1;
		for (let id of ids) {
			const dataString = JSON.stringify(allData[id]);
			const chunks = [];
			for (let i = 0; i < dataString.length; i += Database.CHUNK_SIZE()) {
				chunks.push(dataString.substring(i, i + Database.CHUNK_SIZE()));
			}
			allData[id] = chunks;
			if (maxColumn < chunks.length) {
				maxColumn = chunks.length;
			}
		}

		const dataField = [JSON.stringify(this.metadata)].concat(
			new Array(maxColumn)
		);

		const dataRows = ids.map((id) => {
			const chunks = allData[id];
			const empties = new Array(maxColumn - chunks.length);
			const row = [id].concat(chunks, empties);
			return row;
		});

		const updateRows = [dataField].concat(dataRows);

		sheet.clear();
		const dataRange = sheet.getRange(
			1,
			1,
			updateRows.length,
			maxColumn + 1
		);
		dataRange.setValues(updateRows);
	}

	updateAllDataWith_(object) {
		for (let id in object) {
			this.allData_[id] = object[id];
		}
		this.ids = Object.keys(this.allData_);
		this.total = this.ids.length;
	}

	validate_(object) {
		const field = Object.keys(object);
		const metadata = this.metadata;

		let Constructor;
		try {
			if (typeof this[metadata.constructor] === "function") {
				Constructor = this[metadata.constructor];
			} else if (typeof eval(metadata.constructor) === "function") {
				Constructor = eval(metadata.constructor);
			} else {
				throw new Error(
					`Constructor ${metadata.constructor} not found`
				);
			}
		} catch (e) {
			throw new Error(
				`Constructor ${metadata.constructor} could not be resolved: ${e.message}`
			);
		}

		const exceed = field.filter((one) => !metadata.fields.includes(one));

		if (!(object instanceof Constructor)) {
			return false;
		} else if (exceed.length > 0) {
			Logger.log(
				`WARNING: the following data will not be stored since they are exceeded to data field: [${exceed.join(
					","
				)}]`
			);
			return true;
		} else {
			return true;
		}
	}

	/**
	 * Retrieves an entry by its ID.
	 * @param {string} id - The unique ID of the entry.
	 * @returns {Response} The retrieved entry or an error message.
	 */
	get(id) {
		if (typeof id !== "string") {
			return new Response(400, "Input was not a string", null);
		}
		if (!this.ids.includes(id)) {
			return new Response(404, "Id not found", null);
		}

		try {
			const returnData = this.allData_[id];
			return new Response(200, "Success", returnData);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	getAll(ids) {
		if (!Array.isArray(ids)) {
			return new Response(400, "Input was not an array", null);
		}
		const notFound = ids.filter((id) => !this.ids.includes(id));
		if (notFound.length > 0) {
			return new Response(
				404,
				`Ids ${notFound.join(", ")} not found`,
				null
			);
		}

		try {
			let returnData = {};
			for (let id of ids) {
				returnData[id] = this.allData_[id];
			}
			return new Response(200, "Success", returnData);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	contains(id) {
		if (typeof id !== "string") {
			return new Response(400, "Input was not a string", null);
		}
		if (this.ids.includes(id)) {
			return new Response(200, "Success", true);
		} else {
			return new Response(200, "Success", false);
		}
	}

	upsert(object) {
		if (typeof object !== "object" || object === null) {
			return new Response(400, "Input was not an object", null);
		}

		const notValid = Object.keys(object).filter(
			(id) => !this.validate_(object[id])
		);
		if (notValid.length > 0) {
			return new Response(
				400,
				`Invalid object structure for ids: [${notValid.join(", ")}]`,
				null
			);
		}

		try {
			this.updateAllDataWith_(object);
			this.push_();
			this.pull_();
			return new Response(200, "Success", object);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	create(id, object) {
		if (typeof id !== "string") {
			return new Response(400, "Invalid input", null);
		}
		if (this.ids.includes(id)) {
			return new Response(400, `Already exists: ${id}`, null);
		}
		if (!this.validate_(object)) {
			return new Response(400, "Invalid object structure", null);
		}
		if (Object.keys(object).length === 0) {
			return new Response(400, "Cannot create with empty object", null);
		}

		try {
			this.allData_[id] = object;
			this.updateAllDataWith_(this.allData_);
			this.push_();
			this.pull_();
			return new Response(200, "Success", null);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	createAll(object) {
		if (typeof object !== "object" || object === null) {
			return new Response(400, "Invalid input", null);
		}

		const notValid = Object.keys(object).filter(
			(id) => !this.validate_(object[id])
		);
		if (notValid.length > 0) {
			return new Response(
				400,
				`Invalid object structure for ids: [${notValid.join(", ")}]`,
				null
			);
		}

		const found = Object.keys(object).filter((id) => this.ids.includes(id));
		if (found.length > 0) {
			return new Response(
				400,
				`Already exists: ${found.join(", ")}`,
				null
			);
		}

		try {
			this.updateAllDataWith_(object);
			this.push_();
			this.pull_();
			return new Response(200, "Success", null);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	delete(id) {
		if (typeof id !== "string") {
			return new Response(400, "Input was not a string", null);
		}
		if (!this.ids.includes(id)) {
			return new Response(404, "Id not found", null);
		}

		try {
			const data = this.allData_[id];
			delete this.allData_[id];
			this.ids = this.ids.filter((id_) => id_ !== id);
			this.total = this.ids.length;
			this.push_();
			this.pull_();
			return new Response(200, "Success", data);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}

	deleteAll(ids) {
		if (!Array.isArray(ids)) {
			return new Response(400, "Input was not an array", null);
		}
		const notFound = ids.filter((id) => !this.ids.includes(id));
		if (notFound.length > 0) {
			return new Response(
				404,
				`Ids ${notFound.join(", ")} not found`,
				null
			);
		}

		try {
			for (let id of ids) {
				delete this.allData_[id];
			}
			this.ids = this.ids.filter((id) => !ids.includes(id));
			this.total = this.ids.length;
			this.push_();
			this.pull_();
			return new Response(200, "Success", null);
		} catch (e) {
			return new Response(500, `${e.message}`, null);
		}
	}
}
