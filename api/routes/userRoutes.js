const { login, register } = require('../controllers/userController')

const {  requireLogin} = require('../middleware/auth') 

exports.userRoutes = (app) => {
    app.post("/users/login",  login)
    app.post("/users/register", register)
    app.get("/users/get_connected", requireLogin, (req, res) =>{
        res.status(200).json({
            message: 'Done successfully'
        })
    })
}