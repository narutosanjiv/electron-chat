const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    encryptedPassword: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
        required: true
    }
})

// UserSchema.pre('save', (next) => {
//     if(this.isModified("encryptedPassword")){
//         const salt = this.salt = bcrypt.genSaltSync(10);
//         this.encryptedPassword = bcrypt.hashSync(password, salt);
//     }
// })

UserSchema.virtual('password')
 .get(function () {
  return this.encryptedPassword;
 })
 .set(function (password) {
    const salt = this.salt = bcrypt.genSaltSync(10);
    this.encryptedPassword = bcrypt.hashSync(password, salt);
 });

UserSchema.virtual('token')
 .get(function(){
    let token = jwt.sign({ username: this.username}, process.env.JSON_TOKEN_SECRET)
    return token
 })

UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.encryptedPassword;
    delete obj.salt
    return obj;
}

UserSchema.methods.authenticate = function(password){

    return bcrypt.compareSync(password, this.encryptedPassword)
}

module.exports = mongoose.model('User', UserSchema)