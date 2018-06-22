[ ![Codeship Status for aecepoglu/mongo-crud-service](https://app.codeship.com/projects/f377f7f0-8414-0135-7c1f-06f0d61a31a7/status?branch=master)](https://app.codeship.com/projects/247416)

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

MongoCrudService is an ECMA6 class definition; you can `extend` its behaviour. See [Advanced Usage](#advanced-usage) to see how.

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
* `marshal(it)` reformats and returns given document. See *[Marshalling](#marshalling)* section below.

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

Because mongo-crud-service uses ECMA6 class definition, it is easily extensible.

```javascript
class AdvBookService extends MongoCrudService {
	create(props) {
		props.name = props.name.toUpperCase();

		return super.create(props);
	}
}

myBookService = new AdvBookService(db, "advbooks");

myBookService.create({
	name: "Dream Catcher",
	author: "Stephen King",
}).then(function(createdBook) {
	console.log(createdBook);

	/* this will print:
	{
		_id: somethingsomethingsomething,
		name: "DREAM CATCHER",
		author: "Stephen King"
	}
	*/
});
```

#### Marshalling

To marshal/reformat the data you get from CRUD operations you can use 

* use the `setMarshaller(fun)` method. `fun` is a marshaller function as described below
    ```javascript
    function myMarshaller(it) {
    	it.fullName = it.name + " " + it.surname;
    	it.id = it._id;
    
    	return it;
    }
    
    var MyService = new MongoCrudService(...).setMarshaller(myMarshaller)
    ```
* override the `marshal()` method in your child class:
    ```javascript
    class MyServiceClass extends MongoCrudService {
    	marshal(it) {
    		// do stuff with 'it'
    		return it;
    	}
    }
    ```

`MongoCrudService.idMarshaller` is a simple marshalling function that adds an `id` field (like *mongoose* does)

```javascript
var MyService = new MongoCrudService(...).setMarshaller(MongoCrudService.idMarshaller);
```

#### Timestamps

Enable `createdAt` and `updatedAt` fields by calling `enableTimestamps()` on your `MongoCrudService` instance

```javascript
var MyService = new MongoCrudService(...).enableTimestamps()
```

#### Beyond CRUD

If you want to use other MongoDB methods, access them through `collection` of your `MongoCrudService` instance.  
This will be an instance of [*MongoDB Collection*](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html).

```javascript
var BookService = new MongoCrudService(...);
BookService.collection.count({year: {$gt: 2006}})
	.then(function(count) {
		console.log("There are " + count + " books released after 2006");
	});
```
