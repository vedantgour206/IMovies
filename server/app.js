import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {User,Movie,Show,Booking} from './models.js';
export function createApp(secret){
 const app=express();app.use(helmet({contentSecurityPolicy:false}));app.use(express.json({limit:'20kb'}));
 app.use('/api',rateLimit({windowMs:60000,limit:180}));
 const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
 const auth=(req,res,next)=>{try{req.user=jwt.verify((req.headers.authorization||'').replace(/^Bearer /,''),secret).id;next();}catch{res.status(401).json({error:'Please sign in to continue.'});}};
 const safe=u=>({id:u._id,name:u.name,email:u.email});
 const authLimit=rateLimit({windowMs:15*60000,limit:30});
 app.get('/api/health',(_q,s)=>s.json({ok:true,database:mongoose.connection.readyState===1}));
 app.post('/api/auth/register',authLimit,wrap(async(q,s)=>{const {name,email,password}=q.body;if(typeof name!=='string'||!name.trim()||name.length>80||typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||email.length>160||typeof password!=='string'||password.length<8||password.length>128)return s.status(400).json({error:'Enter a name, valid email, and password of 8–128 characters.'});const u=await User.create({name:name.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,12)});s.status(201).json({user:safe(u),token:jwt.sign({id:u._id},secret,{expiresIn:'12h'})});}));
 app.post('/api/auth/login',authLimit,wrap(async(q,s)=>{const {email,password}=q.body;const u=typeof email==='string'?await User.findOne({email:email.trim().toLowerCase()}):null;if(!u||typeof password!=='string'||!await bcrypt.compare(password,u.password))return s.status(401).json({error:'Email or password is incorrect.'});s.json({user:safe(u),token:jwt.sign({id:u._id},secret,{expiresIn:'12h'})});}));
 app.get('/api/auth/me',auth,wrap(async(q,s)=>{const u=await User.findById(q.user);if(!u)return s.status(401).json({error:'Please sign in again.'});s.json(safe(u));}));
 app.get('/api/movies',wrap(async(_q,s)=>s.json(await Movie.find())));
 app.get('/api/shows',wrap(async(q,s)=>{if(!mongoose.isValidObjectId(q.query.movie)||!/^\d{4}-\d{2}-\d{2}$/.test(q.query.date||''))return s.status(400).json({error:'Choose a valid movie and date.'});s.json(await Show.find({movie:q.query.movie,date:q.query.date}).sort({time:1}));}));
 app.get('/api/shows/:id',wrap(async(q,s)=>{if(!mongoose.isValidObjectId(q.params.id))return s.status(404).json({error:'Show not found.'});const show=await Show.findById(q.params.id).populate('movie');if(!show)return s.status(404).json({error:'Show not found.'});s.json(show);}));
 app.get('/api/bookings',auth,wrap(async(q,s)=>s.json(await Booking.find({user:q.user}).populate({path:'show',populate:{path:'movie'}}).sort({createdAt:-1}))));
 app.post('/api/bookings',auth,wrap(async(q,s)=>{
  const {showId,seats}=q.body;if(!mongoose.isValidObjectId(showId)||!Array.isArray(seats)||!seats.length||seats.length>8||new Set(seats).size!==seats.length||seats.some(x=>typeof x!=='string'||! /^[A-H](?:[1-9]|10)$/.test(x)))return s.status(400).json({error:'Select between 1 and 8 valid seats.'});
  const scheduled=await Show.findById(showId);
  if(!scheduled)return s.status(404).json({error:'Show not found.'});
  if(new Date(scheduled.date+'T'+scheduled.time+':00+05:30')<=new Date())return s.status(400).json({error:'This show has already started. Please choose a later showtime.'});
  const show=await Show.findOneAndUpdate({_id:showId,occupied:{$nin:seats}},{$addToSet:{occupied:{$each:seats}}},{new:true});
  if(!show)return s.status(409).json({error:'These seats were just booked. Please choose other seats.'});
  try{const booking=await Booking.create({user:q.user,show:show._id,seats,total:seats.length*show.price+Math.round(seats.length*show.price*0.08),reference:'IM-'+crypto.randomBytes(4).toString('hex').toUpperCase()});s.status(201).json(await booking.populate({path:'show',populate:{path:'movie'}}));}catch(e){await Show.updateOne({_id:showId},{$pull:{occupied:{$in:seats}}});throw e;}
 }));
 app.patch('/api/bookings/:id/cancel',auth,wrap(async(q,s)=>{if(!mongoose.isValidObjectId(q.params.id))return s.status(404).json({error:'Booking not found.'});const b=await Booking.findOneAndUpdate({_id:q.params.id,user:q.user,status:'confirmed'},{$set:{status:'cancelled'}},{new:true});if(!b)return s.status(404).json({error:'Active booking not found.'});await Show.updateOne({_id:b.show},{$pull:{occupied:{$in:b.seats}}});s.json(b);}));
 app.use('/api',(_q,s)=>s.status(404).json({error:'API route not found.'}));
 app.use((e,_q,s,_n)=>{if(e.code===11000)return s.status(409).json({error:'An account already exists with this email.'});console.error(e.message);s.status(500).json({error:'Something went wrong. Please try again.'});});
 return app;
}
