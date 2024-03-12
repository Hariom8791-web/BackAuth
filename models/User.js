import mongoose from 'mongoose'
const UserSchema= new mongoose.Schema({
    username:{type:String,required :false,unique:false},
    email:{type:String,required :false ,unique:false},
    password:{type:String,required :false },
})
const UserModel = mongoose.model("User",UserSchema)
export {UserModel as User}