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
app.post('/api/users/:id/exercises',(req,res)=>{
  console.log(`req.params`,req.params)
  const id=req.params.id;
  const {description, duration, date} = req.body
  User.findById(id,(err,userData=>{
    if(err || !userData){
      res.send("Could not find user");
    }else{
      const newExercice = new Exercise({
        userId: id,
        description,
        duration,
        date: new Date(date)
      })
      newExercice.save((err,data)=>{
        if(err || !data){
          res.send("There was an error saving this exercice")
        }else{
          const {description,duration,date,_id} = data;
          res.json({
            username: userData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: userData.id

          })
        }
      })
    }
  })
})  



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
