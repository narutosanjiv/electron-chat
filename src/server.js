require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const port = process.env.PORT

const { checkForAuthHeader } = require('../api/middleware/auth')
const { addToConnectedUsers } = require('../api/users')

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }))

app.use(checkForAuthHeader)

const { userRoutes } = require('../api/routes/userRoutes')
userRoutes(app)

var http = require('http').createServer(app)
const io = require('socket.io')(http);

io.on('connection',(socket) => {

    console.log('New Client is connected')
    socket.on('new-message', (msg) => {
        console.log('Broadcasting the new message from server: ', msg)
        socket.broadcast.emit('new-message', msg)
    })
    socket.on('connectedUser', (data) => {
        addToConnectedUsers(data.username)
        console.log('connected Username', data.username)
    })
})

http.listen(port, () => {
    console.log('Server is running Port: ', port)
})