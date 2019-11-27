const { EventEmitter } = require('events')

class ChatStore extends EventEmitter {
    constructor(){
        super()
      
        this.state = {
            message: [],
            username: "NA"
        }
    }

    initUsername(username){
        this.state.username = username
        this.emit("initUsername", username)
    }

    addMessage(msg){
        this.emit("new-message", msg)
        this.state.message.push(msg)
    }

    

}

module.exports = new ChatStore()