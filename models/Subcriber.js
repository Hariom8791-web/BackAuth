import mongoose from 'mongoose'
const SubscriberSchema= mongoose.Schema({
    Email:{type:String},
})
const SubscriberModel = mongoose.model("Subscriberdb",SubscriberSchema)
export {SubscriberModel as Subscriberdb}