mongo-crud-service
===================

A simple extensible mongo service with CRUD operations.

## Sample

```javascript
var MongoCrudService = require("mongo-crud-service");

var BookService = MongoCrudService(
	db, /*node-mongo db instance*/
	"books" /*collection name*/
)
```

## API

### new MongoCrudService(db, collectionName)

* `db`: node-mongo db instance. See the *Basic Usage* example below for where you can find it
* `collectionName`: name of collection in db

Returns a `MongoCrudService` instance

### MongoCrudService instance methods:

* `create(props)` returns `Promise`
* `list(filter)` returns `Promise`
* `show(id)` returns `Promise`
* `update(id, props)` returns `Promise`
* `remove(id)` returns `Promise`

### Basic Usage

```javascript
var MongoCrudService = require("mongo-crud-service");

/* establish a mongo connection */
require("mongodb").MongoClient.connect("mongodb://...")
.then(function(mongoConnection) {
	return mongoConnection.db;
})
.then(function(db) {
	class BookService = new MongoCrudService(db, "books");

	BookService.create({
		name: "iRobot",
		author: "Isaac Asimov"
	}).then(function(createdBook) {
		console.log("created book with id : " + createdBook._id);
	});

	BookService.list().then(function(books) {
		console.log("there are " + books.length + " books");
		//...
	});

	BookService.show("ID_OF_A_BOOK").then(function(book) {
		console.log("found book with id: " + book._id);
	});

	BookService.update("ID_OF_A_BOOK", {
		name: "new name of book"
	}).then(function(updatedBook) {
		console.log("updated book with id: " + book._id);
	});

	BookService.remove("ID_OF_A_BOOK").then(function() {
		console.log("removed book with id: ID_OF_A_BOOK");
	});
});
```

### Advanced Usage

TODO
