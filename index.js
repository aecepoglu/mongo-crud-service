const ObjectID = require("mongodb").ObjectID;
const flatten = require("object-squish");

class CrudService {
	constructor(mongoDB, collectionName) {
		if (!mongoDB) {
			throw new Error("mongoDB is required");
		}
		if (!collectionName) {
			throw new Error("collectionName is required");
		}

		this.collection = mongoDB.collection(collectionName);
	}

	marshal(x) {
		return x;
	}

	create(props) {
		return this.collection.insertOne(props)
		.then(function(it) {
			return it.ops[0];
		})
		.then(this.marshal);
	}

	list(filter) {
		return this.collection.find(flatten(filter))
		.toArray()
		.then(function(list) {
			list.forEach(this.marshal);

			return list;
		}.bind(this));
	}

	show(id) {
		return this.collection.findOne({_id: ObjectID(id)})
		.then(function(x) {
			if (!x) {
				throw new Error("No such record found with ID: " + id);
			}

			return x;
		})
		.then(this.marshal);
	}

	update(id, modifications) {
		return this.collection.findAndModify(
			{_id: ObjectID(id)},
			undefined,
			{$set: flatten(modifications)},
			{
				new: true, //return the modified body
				upsert: false
			}
		)
		.then(function(it) {
			if (!it.value) {
				throw new Error("no records found or updated");
			}

			return it.value;
		})
		.then(this.marshal);
	}

	remove(id) {
		return this.collection.findOneAndDelete({_id: ObjectID(id)})
		.then(function(it) {
			if (!it.value) {
				throw new Error("No documents deleted.");
			}

			return it.value;
		})
		.then(this.marshal);
	}

	setMarshaller(marshal) {
		this.marshal = marshal;

		return this;
	}

	static idMarshaller(x) {
		x.id = x._id;
		return x;
	}
}

module.exports = CrudService;
