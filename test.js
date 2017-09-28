const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;
const mongo = require("mongodb");

var Service = require("./index");

describe("Basic Usage", function() {
	var myService;
	var collection;
	var records;

	function sortById(a, b) {
		if (a._id < b._id) {
			return -1;
		} else if (a._id > b._id) {
			return +1;
		} else {
			return 0;
		}
	}

	function myMarshaller(it) {
		it.ID = it._id;
		return it;
	}

	before(function() {
		const COLLECTION_NAME = "testrecords";

		var MONGO_URL = process.env["MONGO_URL"] || "mongodb://localhost/test";

		return mongo.MongoClient.connect(MONGO_URL)
		.then(function(db) {
			myService = new Service(db, COLLECTION_NAME)
			.setMarshaller(myMarshaller);

			collection = db.collection(COLLECTION_NAME);

			return collection.insertMany([
				{name: "brian", surname: "vaughan"},
				{name: "fiona", surname: "staples"},
				{name: "brian", surname: "azzarello"},
			]);
		}).then(function(insertions) {
			records = insertions.ops
			.sort(sortById)
			.map(myMarshaller);
		});
	});

	after(function() {
		collection.drop();
	});

	describe("create()", function() {
		var createdRecord;

		before(function() {
			return myService.create({name: "ahmet", otherName: "emre"})
			.then(function(it) {
				createdRecord = it;
			});
		});

		after(function() {
			return collection.remove({_id: createdRecord._id});
		});

		it("should create and return a model with given values", function() {
			expect(createdRecord).to.have.property("name", "ahmet");
			expect(createdRecord).to.have.property("otherName", "emre");
			expect(createdRecord).to.have.property("ID");
		});
	});

	describe("list()", function() {
		it("should list all data", function() {
			return expect(myService.list().then(function(it) {
				return it.sort(sortById);
			})).to.eventually.deep.equal(records);
		});

		it("should list only filtered results", function() {
			return expect(myService.list({name: "brian"})).eventually.have.lengthOf(2);
		});

		it("should have marshalled results", function() {
			return expect(myService.list()
			.then(function(results) {
				return results[0];
			})).to.eventually.have.property("ID");
		});
	});

	describe("show()", function() {
		var theRecord;

		before(function() {
			theRecord = records[0];
		});

		it("should return the record with given id", function() {
			return expect(myService.show(theRecord._id)).to.eventually.deep.equal(theRecord);
		});

		it("should fail if the given id can't be found", function() {
			return expect(myService.show("123456789123")).to.eventually.be.rejected;
		});

		it("should have marshalled results", function() {
			return expect(myService.show(theRecord._id)).to.eventually.have.property("ID");
		});
	});

	describe("update()", function() {
		var theRecord;

		before(function() {
			return collection.insertOne({name: "alan", surname: "moore"})
			.then(function(it) {
				theRecord = it.ops[0];
			});
		});

		after(function() {
			return collection.remove({_id: theRecord._id});
		});

		it("should patch the record with given id and return it", function() {
			return expect(myService.update(theRecord._id, {
				name: undefined,
				surname: "miranda",
				newKey: "new value"
			})).to
			.eventually.deep.equal({
				_id: theRecord._id,
				ID: theRecord._id,
				name: null,
				surname: "miranda",
				newKey: "new value"
			});
		});

		it("should fail if the record cannot be found", function() {
			return expect(myService.update("123123123123", {a: "b"})).to.eventually.be.rejected;
		});
	});

	describe("remove()", function() {
		var theRecord;

		beforeEach(function() {
			return collection.insertOne({name: "kazuo", surname: "koike"})
			.then(function(it) {
				theRecord = it.ops[0];

				return collection.findOne({_id: theRecord._id})
			}).then(function(it) {
				expect(it).not.to.be.undefined;
			});
		});

		afterEach(function() {
			return collection.remove({_id: theRecord._id});
		});

		it("should remove the record with given id", function() {
			return myService.remove(theRecord._id)
			.then(function() {
				return collection.findOne({_id: theRecord._id})
				.then(function(recordFoundAfterDeletion) {
					expect(recordFoundAfterDeletion).not.to.be.undefined;
				});
			});
		})

		it("should fail if record with given id doesn't exist", function() {
			return expect(myService.remove("123123123123")).to.eventually.be.rejected;
		});
	});
});

describe("Advanced Usage", function() {
	before(function() {
		const COLLECTION_NAME = "advrecords";

		var MONGO_URL = process.env["MONGO_URL"] || "mongodb://localhost/test";

		class MyService extends Service {
			create(props) {
				props.insertedValue = "an inserted value";

				return super.create(props);
			}
		}

		return mongo.MongoClient.connect(MONGO_URL)
		.then(function(db) {
			myService = new MyService(db, COLLECTION_NAME);
			collection = db.collection(COLLECTION_NAME);
		});
	});

	after(function() {
		return collection.drop();
	});

	it("create() will call our method", function() {
		return expect(myService.create({name: "aec"}))
		.to.eventually.have.property("insertedValue", "an inserted value");
	});
});
