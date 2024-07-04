//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length == 0)
    {
      Item.insertMany(defaultItems, function(err)
      {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to db");
        }
      }); 
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(); 
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name: itemName
  });
  
  if(listname === "Today"){
    item.save();
    res.redirect("/");
  } else {
    list.findOne({name: listname}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);
    });
  }
  
});

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listname = req.body.listname;

  if(listname === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err) {
        console.log("Succesfully deleted an item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listname}, {$pull: {items: {_id: }}}, function(err, foundList))
    if(!err){
      res.redirect("/" + listname);
    }
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
