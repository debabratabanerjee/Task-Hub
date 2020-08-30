const jwt = require('jsonwebtoken')
const User = require('../models/users.js')
require('dotenv').config()

const auth = async (req,res,next)=>{

    try {
        
    const token = req.header('Authorization').replace('Bearer ', '');
    //console.log(token)
    const decode = jwt.verify(token,process.env.JWT)

    const user = await User.findOne( {_id:decode._id, 'tokens.token':token } )
    //console.log(user)
    if(!user)
        throw new Error()
    req.user = user
    req.token = token    
    
    next()

    } catch (error) {
        res.status(404).send({error:'Authentication Required'})
    }


}
module.exports = auth