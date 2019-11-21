const User = require('../models/user')

exports.login = (req, res) => {
    User.findOne({username: req.body.username}).exec( async (err, user) => {
        content = {}
        let status
        if(user){
            const validLogin = await user.authenticate(req.body.password)
            let message = "Login Successfully"
            let status = 200
            if(!validLogin){
                message = "Useranme/password is invalid."
                status = 401
            }
            content = {
                message,
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
        
        res.status(status).json({
            data: content,
        })
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
                data: {
                    message: 'Register Successfuly',
                    user: user
                }
            })
        }
    })
    
}