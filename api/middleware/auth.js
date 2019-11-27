const jwt = require('jsonwebtoken')


exports.checkForAuthHeader = (req, res, next) => {
    if(req.headers && req.headers.authentication && req.headers.authentication.split(' ')[0] == 'JWT'){
        jwt.verify(req.headers.authentication.split(' ')[1], process.env.JSON_TOKEN_SECRET, (err, decoded) =>{
            if(err){
                req.user = undefined
            }else{
                req.user = decoded    
            }
            next()        
        })
    } else{
        req.user = undefined
        next()
    }
}

exports.requireLogin = (req, res, next) => {
    if(!req.user){
        res
        .status(401)
        .json({
            message: 'Invalid user token'
        })
    }else{
        next()
    }
}