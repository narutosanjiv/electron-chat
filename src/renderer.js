const io = require('socket.io-client')

// let socket = 

// socket.emit('newMessage', 'Hello there')
const { session } = require('electron').remote
const cookies = session.defaultSession.cookies

import React from 'react'
import ReactDOM from 'react-dom'
import ChatStore from './chat_store'

import axios from 'axios'

let root = document.getElementById('root')

document.addEventListener("DOMContentLoaded", e => {
    ReactDOM.render(<App />, root)
})

class App extends React.Component{

    async fetchCookies(){
        const cookiesUser =  await cookies.get({name: 'username'})
        const cookiesLogin = await cookies.get({name: 'loginToken'})
        let username = cookiesUser.length > 0 ? cookiesUser[0].value : null
        let loginToken = cookiesLogin.length > 0 ? cookiesLogin[0].value : null
        Promise.resolve({
            username,
            loginToken
        })
    }

    constructor(props){
        super(props)
        this.fetchCookies().then((res) => {
            if(res && res.username && res.loginToken){
                this.state = {
                    url: "http://localhost:3000",
                    showLoginBox: false,
                    username: username,
                    messages: []
                }
            }else{
                this.state = {
                    url: "http://localhost:3000",
                    showLoginBox: true,
                    username: "",
                    messages: []
                }
            }
        })
        this.state = {
            url: "http://localhost:3000",
            showLoginBox: true,
            username: "",
            messages: []
        }
        this.initSocket()
        ChatStore.on('new-message', (msg) =>{
            this.io.emit('new-message', msg)
            this.setState({
                messages: [...this.state.messages, msg]
            })
        })

        ChatStore.on('initUsername', (username) => {
            this.setState({
                ...this.state,
                username: username
            })
        })

        this.io.on('new-message', (msg) => {
            console.log('recieved message from server:', msg)
            this.setState({
                messages: [...this.state.messages, msg]
            })
        })
    }

    componentWillMount(){

    }

    initSocket(){
        this.io = io(this.state.url)
    }

    hideLoginBox(){
        this.setState({
            showLoginBox: false
        })
    }

    render(){
        console.log('Main Component render')
        console.log(this.state.messages)
        return( 
            <div className="flex-parent">
                {this.state.showLoginBox && <LoginBox hideLoginBox={this.hideLoginBox.bind(this)}/>}
                <div className="flex-container-horz flex-grow">
                    <div id="side-area" className="col-md-4 flex-grow-2">
                        Side
                    </div>
                    <ChatContainer messages={this.state.messages} username={this.state.username}/>    
                </div>
                <ChatInputBar username={this.state.username} />
            </div>   
        )
    }
}

class ChatContainer extends React.Component{
    constructor(props){
        super(props)
    }

    renderChat(message, index1){
        let currentUsername = this.props.username
        if(message.username == currentUsername){
           return(<div className="messages-container-owner">
                <li key={index1} className="message">
                    {message.msg}        
                </li>
            </div>)
        } else {
            return (<div key={index1} className="messages-container-sender">
                <li className="message">
                    {message.msg}        
                </li>
            </div>)
        }
    }

    render(){
        let currentUsername = this.props.username
        
        return(
            <div id="main-area" className="col-md-9 flex-grow-3">
                <ul className="messages-container-owner">
                    {
                        this.props.messages.map((message, index) => {
                            if(message.username == currentUsername){
                                return(
                                    <li key={index} className="message">
                                        {"You  - " + message.msg}        
                                    </li>
                                )
                            }
                        
                        })
                    }
                </ul>
                <ul className="messages-container-sender">
                    {
                        this.props.messages.map((message, index) => {
                            console.log(message.username != currentUsername)
                            if(message.username != currentUsername){
                                return(
                                    <li key={index} className="message">
                                        { message.username + "-" + message.msg}        
                                    </li>
                                )
                            }
                        
                        })
                    }
                </ul>
            </div>
        )
    }
}

class ChatInputBar extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            message: ''
        }
   
    }

    sendMessage(e){
        e.preventDefault();
        e.stopPropagation();
        this.setState({message: this.msgInput.value})
        ChatStore.addMessage({msg: this.msgInput.value, username: this.props.username})
        // Clear text inputx`
        this.msgInput.value = ""
    }

    render(){
        return (
            <div id="chat-bar-container">
                <form id="chat-form">
                    <input id="chat-input" className="form-control" type="text" placeholder="Type your Message..." ref={(input) => this.msgInput = input}  />
                    <button type="submit" id="chat-submit" className="btn btn-success" onClick={this.sendMessage.bind(this)}>
                        Send Message
                    </button>
                </form>
            </div>
        )

    }
}

class LoginBox extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            username: "",
            error_message: ""
        }
    }

    async submitLogin(){
      
        if(this.username.value == ""){
            alert('Please enter the username')
            return
        }
        if(this.password.value == ""){
            alert('Please enter the password')
            return
        }
        axios.post( 'http://localhost:3000/users/login', {
            headers: {
                "content-type": "application/json"
            },
            data: {
                username: this.username.value,
                password: this.password.value
            }
        })
        .then((res) => {
            debugger
            console.log(res)
            ChatStore.initUsername(this.username.value)
            this.props.hideLoginBox()
            cookies.set({
                url: 'http://localhost:3000',
                name: 'authorization',
                value: res.data.token 
            })
            cookies.set({
                name: 'username',
                value: this.username.value
            })
        })

    }

    render(){
        return(
            <div className="login-box">
                <div className="login-box-container">
                    <h3>
                        Enter your username
                    </h3>
                    <input name="username" className="form-control" type="text" 
                        placeholder="username"
                        ref={(username) => this.username=username}
                    />
                    <h3>
                        Enter your Password
                    </h3>
                    <input name="password" className="form-control" type="password" 
                        placeholder="password"
                        ref={(password) => this.password=password}
                    />
                    <button type="button"
                        className="btn btn-success btn-block"
                        onClick={this.submitLogin.bind(this)}
                    >
                        Login    
                    </button>
                </div>
            </div>
        )

    }
}