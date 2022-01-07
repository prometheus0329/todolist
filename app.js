const express = require("express");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@prometheus.clfqo.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true })

const itemSchema = {
    name : String
};
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name : "Eat Food"
});
const item2 = new Item({
    name : "Drink Water"
});

const item3 = new Item({
    name : "Walk 1KM"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items:[itemSchema]
}

const List = mongoose.model("List",listSchema);
app.get("/", function(req,res){

    Item.find({},function(err,results){
        
        if(results.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Success");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle : "Today" , newItem : results});
        }
    })
    
})

app.get("/:todo", function(req,res){
    const listName = _.capitalize(req.params.todo);

    List.findOne({name:listName},function(err,foundList){
        if(!err){
            if(!foundList){
                //Create New List
                const list = new List({
                    name : listName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/"+listName);
            }
            else{
                //Show List
                res.render("list",{listTitle : foundList.name , newItem : foundList.items});
            
            }
        }
    })
    

    
});

app.post("/",function(req,res){
    const itemName = req.body.newTask;
    const listName = req.body.list;
    const new_item = new Item({
        name : itemName
    });

    if(listName === "Today"){
    new_item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(new_item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
})

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({_id:checkedItemId},function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully Deleted");
            }
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        })
    }
    
})




app.get("/about",function(req,res){
    res.render("about");
});

let port = process.env.PORT;
if(port==null || port ==""){
    port = 6900;
}
app.listen(port,function(){
    console.log("Welcome to 69");
})