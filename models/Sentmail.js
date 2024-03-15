import mongoose from 'mongoose'
const SentmailSchema= mongoose.Schema({
    Email:{type:String},
    
})
const SentmailModel = mongoose.model("Sentmaildb",SentmailSchema)
export {SentmailModel as Sentmaildb}