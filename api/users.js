let connectedUsers = []

const {addItemToArray, removeArrItems} = require('./utils')

exports.addToConnectedUsers = (username) => {
    addItemToArray(connectedUsers, username)
    console.log('connected users', connectedUsers)
}

exports.removeFromConnectedUsers = (username) => {
    removeArrItems(connectedUsers, username)
}

exports.getConnectedUsers = () => (connectedUsers)