const express = require('express')
require("./db/mongoose.js")
const path = require('path')

//imorting user from Users.js
const User = require('./models/users.js')
const Task = require('./models/task.js')
const { update, updateMany } = require('./models/users.js')

const userRouter = require('./routers/userRouters')
const taskRouter = require('./routers/taskRouter')


const app = express()
const port = process.env.PORT


// app.use((req,res,next)=>{
//     const isMaintain = check()
//     if(isMaintain)
//         res.status(503).send("server is Under Maintanance")
//     else
//         next()
// })
// const check = ()=>{
//     return true;
// }
const publicDirect = path.join(__dirname,'../public/views')

app.set('view engine', 'hbs')
app.set('views',publicDirect );

//convert json formate to object
app.use(express.json())

app.use(express.static(publicDirect));
//Using router
app.use(userRouter)
app.use(taskRouter)




// use of populating field

const myFun = async()=>{
    // const task = await Task.findById("5f3fcc16fae68932a48a9c0f")
    // console.log(task)
    // const user  = await User.findById(task.owner)
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById("5f3fcbfdfae68932a48a9c0d")
    //console.log(user)
    await user.populate('tasks').execPopulate() //the name where we define the relation   ******
    console.log(user.tasks)

}

app.listen(port, () => {
    console.log("Server is up on " + port)
})





