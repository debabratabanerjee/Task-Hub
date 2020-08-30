const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth.js')



router.post("/task",auth, async (req, res) => {

    try {
        const task = new Task({
            ...req.body,
            owner:req.user._id
        });

        await task.save()
        if(!task)
            return res.status(404).send("No Task Updated")
        res.status(201).send(task)
        console.log("Success")
    } catch (err) {
        res.status(404).send(err)
        console.log(err)    
    }

})

//getting all user


//get task by ID


//update method here **---Patch


router.patch('/task/:id',auth, async (req,res)=>{

    const updates = Object.keys(req.body)
    const id = req.params.id;
    const allowed = ['completed']
    const isValidate = updates.every((update)=>allowed.includes(update))
    // console.log(updates)

    if(!isValidate)
        return res.status(402).send({"Error":"operation not allowed"})
    
    try {
        const task =await Task.findOne( { _id: id, owner : req.user._id } )    
        // console.log(task)
        if(!task)
        return res.status(404).send({error:'No Task Found'})    
        updates.forEach(element =>{
            task[element]=req.body[element]
        } )
        await task.save();
        //const task = await Task.findByIdAndUpdate(id,req.body,{new :true,runValidators:true})
   
        res.send(task)

    } catch (error) {
        console.log(error)
        res.status(404).send(error)
    }

})
//getting single task
router.get("/task/:id",auth, async (req, res) => {

    try {
        const taskId = req.params.id
        //console.log(req.user.id)
        //const task = await Task.findById(taskId)
        const task = await Task.findOne( {_id : taskId, owner : req.user.id} )
        if (!task) {
            return res.status(404).send({error: 'No task found'})
        }
        res.send(task)
    } catch (err) {
        console.log(err)
        res.status(403).send()
    }


})



router.delete("/task/:id",auth,  async (req, res) => {

    try {
        const taskId = req.params.id
        const task = await Task.findOne(  {_id: taskId, owner: req.user._id} )
        if (!task) {
            return res.status(404).send({'error':'No Task Found'})
        }   
        await task.remove()
        res.send(task)
    } catch (err) {
        res.status(404).send(err)
    }
})



//Getting All task
router.get("/task",auth , async (req, res) => {

    //console.log(typeof req.query.completed)     //query comes under String but req.user comes as object

    const match = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    const sorting = req.query.sortBy;
    const value ={}
    if(sorting)
    {
        const s = sorting.split(':')
        value[s[0]] = s[1] === 'desc' ? -1 : 1
        
    }
    try {
        //const taskId = req.params.id
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort : value               
            }
        }).execPopulate();
        res.send(req.user.tasks)
    } catch (err) {
        console.log(err)
        res.status(404).send()
    }

})

module.exports = router