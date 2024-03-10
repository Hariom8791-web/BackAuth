import mongoose from 'mongoose'
const SentmailSchema= mongoose.Schema({
    sentemail:{type:String},
    byuser:{type:String},
})
const SentmailModel = mongoose.model("Sentmaildb",SentmailSchema)
export {SentmailModel as Sentmaildb}