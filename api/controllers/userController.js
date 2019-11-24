const User = require('../models/user')

exports.login = (req, res) => {
    User.findOne({username: req.body.username}).exec( async (err, user) => {
        content = {}
        let status, message
        if(user){
            const validLogin = await user.authenticate(req.body.password)
            message = "Login Successfully"
            status = 200
            if(!validLogin){
                message = "Useranme/password is invalid."
                status = 401
            }
            content = {
                message,
                username: req.body.username,
                token: user.token
            }
        } else{
            status = 401
            message = "Useranme/password is invalid."
            content = {
                message,
                token: null
            }
        }
        
        res.status(status).json(content)
    })
}

exports.register = (req, res) => {
    console.log(req.body)
    const user  = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,

    })
    user.save((err) => {
        if(err){
            res.json({
                status: 403,
                data: {
                    message: err.message
                }
            })
        } else {
            res.json({
                status: 200,
                message: 'Register Successfuly',
                user: user
            })
        }
    })
    
}