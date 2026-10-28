import {Movie,Show} from './models.js';
export async function seed(){
 if(await Movie.countDocuments())return;
 const movies=await Movie.insertMany([
 {title:'Beyond the Blue',tagline:'Some journeys change everything.',description:'A young explorer follows a mysterious signal beyond the edge of the known universe, and discovers that the longest journey is the one that brings us home.',genre:['Sci-Fi','Adventure'],language:'English',duration:148,rating:9.1,certificate:'UA',colors:['#163e54','#66c4d8'],symbol:'planet',featured:true},
 {title:'The Last Heist',tagline:'One city. One night. No second chances.',description:'A retired getaway driver returns for one impossible job through the neon-lit streets of Mumbai.',genre:['Action','Thriller'],language:'Hindi',duration:132,rating:8.7,certificate:'UA',colors:['#54271e','#ed8b53'],symbol:'city'},
 {title:'Wildflower',tagline:'Find your own way to bloom.',description:'An unexpected friendship in a sleepy hillside town helps a musician rediscover her voice.',genre:['Romance','Drama'],language:'English',duration:116,rating:8.4,certificate:'U',colors:['#383f2e','#c3b986'],symbol:'flower'},
 {title:'Midnight Signal',tagline:'Whatever you do, don’t answer.',description:'When a forgotten radio station begins broadcasting tomorrow’s events, a journalist races to stop its final prediction.',genre:['Thriller','Mystery'],language:'Hindi',duration:124,rating:8.6,certificate:'A',colors:['#352747','#9e85cb'],symbol:'signal'},
 {title:'Little Wonders',tagline:'Big adventures come in small packages.',description:'Two unlikely friends build a flying machine and set off on a joyful adventure above the clouds.',genre:['Animation','Family'],language:'English',duration:98,rating:8.9,certificate:'U',colors:['#6b4930','#eac479'],symbol:'balloon'},
 {title:'The Quiet Mountain',tagline:'Listen to what matters.',description:'A father and daughter retrace a long-forgotten trail through the Himalayas, finding each other along the way.',genre:['Drama','Adventure'],language:'Hindi',duration:139,rating:8.8,certificate:'U',colors:['#23483f','#8fbaa6'],symbol:'mountain'}
 ]);
 const shows=[];for(const movie of movies)for(let day=0;day<7;day++){const date=new Date(Date.now()+day*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});for(const [time,cinema,format,price] of [['10:30','PVR Icon · Phoenix Mall','2D',220],['14:15','INOX · City Centre','2D',250],['18:30','PVR Icon · Phoenix Mall','IMAX',380],['21:45','Cinépolis · Nexus Mall','DOLBY ATMOS',320]])shows.push({movie:movie._id,date,time,cinema,format,price,occupied:['C4','C5','D7','D8','F3','F4']});}
 await Show.insertMany(shows);
}
