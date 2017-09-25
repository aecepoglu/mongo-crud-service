const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;

var Service = require("./index");

describe("Basic Usage", function() {
	var myService;

	before(function() {
		var MONGO_URL = process.env["MONGO_URL"] || "mongodb://localhost/test";

		return require("mongodb").MongoClient.connect(MONGO_URL)
		.then(function(db) {
			myService = new Service(db, "testrecords");
		});
	});

	describe("list()", function() {
		before(function() {
			var promises = [
				{a: "ahmet", b: {c: "emre"}},
				{a: "ned", b: {c: "stark"}},
			].map(function(it) {
				return myService.create(it);
			});

			return Promise.all(promises);
		});

		it("should list all data", function() {
			return expect(myService.list()).to.eventually.have.length(2);
		});
	})
});
