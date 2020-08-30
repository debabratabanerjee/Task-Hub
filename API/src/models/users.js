const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Task = require('./task')
require('dotenv').config()

//work for middle ware we can now use pre and post operation afterwards
const userSchema = new mongoose.Schema({
    //defining the parameter
    name : {
        type : String,
        required : true
        
    },  
    email : {
        type : String,
        required : true,
        lowercase:true,
        unique: true,
        trim : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter Valid Email")
            }
        }
    },
    age : {
        type : Number,
        default :0,
        validate(value){
            if(value<0){
                throw new Error("Negative Value is not allowed")
            }            
        }
    },
    password: {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate( value ){
            if(value.toLowerCase().includes('password')){
                throw new Error("Password must be 6 and donot contain password")
            }
        }
    },
    tokens : [{
        token : {
            required : true,
            type : String
        }
    }],
    avtar : {
        type : Buffer
    }
    
},
{
    timestamps:true
})           //      ||
            //******\\//
                        
userSchema.virtual('tasks', {
    ref : 'Task',
    localField : "_id",
    foreignField : 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign( {_id : user.id.toString()}, process.env.JWT )
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//
userSchema.statics.findByCredentails = async(email,password)=>{
    
    const user = await User.findOne({ "email": email })
    
    if(!user)
        throw new Error('No Email Found');
    
    const checkPassworMatch = await bcrypt.compare(password,user.password)
    //console.log(checkPassworMatch)
    if(!checkPassworMatch){
        throw new Error('Invalid Password')
    }
    console.log(checkPassworMatch)
    return user
}

//setting the pre operation on saving data
userSchema.pre('save',async function(next){
    const user = this;
    //console.log("At Pre Position")

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
        console.log('Yes Changed')
    }


    next()
})

//Removing all the task created by user if user is removed
userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner : user._id})
    next()
})


const User = mongoose.model('User',userSchema)




module.exports = User