const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser")

//DB Config
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
//console.log(process.env.MONGO_URI)

//DB Schema
const { Schema } = mongoose; 

//DB User Schema
const UserSchema = new Schema({
  username: String,
});

//DB Exercice Schema
const ExerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});

//DB  models declarations
const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//API POST new User  
app.post("/api/users", (req, res) => {
  console.log(`req.body`, req.body)
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err, data) => {
    if(err || !data){
      res.send("There was an error saving the user")
    }else{
      res.json(data)
    }
  })
})

//API POST new Exercice
app.post("/api/users/:_id/exercises",(req,res,next)=>{
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  let userId = req.params._id
  let description = req.body.description
  let duration = req.body.duration
  let date = req.body.date
  
  console.log(date);

  if (date === "" || "undefined"){
    date = new Date().toDateString()
  } else {
    date = new Date(date).toDateString()
  }

  console.log(date);

  const expObj = {
    description,
    duration,
    date
  }

  User.findByIdAndUpdate(
    userId,
    {$push:{log:expObj}},
    {new:true},
    (err,updatedUser)=>{
      if(err) {
        console.log('update error:',err);
        return res.json('update error:', err);
      }
      
      let returnObj ={
        "_id":userId,
        "username":updatedUser.username,
        "date":expObj.date,
        "duration":parseInt(expObj.duration),"description":expObj.description
      }
      console.log(returnObj)
      return res.json(returnObj)
    }
  )  
})
//API GET Users
app.get("/api/users/:id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const {id} = req.params;
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
     }else{
      let dateObj = {}
      if(from){
        dateObj["$gte"] = new Date(from)
      }
      if(to){
        dateObj["$lte"] = new Date(to)
      }
      let filter = {
        userId: id
      }
      if(from || to ){
        filter.date = dateObj
      }
      let nonNullLimit = limit ?? 500
      Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
        if(err || !data){
          res.json([])
        }else{
          const count = data.length
          const rawLog = data
          const {username, _id} = userData;
          const log= rawLog.map((l) => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
          }))
          res.json({username, count, _id, log})
        }
      })
    } 
  })
})

//API GET Users
app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{
      res.json(data)
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
