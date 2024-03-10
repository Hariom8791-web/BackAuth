import mongoose from 'mongoose'
const UserSchema= new mongoose.Schema({
    username:{type:String,required :false,unique:true},
    email:{type:String,required :false ,unique:true},
    password:{type:String,required :false },
})
const UserModel = mongoose.model("User",UserSchema)
export {UserModel as User}