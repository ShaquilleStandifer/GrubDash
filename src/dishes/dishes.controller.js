const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//Functional Middleware functions:
//function to confirm if dish exist
function dishExists(req, res, next){
   const dishId = req.params.dishId;
   res.locals.dishId = dishId; //retrieve local variables
   const foundDish = dishes.find((dish) => dish.id === dishId);
   if (!foundDish) {
      //if dish is not found, return 404 status/message
      return next({
         status: 404, 
         message: `Dish not found: ${dishId}` });
   }
   res.locals.dish = foundDish;
};

function dishValidName(req, res, next){
   const { data = null } = req.body;
   res.locals.newDD = data;
   const dishName = data.name;
   if (!dishName || dishName.length === 0) {
      //return message if there is no dishName
      return next({
         status: 400,
         message: "Dish must include a name",
      });
   }
};

function dishHasValidDescription(req, res, next){
   const dishDescription = res.locals.newDD.description; //retrieve descriptions and assign to variable.
   if (!dishDescription || dishDescription.length === 0) {
      //if no description or description = 0, return message.
      return next({
         status: 400,
         message: "Dish must include a description",
      });
   }
};

function dishHasValidPrice(req, res, next){
   const dishPrice = res.locals.newDD.price;
   if (!dishPrice || typeof dishPrice != "number" || dishPrice <= 0) {
      return next({
         status: 400,
         message: "Dish must have a price that is an integer greater than 0",
      });
   }
};

function dishHasValidImage(req, res, next){
   const dishImage = res.locals.newDD.image_url;
   if (!dishImage || dishImage.length === 0) {
      return next({
         status: 400,
         message: "Dish must include an image_url",
      });
   }
};

function dishIdMatches(req, res, next){
   const paramId = res.locals.dishId;
   const { id = null } = res.locals.newDD;
   if (paramId != id && id) {
      return next({
         status: 400,
         message: `Dish id does not match route id. Dish: ${id}, Route: ${paramId}`,
      });
   }
};

//Clarity Middleware Functions
function createValidation(req, res, next){
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   next();
};

function readValidation(req, res, next){
   dishExists(req, res, next);
   next();
};

function updateValidation(req, res, next){
   dishExists(req, res, next);
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   dishIdMatches(req, res, next);
   next();
};

//Handlers:

//function to create a new dish
function createDish(req, res) {
   const newDishData = res.locals.newDD; //retrieve new dish data
   newDishData.id = nextId();
   dishes.push(newDishData); //add new dish to existing dishes
   res.status(201).json({ data: newDishData });
}

function read(req, res) {
   res.status(200).json({ data: res.locals.dish });
}

//function to update dishes
function updateDish(req, res) {
   const newData = res.locals.newDD; //assign new dish to newData variable
   const oldData = res.locals.dish; //assign original dishes to oldData variable
   const index = dishes.indexOf(oldData);
   for (const key in newData) {
      dishes[index][key] = newData[key]; //update dishes
   }
   res.status(200).json({ data: dishes[index] });
}

function list(req, res) {
   res.status(200).json({ data: dishes }); //retrieve and list orders
}

module.exports = {
   create: [createValidation, createDish],
   read: [readValidation, read],
   update: [updateValidation, updateDish],
   list,
};