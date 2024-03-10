import mongoose from 'mongoose'
const OtpSchema= mongoose.Schema({
    otp:{type:String},
})
const OtpModel = mongoose.model("Otpdb",OtpSchema)
export {OtpModel as Otpdb}