const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type: String,
        required : true,
        trim : true,
        unique : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email must be valid!');
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    password : {
        required : true,
        type : String,
        trim : true,
        minlength : 7,
        validate(value){
            if(validator.contains(value,'password',{ignoreCase:true})){
                throw new Error('Password must not contain \'password\' string');
            }
        }
    },
    tokens: [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true
});

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user;
}

userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

//middleware
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }

    //required to end middleware function
    next();
});

userSchema.pre('remove', async function(next){
    const user = this;
    console.log(user._id);
    await Task.deleteMany({owner : user._id});
    next();
})
const User = mongoose.model('User',userSchema);

module.exports = User;