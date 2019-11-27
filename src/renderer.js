const io = require('socket.io-client')

// let socket = 

// socket.emit('newMessage', 'Hello there')
const { session } = require('electron').remote
const cookies = session.defaultSession.cookies

import React from 'react'
import ReactDOM from 'react-dom'
import ChatStore from './chat_store'

import axios from 'axios'
import { Popover, Position, Intent} from '@blueprintjs/core'

let root = document.getElementById('root')

document.addEventListener("DOMContentLoaded", e => {
    ReactDOM.render(<App />, root)
})

class App extends React.Component{

    async fetchCookies(){
        const cookiesUser =  await cookies.get({name: 'username'})
        const cookiesLogin = await cookies.get({name: 'JSONWebtoken'})
        let username = cookiesUser.length > 0 ? cookiesUser[0].value : null
        let loginToken = cookiesLogin.length > 0 ? cookiesLogin[0].value : null
        return Promise.resolve({
            username,
            loginToken
        })
    }

    constructor(props){
        super(props)
 
        this.state = {
            url: "http://localhost:3000",
            showLoginBox: false,
            showSignUpBox: true,
            username: "",
            messages: []
        }
    }

    componentWillMount(){
        let username=null, loginToken=null
        this.fetchCookies().then((res) => {
            if(res && res.username && res.loginToken){
               username = res.username
                loginToken = res.loginToken
                axios.defaults.headers.common['authentication'] = `JWT ${res.loginToken}`
                this.initSocket()
                ChatStore.initUsername(res.username)
                this.hideLoginBox()
                this.hideSignBox()
                
                this.io.on('new-message', (msg) => {
                    console.log('recieved message from server:', msg)
                    this.setState({
                        messages: [...this.state.messages, msg]
                    })
                })
                
            }           
        })
       
        
    }

    initSocket(){
        this.io = io(this.state.url)
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
            this.io.emit('connectedUser', {username: username})
        })
    }

    hideLoginBox(){
        this.setState({
            showLoginBox: false
        })
    }

    hideSignBox(){
        this.setState({
            showSignUpBox: false
        })
    }

    showLoginBox(){
        this.setState({
            showLoginBox: true,
            showSignUpBox: false
        })
    }

    showSignUpBox(){
        this.setState({
            showSignUpBox: true,
            showLoginBox: false
        })
    }

    render(){
        console.log('Main Component render')
        return( 
            <div className="flex-parent">
                {this.state.showLoginBox && <LoginBox hideLoginBox={this.hideLoginBox.bind(this)} showSignUpBox={this.showSignUpBox.bind(this)} />}
                {this.state.showSignUpBox && <SignUp  showLoginBox={this.showLoginBox.bind(this)}/>}

                <div className="flex-container-horz flex-grow">
                    {
                        !!this.state.username? (
                            <SideArea />
        
                        ) : ""
                        
                    }
                    <ChatContainer messages={this.state.messages} username={this.state.username}/>    
                </div>
                <ChatInputBar username={this.state.username} />
            </div>   
        )
    }
}

