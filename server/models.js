import mongoose from 'mongoose';
const {Schema}=mongoose;
export const User=mongoose.model('User',new Schema({name:{type:String,required:true},email:{type:String,unique:true,required:true},password:{type:String,required:true}},{timestamps:true}));
export const Movie=mongoose.model('Movie',new Schema({title:String,tagline:String,description:String,genre:[String],language:String,duration:Number,rating:Number,certificate:String,colors:[String],symbol:String,featured:Boolean}));
export const Show=mongoose.model('Show',new Schema({movie:{type:Schema.Types.ObjectId,ref:'Movie'},date:String,time:String,cinema:String,format:String,price:Number,occupied:{type:[String],default:[]}}));
const bookingSchema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User'},show:{type:Schema.Types.ObjectId,ref:'Show'},seats:[String],total:Number,status:{type:String,default:'confirmed'},reference:String},{timestamps:true});
export const Booking=mongoose.model('Booking',bookingSchema);
