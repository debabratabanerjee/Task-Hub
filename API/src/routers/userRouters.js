const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp = require('sharp')
const emailServie = require('../email/account.js')
//const { updateMany } = require('../models/users')



//getting profile after authenticaton
router.get("/users/me", auth,async (req, res) => {
    try {
       const user = await req.user
        res.status(200).send(user)
    } catch (err) {
        res.status(404).send(err)
    }
})



//getting all user Just for Testing perpose
// router.get("/users", async (req, res) => {
//     try {
//        const user = await User.find({})
//         res.send(user)
//     } catch (err) {
//         res.send(err)
//     }
// })

// router.get("/users/me", auth,async (req, res) => {

//     try {
//         //const myId = req.params.id
//         //console.log("At first Pos")
//        const user =await User.findById(req.user)
//        console.log(user)
//         if (!user)
//             return res.status(404).send()
//         res.status(200).send(user)
//     } catch (err) {
//         console.log(err)
//         res.status(403).send()
//     }
// })




//update method here **---Patch

router.patch("/users/me", auth, async (req, res) => {

    const myId = req.user._id
    const updates = Object.keys(req.body)
    const allowed = ['name','password','email',"age"]
    const isValid = updates.every((update)=>allowed.includes(update))

    if(!isValid)
        return res.status(402).send({"error":"Request Field can't be Changes"})
        
    try {

        const user = await User.findById(myId)
        updates.forEach((element) => {
            user[element] = req.body[element]
        });
       //directly update without validate 
      // const user =  await User.findByIdAndUpdate(myId,req.body,{ new:true, runValidators:true })
      await user.save();

        if (!user)
            return res.status(404).send()
        res.status(200).send(user)
    } catch (err) {
        res.status(403).send(err)
    }
})




router.delete("/users/me", auth, async (req, res) => {

    try {
        // const userID = req.user._id
        // const user = await User.findByIdAndDelete(userID)
        // if (!user) {
        //     return res.status(404).send({'error':'No user Found'})
        // }
        // *---- another Way can be ----**
       
        await req.user.remove()
        emailServie.sendDeleteEmail(req.user.email,req.user.name);
        res.send(req.user)
    } catch (err) {
        console.log(err)
        res.status(404).send(err)
    }
})

//User Logout
router.post('/users/logout',auth, async(req,res)=> {

    try {
        console.log(req.token)
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        })
        await req.user.save()
        res.send({message : 'success'})
    } catch (error) {
        res.status(500).send(error)
    }
})

//logout ALL
router.post('/users/logoutAll',auth, async(req,res)=> {

    try {
        //console.log(req.token)
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

//User Loging Here** 

router.post('/users/login',async (req,res)=> {

    //console.log(req.body.email+" "+ req.body.password)
    try {
        const user =await  User.findByCredentails(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({
            user,token
        })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})


//SignUp
router.post("/users", async (req, res) => {
    try {
        const user = new User(req.body)

        if(!user)
            res.status(404).send({error:'No user Error'})

        await user.save()
        const token =await  user.generateToken();
        //console.log(user)
        emailServie.sendWelcomeEmail(user.email,user.name);
        res.status(201).send({user,token})
    } catch (err) {
        console.log(err)
        res.status(404).send(err)
    }


})

//seting up multer 
const upload = multer({
    // dest : 'avtar',             //can remvove DEST field to process our data
    limits : {
        fileSize : 100000       //restriction file size
    },
    fileFilter(req, file, cb) {
        
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Expecting file in Jpeg or Png formate'))      // when we trough error not desired formate is uploaded
        }
        cb(undefined,true)                                               //when desired formate is uploaded **--success
    }
})

// upload Images 
router.post('/users/me/avtar',auth ,upload.single('avtar'),async(req,res)=>{

    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer();
    req.user.avtar = buffer
   await req.user.save();
    res.send()
},(error,req,res,next) => {
    res.status(404).send({error : error.message})
})

router.delete('/users/me/avtar',auth, async(req,res)=> {
    req.user.avtar = undefined
    await req.user.save()
    res.send()
})


router.get('/users/:id/avtar',async (req, res)=> {

    try {
        const id = req.params.id
        const user = await User.findById({_id : id})
        if(!user | !user.avtar) 
            throw new Error('Something went Worng')
        res.set('Content-Type','image/jpg')
        res.send(user.avtar)
    } catch (error) {
        res.status(404).send(error)
    }
})





module.exports = router