class SideArea extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            users : [],
            isSettingsOpen: false
        }
        this.isCancelled  = false
    }

    fetchConnectedUsers(){
        axios.get( 'http://localhost:3000/users/get_connected')
        .then((res) => {
            if(!this.isCancelled){
                console.log('connected users')
                console.debug(res)
                this.setState({
                    users: res.connectedUsers
                })
            }
        })
        .catch((error) => {
            console.log('failed to get connected users')
            console.log(error)
        })
    }

    componentWillMount(){
        this.intervalId = setInterval(setTimeout(() => {
            axios.get( 'http://localhost:3000/users/get_connected')
            .then((res) => {
                if(!this.isCancelled){
                    console.log('connected users')
                    console.debug(res)
                    this.setState({
                        users: res.data.connectedUsers
                    })
                }
            })
            .catch((error) => {
                console.log('failed to get connected users')
                console.log(error)
            })
        }, 50), 1000)
    }

    componentWillUnmount(){
        this.isCancelled = true
        clearInterval(this.intervalId)
    }


    render(){
        console.log('connected components')
        console.log(this.state)
        return(
            <div id="side-area" className="col-md-3 flex-grow-2">
                <ConnectedUsers users={this.state.users} />
                <Popover position={Position.RIGHT} isOpen={this.state.isSettingsOpen} content={
                    <div className="settings-container">
                        <div className="bordered-header"> 
                            User Details
                        </div>
                        <div className="options-container">
                            <div className="option">
                                <button className="pt-button pt-intent-danger">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                }>
                    <span className="fa fa-cog fa-2x" onClick={() => { this.setState((prevState) => ({isSettingsOpen: !prevState.isSettingsOpen})) }}>
                    </span>
                </Popover>
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
class SignUp extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            email: '',
            password: '',
            username: ''
        }
    }

    validateUserInput(){
        if(this.email.value == ""){
            alert('Please enter the email')
            return false
        }
        if(this.username.value == ""){
            alert('Please enter the username')

            return false
        }
        if(this.password.value == ""){
            alert('Please enter the password')
            return false
        }
        return true
    }

    submitSignUp(){
        if(validateUserInput()){
            axios.post( 'http://localhost:3000/users/register', 
                {
                    username: this.username.value,
                    password: this.password.value,
                    email: this.email.value
                },  
            
                {
                    "content-type": "application/json"
                }
            )
            .then((res) =>{
                this.props.showLoginBox()

            })
            .catch((res) => {

            })
        }
    }

    render(){
        return(
            <div className="login-box">
                <div className="login-box-container">
                    <h3>
                        Enter your email
                    </h3>
                    <input name="email" className="form-control" type="text" 
                        placeholder="email"
                        ref={(email) => this.email = email}
                    />
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
                        onClick={this.submitSignUp.bind(this)}
                    >
                        Sign Up    
                    </button>
                    <p>
                        <a href='#' onClick={() => this.props.showLoginBox()}>
                            Click to Sign In
                        </a>
                    </p>
                </div>
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
        axios.post( 'http://localhost:3000/users/login', 
            {
                username: this.username.value,
                password: this.password.value
            },  
        
            {
                "content-type": "application/json"
            }
            
        )
        .then((res) => {
            let expiration = new Date();
            let hour = expiration.getHours();
            hour = hour + 6;
            expiration.setHours(hour)
            console.log(res)
            ChatStore.initUsername(this.username.value)
            this.props.hideLoginBox()
            cookies.set({
                url: 'http://localhost',
                name: 'JSONWebtoken',
                domain: 'localhost',
                value: res.data.token,
                expirationDate: (Date.now() / 1000) + (7 * 24 * 3600)
            }, (err) => {
                console.log('err', err)
            })
            .then(() => {
                console.log('saved data succesfully')
            }, (err) =>{
                console.log('error')
                console.debug(err)
            })

            cookies.set({
                url: 'http://localhost',
                name: 'username',
                value: res.data.username,
                domain: 'localhost',
                expirationDate: (Date.now() / 1000) + (7 * 24 * 3600)
            })
            .then(() => {
                console.log('saved data succesfully')
            }, (err) =>{
                console.log('error')
                console.debug(err)
            })
        })
        .catch((err) => {
            debugger
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
                    <p>
                    <a href='#' onClick={() => this.props.showSignUpBox()}>
                        Click to SignUp
                    </a>
                </p>
                </div>
            </div>
        )

    }
}

function ConnectedUsers(props){
    console.log('props')
    console.debug(props)
    return(
        <div className="connected-users">
            <div className="bordered-header">
                Online
            </div>
            <div className="users-container">
                {
                    props.users.length > 0 ?
                    (
                        props.users.map((username) => {
                           return (<div className="text-center">
                                { username }
                            </div>)
                        })
                    ) : " No connected users"

                }
            </div>
        </div>
    )
}