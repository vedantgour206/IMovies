import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import express from 'express';
import path from 'node:path';
import {createApp} from './app.js';
import {seed} from './seed.js';
let memory;
try{
 if(process.env.MONGODB_URI){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error('Set JWT_SECRET to a random string of at least 32 characters.');await mongoose.connect(process.env.MONGODB_URI);}
 else{const {MongoMemoryServer}=await import('mongodb-memory-server');memory=await MongoMemoryServer.create({instance:{dbName:'imovies',args:['--wiredTigerCacheSizeGB','0.25']}});await mongoose.connect(memory.getUri());console.log('DEMO MODE: temporary MongoDB; accounts and bookings reset on restart.');}
 await seed();const app=createApp(process.env.JWT_SECRET||crypto.randomBytes(48).toString('hex'));app.use(express.static(path.resolve('dist')));app.get('/{*path}',(_q,s)=>s.sendFile(path.resolve('dist/index.html')));
 const server=app.listen(process.env.PORT||4100,'127.0.0.1',()=>console.log('IMovies: http://127.0.0.1:'+(process.env.PORT||4100)));
 const shutdown=async()=>{server.close();await mongoose.disconnect();if(memory)await memory.stop();process.exit(0);};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}catch(e){console.error(e);process.exit(1);}
