const ObjectID = require("mongodb").ObjectID;
const flattenMongoQuery = require("mongo-dot-notation").flatten;

function marshal(x) {
	x.id = x._id;

	return x;
};

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

	create(props) {
		return this.collection.insertOne(props)
		.then(function(it) {
			return it.ops[0];
		})
		.then(marshal);
	}

	list(filter) {
		return this.collection.find(flattenMongoQuery(filter))
		.toArray()
		.then(function(list) {
			list.forEach(marshal);

			return list;
		});
	};

	show(id) {
		return this.collection.findOne({_id: ObjectID(id)})
		.then(function(x) {
			if (!x) {
				throw new Error("No such record found with ID: " + id);
			}

			return x;
		})
		.then(marshal);
	};

	update(id, modifications) {
		return this.collection.findAndModify(
			{_id: ObjectID(id)},
			undefined,
			flattenMongoQuery(modifications),
			{
				new: true, //return the modified body
				upsert: false
			}
		)
		.then(function(it) {
			return it.value;
		})
		.then(marshal);
	};

	remove(id) {
		return this.collection.findOneAndDelete({_id: ObjectID(id)})
		.then(function(it) {
			return it.value;
		})
		.then(function(dataJob) {
			if (!dataJob) {
				throw new Error("No documents deleted." +
					" Make sure the document with ID " +
					id + " exists before deleting it."
				);
			}

			return dataJob;
		})
		.then(marshal);
	};
}

module.exports = CrudService;
