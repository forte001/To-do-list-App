const express = require('express')

const bodyParser = require('body-parser')

const date = require(__dirname+"/date.js")

const mongoose = require('mongoose');

const _ = require('lodash');

const app = express()



let items = [];
let workItems = [];

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true});

const itemSchema = {
  name:{
    type: String,
    required: [true, "Title field is required"]
  },

}

const Item = mongoose.model("Item", itemSchema);

// const item1 = new Item({
//   name: "Test item1"
// });
//
// const item2 = new Item({
//   name: "Test item2"
// });
// const item3 = new Item({
//   name: "Test item3"
// });

const defaultItems = [];

const taskListSchema = {
  name: String,
  items: [itemSchema]
}
const TaskList = mongoose.model("TaskList", taskListSchema);

let taskList = TaskList

// Route for deleting task list
app.post("/deleteList", function(req,res){
  selectedListId = req.body.removeList;
  TaskList.findByIdAndRemove(selectedListId, function(err, removedItem){
    if (!err){
    res.redirect("/")
    }
  })

})

// Renders the Home page alongside the Task lists in the database
app.get("/", function(req,res){
  // retrieves all tasklists from mongodb
  TaskList.find({}, function(err, foundTaskList){
  res.render("index", {taskList:foundTaskList})
  })

})

// Route for the creating new task list
app.post("/", function(req,res){
  // data collected from the html form
  newList = _.capitalize(req.body.newList);

  // checks if task list already exist in database
  TaskList.findOne({name:newList}, function(err, foundList){
    if (!err) {
      if (!foundList){
        // Creates a new list if it doesn't exist
        taskList = new TaskList({
          name: newList,
          items: defaultItems
      })
      // saves the new task list
      taskList.save();
      // Redirects to the new task list
      res.redirect("/" + newList);

  } else {
    // This is rendered if task list already exists
    res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
  }
}
})
})

// For adding items to an already created task list
app.post('/', function(req,res){

  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.addItem);
  const item = new Item({
   name: itemName
  });
  TaskList.findOne({name:listName}, function(err, foundList){
    if (!err){
      if(!foundList){
        // Creates a new list
        taskList = new TaskList({
          name: newList,
          items: defaultItems
      })
      taskList.save();
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);

    }
    }
  })

});

// Deletes item(s) from a specific task list
app.post("/delete", function(req, res){
  const selectedItemId = req.body.removeItem;
  const listName = req.body.listName;
   TaskList.findOneAndUpdate({name: listName}, {$pull: {items: {_id: selectedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
   })


})



// Creates task list using routing parameters
app.get('/:taskListName', function(req,res){
  const taskListName = _.capitalize(req.params.taskListName)
  //console.log(taskListName);
  TaskList.findOne({name:taskListName}, function(err, foundList){
    if (!err) {
      if (!foundList){
        // Creates a new list
        taskList = new TaskList({
          name: taskListName,
          items: defaultItems
      })
      taskList.save();
      res.redirect("/" + taskListName);

  } else {
    res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
  }


}
})
});

// Server and port connectivity setup
let port = process.env.PORT || 3000
app.listen(port, function(){
  console.log('Server running on port '+port);
})
