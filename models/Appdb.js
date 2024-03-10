import mongoose from 'mongoose'
import mongooseSequence from 'mongoose-sequence';


const AutoIncrement = mongooseSequence(mongoose);
const AppSchema=  mongoose.Schema({
    recordNumber:{type:Number},
    Appemail:{type:String},
    AppPassword:{type:String},
    username:{type:String},
    password:{type:String},
    email:{type:String},
    
})
AppSchema.plugin(AutoIncrement, {inc_field: 'recordNumber'});
const AppModel = mongoose.model("Appdb",AppSchema)
export {AppModel as Appdb}