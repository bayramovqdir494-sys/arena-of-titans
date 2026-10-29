import * as THREE from 'three';
import { GLTFLoader } from './GLTFLoader.js';
// ================= SDK =================
let SDK=null;const sdkReady=(async()=>{try{for(let i=0;i<40&&!window.CrazyGames;i++)await new Promise(r=>setTimeout(r,100));if(window.CrazyGames){await CrazyGames.SDK.init();SDK=CrazyGames.SDK;}}catch(e){SDK=null}})();
let gpOn=false;const gpStart=()=>{if(gpOn)return;gpOn=true;try{SDK&&SDK.game.gameplayStart()}catch(e){}};const gpStop=()=>{if(!gpOn)return;gpOn=false;try{SDK&&SDK.game.gameplayStop()}catch(e){}};
const happy=()=>{try{SDK&&SDK.game.happytime()}catch(e){}};
function ad(type,ok,fail){if(!SDK){ok&&ok();return}const was=gpOn;gpStop();Audio.duck(true);
 const done=f=>{Audio.duck(false);if(was)gpStart();f&&f()};
 try{SDK.ad.requestAd(type,{adFinished:()=>done(ok),adError:()=>done(type==='rewarded'?fail:ok),adStarted:()=>{}})}catch(e){done(ok)}}
// ================= DATA =================
const HEROES=[
 {id:'knight',name:'Aldric',title:'The Oathbound Knight',hp:120,dmg:14,spd:6.2,range:2.3,sp:'Shield Charge',spd2:'Charge forward, smashing foes aside.',cd:6,u:{t:'free'},col:0x6aa8ff},
 {id:'rogue',name:'Nyx',title:'Emerald Shade',hp:85,dmg:12,spd:7.6,range:2.0,sp:'Shadow Blink',spd2:'Teleport behind the nearest foe and strike twice.',cd:5,u:{t:'coins',v:1500},col:0x4dff9a},
 {id:'wolf',name:'Fenrak',title:'The Chained Beast',hp:110,dmg:13,spd:7.0,range:2.1,sp:'Blood Frenzy',spd2:'Rage: double attack speed and lifesteal for 5s.',cd:9,u:{t:'boss',v:1},col:0xffcc44},
 {id:'minotaur',name:'Gorath',title:'Lord of the Labyrinth',hp:160,dmg:17,spd:5.6,range:2.5,sp:'Earthshatter',spd2:'Slam the ground, hurling every nearby foe.',cd:7,u:{t:'boss',v:0},col:0xff8a3a},
 {id:'golem',name:'Kragg',title:'The Molten Heart',hp:200,dmg:19,spd:5.0,range:2.6,sp:'Magma Burst',spd2:'Erupt with lava, burning and stunning foes.',cd:8,u:{t:'boss',v:2},col:0xff5a1a},
 {id:'lich',name:'Morvane',title:'The Crowned Dead',hp:95,dmg:15,spd:6.0,range:2.2,sp:'Soul Nova',spd2:'Unleash a ring of soul fire that seeks foes.',cd:6,u:{t:'boss',v:3},col:0xb76aff},
 {id:'valkyrie',name:'Sigrun',title:'Valkyrie of the Last Light',hp:115,dmg:15,spd:6.8,range:2.4,sp:'Winged Judgment',spd2:'Leap into the sky and crash down on the nearest foe with holy lightning.',cd:7,u:{t:'gems',v:120},col:0xfff0a0},
 {id:'assassin',name:'Kurai',title:'The Red Mask',hp:90,dmg:16,spd:7.8,range:2.1,sp:'Thousand Cuts',spd2:'Flash through up to five foes, cutting each one.',cd:6,u:{t:'ads',v:3},col:0xff3a4a},
 {id:'archer',name:'Vaela',title:'Bone Archer of the Hollow',hp:90,dmg:13,spd:7.0,range:2.2,sp:'Volley of Souls',spd2:'Loose a fan of piercing soul arrows.',cd:5,u:{t:'coins',v:4000},col:0x4affd8},
 {id:'giant',name:'Ymrik',title:'The Frost Giant',hp:230,dmg:18,spd:4.9,range:2.7,sp:'Glacial Roar',spd2:'Roar a blizzard that freezes every nearby foe solid.',cd:9,u:{t:'trophy',v:300},col:0x9ad8ff},
 {id:'dragon',name:'Drakar',title:'The Dragon Knight',hp:140,dmg:17,spd:6.0,range:2.6,sp:'Dragon Breath',spd2:'Breathe a cone of dragonfire that burns foes.',cd:7,u:{t:'gems',v:250},col:0xff7a2a},
 {id:'demon',name:'Azgaroth',title:'Demon Warlord',hp:180,dmg:21,spd:5.6,range:2.6,sp:'Hellfire Cataclysm',spd2:'Three waves of hellfire erupt outward from the warlord.',cd:10,u:{t:'boss',v:4},col:0xff3a10},
];
const BASEH=6;// enemies & bosses drawn from originals + new ones
const WT={sword:{n:'Sword',sp:1,r:1,d:1,arc:.25,fin:'spin',fn:'Whirlwind'},greatsword:{n:'Greatsword',sp:1.45,r:1.3,d:1.45,arc:0,fin:'slam',fn:'Earthsplitter'},axe:{n:'Axe',sp:1.2,r:1.05,d:1.25,arc:.2,fin:'cleave',fn:'Execution Cleave'},spear:{n:'Spear',sp:1.05,r:1.55,d:1,arc:.7,fin:'lunge',fn:'Impaling Lunge'},hammer:{n:'Hammer',sp:1.55,r:1.1,d:1.6,arc:.1,fin:'quake',fn:'Titan Quake'},daggers:{n:'Dual Daggers',sp:.6,r:.8,d:.62,arc:.3,fin:'flurry',fn:'Shadow Flurry'},bow:{n:'Bow',sp:1,r:1,d:.85,ranged:1,fin:'volley',fn:'Triple Volley'},staff:{n:'Staff',sp:1.1,r:1,d:.9,ranged:2,fin:'nova',fn:'Arcane Nova'},scythe:{n:'Scythe',sp:1.3,r:1.35,d:1.2,arc:-.4,fin:'reap',fn:'Soul Reap'}};
const HSTYLE={knight:'sword',rogue:'daggers',wolf:'axe',minotaur:'axe',golem:'hammer',lich:'staff',valkyrie:'spear',assassin:'daggers',archer:'bow',giant:'hammer',dragon:'staff',demon:'scythe'};
const WEAPONS=[{n:"Champion's Arms",ty:null,d:0,r:0,c:0xfff0c0,p:{t:'free'}},{n:'Oathsteel Longsword',ty:'sword',d:.1,r:0,c:0x9ad0ff,p:{t:'coins',v:1200}},{n:'Ravager Axe',ty:'axe',d:.12,r:0,c:0xff6a3a,p:{t:'coins',v:2000}},{n:'Dawnspear',ty:'spear',d:.1,r:0,c:0xffe27a,p:{t:'ads',v:2}},{n:'Twin Fangs',ty:'daggers',d:.12,r:0,c:0x4dff9a,p:{t:'coins',v:2800}},{n:'Gravemaul',ty:'hammer',d:.15,r:0,c:0xff9a3a,p:{t:'gems',v:80}},{n:'Kingsbane Greatsword',ty:'greatsword',d:.18,r:0,c:0xff3a5a,p:{t:'ads',v:4}},{n:'Soulstring Bow',ty:'bow',d:.15,r:0,c:0x4affd8,p:{t:'gems',v:100}},{n:'Staff of Embers',ty:'staff',d:.15,r:0,c:0xff7a2a,p:{t:'coins',v:3500}},{n:'Eclipse Scythe',ty:'scythe',d:.22,r:0,c:0xb06aff,p:{t:'gems',v:200}}];
const ULTS={knight:['Oath of the Last Bastion','nova',0xffd36a],rogue:['Emerald Requiem','blades',0x4dff9a],wolf:['Moonblood Rampage','blades',0xff3a3a],minotaur:['Labyrinth Collapse','meteor',0xc9a070],golem:['Molten Heart Eruption','meteor',0xff5a10],lich:['Crown of the Dead','storm',0xb06aff],valkyrie:['Ragnarök Descent','storm',0xfff0a0],assassin:['Night of Red Blades','blades',0xff3a4a],archer:['Starfall Barrage','meteor',0x4affd8],giant:['Eternal Winter','nova',0x9ad8ff],dragon:['Wyrmfire Apocalypse','meteor',0xff7a2a],demon:['Gate of the Abyss','nova',0xff3a10]};
const MOVES={grab:'Grab & Throw',plunge:'Aerial Plunge',chain4:'Executioner 4th Hit',ultx:'Ultimate Surge (+50% charge)'};

const FXP=[{n:'Classic',hit:0xffc46a,sl:0xfff0c0,k:1,p:{t:'free'}},{n:'Ember Storm',hit:0xff6a1a,sl:0xffa040,k:1.6,p:{t:'coins',v:1800}},{n:'Frost Shards',hit:0x8ad8ff,sl:0xc8f0ff,k:1.5,p:{t:'ads',v:2}},{n:'Void Rift',hit:0xb06aff,sl:0xd0a0ff,k:1.8,p:{t:'gems',v:60}},{n:'Celestial',hit:0xffe68a,sl:0xffffff,k:2.2,p:{t:'gems',v:150}}];
const HI=Object.fromEntries(HEROES.map((h,i)=>[h.id,i]));
const SKINS=[{n:'Default',c:null,g:0},{n:'Bloodforged',c:0xff5a4a,g:30},{n:'Frostbound',c:0x7ac8ff,g:45},{n:'Voidtouched',c:0xb08aff,g:60},{n:'Gilded',c:0xffd36a,g:90}];
const WORLDS=[
 {n:'The Ashen Keep',floor:'#3a3430',edge:'#6b5d4d',fog:0x1a1210,sky:[0x2a1410,0x07050a],light:0xffb070,amb:0x504060,part:'ember',hz:'spikes',boss:'minotaur',bossN:'Gorath, Lord of the Labyrinth',
  story:'The Titans have fallen silent. Their arenas, once sacred, now crawl with the corrupted. You awaken in the ruins of the Ashen Keep with an oath still burning in your chest: climb the five arenas and reach the Titan Throne.'},
 {n:'Frostfang Peaks',floor:'#7d93a8',edge:'#c9dbe8',fog:0x8aa0b8,sky:[0x5a7a9a,0x10182a],light:0xd8ecff,amb:0x6080a0,part:'snow',hz:'ice',boss:'wolf',bossN:'Fenrak, the Chained Beast',
  story:'Beyond the Keep lie the frozen peaks, where the beast Fenrak was chained by the Titans themselves. The chains are breaking. The ground is slick with ice — keep your footing, or the abyss takes you.'},
 {n:'The Molten Forge',floor:'#2a1a14',edge:'#5a2a14',fog:0x2a0a04,sky:[0x6a1a04,0x100404],light:0xff8a3a,amb:0x602010,part:'ember',hz:'lava',boss:'golem',bossN:'Kragg, the Molten Heart',
  story:'The forge where the Titans shaped their weapons still burns. Lava rises through the cracked stone. Kragg, the forge guardian, no longer knows friend from foe.'},
 {n:'Crypt of Whispers',floor:'#24202a',edge:'#4a4058',fog:0x120e18,sky:[0x2a1a3a,0x050308],light:0x9a8aff,amb:0x302848,part:'wisp',hz:'blade',boss:'lich',bossN:'Morvane, the Crowned Dead',
  story:'Beneath the mountain, the dead whisper your name. Morvane, the last Titan priest, has crowned himself king of the crypt. His blades never stop turning.'},
 {n:'The Storm Spire',floor:'#2e3440',edge:'#5a6478',fog:0x1a2030,sky:[0x3a4a6a,0x080a14],light:0xcfe0ff,amb:0x405070,part:'rain',hz:'storm',boss:'knight',bossN:'The Fallen Titan',
  story:'At the top of the Spire, lightning tears the sky. On the Titan Throne waits a knight in black armor... wearing your face. To end the curse, you must defeat what you were meant to become.'},
];
const STAGES_PER=8;
const TROPHY=[[50,'coins',300],[80,'move','grab'],[120,'gems',15],[200,'coins',800],[250,'move','plunge'],[300,'skin',1],[420,'gems',30],[480,'move','chain4'],[560,'coins',2000],[650,'move','ultx'],[720,'gems',50],[900,'coins',4000],[1100,'gems',80],[1400,'coins',8000]];
const QPOOL=[['win','Win {n} battles',3,150],['ko','Defeat {n} enemies',25,150],['sp','Use specials {n} times',15,120],['star3','Earn 3 stars {n} times',2,200],['gaunt','Reach wave {n} in the Gauntlet',5,250],['boss','Defeat {n} boss',1,300]];
const DAILY=[[200,0],[0,10],[400,0],[600,0],[0,25],[1000,0],[0,60]];
// ================= SAVE =================
const KEY='aot_save_v1';
const S0={mv:{},wp:{},wsel:{},fx:{0:1},fxs:0,adp:{},chest:0,streak:0,bestStreak:0,tut:0,q:matchMedia('(pointer:coarse)').matches?1:2,shake:1,en:5,enT:0,ev:'',evW:0,gad:{d:'',n:0},coins:0,gems:0,hero:'knight',owned:{knight:1},lv:{},skin:{},skins:{},stars:{},maxW:0,trophy:0,trClaim:0,day:{d:'',q:[]},dl:{last:'',n:0},best:0,music:1,sfx:1,seen:{},wins:0};
let S;try{S=Object.assign(structuredClone(S0),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=structuredClone(S0)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const today=()=>new Date().toDateString();
function rollQuests(){if(S.day.d===today())return;let p=[...QPOOL].sort(()=>Math.random()-.5).slice(0,3);S.day={d:today(),q:p.map(q=>({k:q[0],n:q[2],r:q[3],p:0,c:0}))};save()}
rollQuests();
function quest(k,v=1){S.day.q.forEach(q=>{if(q.k===k&&!q.c){q.p=k==='gaunt'?Math.max(q.p,v):q.p+v}});save()}
const priceTxt=p=>p.t==='coins'?'🪙 '+p.v:p.t==='gems'?'💎 '+p.v:p.t==='ads'?'📺 '+p.v+' ads':p.t==='trophy'?'🏆 '+p.v:p.t==='boss'?'Defeat '+WORLDS[p.v].bossN.split(',')[0]:'';
const lvOf=id=>S.lv[id]||{p:0,v:0};
// ================= AUDIO =================
const Audio={ctx:null,m:null,mv:null,sv:null,init(){if(this.ctx)return;try{const C=this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.m=C.createGain();this.m.connect(C.destination);this.mv=C.createGain();this.mv.gain.value=S.music?.32:0;this.mv.connect(this.m);this.sv=C.createGain();this.sv.gain.value=S.sfx?.7:0;this.sv.connect(this.m);
 const b=C.createBuffer(1,C.sampleRate,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b;this.music()}catch(e){}},
 duck(on){if(this.m)this.m.gain.value=on?0:1},
 tone(f,dur,type='sine',v=.3,f2=0,dest){const C=this.ctx;if(!C)return;const t=C.currentTime,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(dest||this.sv);o.start(t);o.stop(t+dur)},
 noise(dur,fq,v=.3,q=1,type='bandpass',dest){const C=this.ctx;if(!C)return;const t=C.currentTime,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=this.nb;f.type=type;f.frequency.setValueAtTime(fq,t);f.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(dest||this.sv);s.start(t,Math.random()*.5);s.stop(t+dur)},
 swing(){this.noise(.16,1500+Math.random()*700,.25,2)},hit(h){const v=.85+Math.random()*.3;this.noise(.12,500*v,.5,1,'lowpass');this.noise(.05,3200*v,.18,3);this.tone((h?90:140)*v,.15,'triangle',.4,50);this.tone(h?60:85*v,.22,'sine',.3,35)},
 boom(){this.noise(.6,300,.7,1,'lowpass');this.tone(70,.6,'sine',.6,30)},zap(){this.noise(.35,3000,.4,.5,'highpass');this.tone(900,.2,'sawtooth',.12,200)},
 coin(){this.tone(1320,.08,'square',.06);setTimeout(()=>this.tone(1760,.12,'square',.06),60)},click(){this.tone(600,.05,'triangle',.15)},
 win(){[392,523,659,784].forEach((f,i)=>setTimeout(()=>this.tone(f,.5,'triangle',.22),i*130))},lose(){[330,262,196].forEach((f,i)=>setTimeout(()=>this.tone(f,.7,'sawtooth',.1),i*220))},
 dash(){this.noise(.22,900,.3,.7)},
 key:0,music(){const C=this.ctx;if(!C)return;const roots=[55,61.7,49,58.3,65.4];let step=0;
  // drone
  const d1=C.createOscillator(),d2=C.createOscillator(),dg=C.createGain(),lp=C.createBiquadFilter();d1.type='sawtooth';d2.type='sawtooth';lp.type='lowpass';lp.frequency.value=380;dg.gain.value=.08;d1.connect(lp);d2.connect(lp);lp.connect(dg).connect(this.mv);d1.start();d2.start();this.d1=d1;this.d2=d2;
  const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=.07;lg.gain.value=180;lfo.connect(lg).connect(lp.frequency);lfo.start();
  const setK=()=>{const r=roots[this.key%5];d1.frequency.setTargetAtTime(r,C.currentTime,.5);d2.frequency.setTargetAtTime(r*1.498,C.currentTime,.5)};setK();this.setK=setK;
  const mel=[0,3,7,5,3,10,7,8];
  setInterval(()=>{if(!S.music||document.hidden)return;const r=roots[this.key%5];const intense=this.intense;
   if(step%4===0)this.drum(55,.5,intense?.55:.3);if(intense&&step%4===2)this.drum(80,.25,.3);if(intense&&step%2===1)this.noise(.05,7000,.05,1,'highpass',this.mv);
   if(step%8===0){const n=mel[(step/8|0)%8];this.tone(r*4*Math.pow(2,n/12),1.6,'triangle',.05,0,this.mv)}step++},220)},
 drum(f,d,v){const C=this.ctx,t=C.currentTime,o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(f*2,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(this.mv);o.start(t);o.stop(t+d)},
 intense:false};
addEventListener('pointerdown',()=>{Audio.init();Audio.ctx&&Audio.ctx.state==='suspended'&&Audio.ctx.resume()},{passive:true});
// ================= RENDERER =================
const canvas=document.getElementById('c');
const EXPO=1.38;const QK=()=>[.45,.75,1][S.q];
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(window.devicePixelRatio||1);// full device resolution, never lowered
renderer.shadowMap.enabled=!location.search.includes('nosh')&&S.q>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=EXPO;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(48,1,.1,200);
function resize(){renderer.setPixelRatio(window.devicePixelRatio||1);renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<1?62:48;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const hemi=new THREE.HemisphereLight(0x8090b0,0x201008,1.95);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc890,3.2);sun.position.set(8,18,6);sun.castShadow=true;sun.shadow.mapSize.set(S.q>1?2048:1024,S.q>1?2048:1024);const sc=sun.shadow.camera;sc.left=sc.bottom=-14;sc.right=sc.top=14;sc.near=1;sc.far=50;sun.shadow.bias=-.0008;scene.add(sun,sun.target);
const rim=new THREE.DirectionalLight(0x8090ff,1.3);rim.position.set(-8,6,-10);scene.add(rim);const fill=new THREE.DirectionalLight(0xfff2e0,.95);scene.add(fill,fill.target);
// sky dome
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{a:{value:new THREE.Color()},b:{value:new THREE.Color()},t:{value:0}},vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 a,b;uniform float t;varying vec3 p;float h(vec2 q){return fract(sin(dot(q,vec2(12.9,78.2)))*43758.5);}void main(){float y=p.y*.5+.5;vec3 c=mix(a,b,smoothstep(.2,.9,y));float n=sin(p.x*6.+t*.05)*sin(p.z*5.-t*.04)*.5+.5;c+=a*.25*n*(1.-y);float st=step(.997,h(floor(p.xz*300.)))*smoothstep(.55,.9,y);c+=vec3(st);gl_FragColor=vec4(c,1.);}'});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(90,32,16),skyMat));
// ================= TEXTURES =================
function stoneTex(base,edge,seed=1){const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,1024,1024);let r=seed;const R=()=>(r=(r*9301+49297)%233280)/233280;
 // tiles in rings
 for(let i=0;i<4000;i++){g.fillStyle=`rgba(${R()<.5?0:255},${R()<.5?0:255},${R()<.5?0:255},${R()*.04})`;g.fillRect(R()*1024,R()*1024,R()*40,R()*40)}
 g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=5;for(let k=1;k<7;k++){g.beginPath();g.arc(512,512,k*75,0,7);g.stroke();const n=k*7;for(let j=0;j<n;j++){const a=j/n*6.283+k;g.beginPath();g.moveTo(512+Math.cos(a)*(k-1)*75,512+Math.sin(a)*(k-1)*75);g.lineTo(512+Math.cos(a)*k*75,512+Math.sin(a)*k*75);g.stroke()}}
 g.strokeStyle=edge;g.globalAlpha=.5;g.lineWidth=14;g.beginPath();g.arc(512,512,500,0,7);g.stroke();g.globalAlpha=.25;g.lineWidth=6;g.beginPath();g.arc(512,512,150,0,7);g.stroke();
 // center sigil
 g.globalAlpha=.35;g.lineWidth=4;for(let j=0;j<6;j++){const a=j/6*6.283;g.beginPath();g.moveTo(512+Math.cos(a)*150,512+Math.sin(a)*150);g.lineTo(512+Math.cos(a+2.09)*150,512+Math.sin(a+2.09)*150);g.stroke()}
 g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.4)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
const GLOW=glowTex();
function ringTex(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.strokeStyle='#fff';g.lineWidth=10;g.beginPath();g.arc(128,128,118,0,7);g.stroke();const gr=g.createRadialGradient(128,128,0,128,128,120);gr.addColorStop(0,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(255,255,255,.45)');g.fillStyle=gr;g.beginPath();g.arc(128,128,118,0,7);g.fill();return new THREE.CanvasTexture(c)}
const RING=ringTex();
// ================= MODELS =================
const loader=new GLTFLoader();const MODELS={};
async function loadModels(){await Promise.all(HEROES.map(h=>new Promise(res=>loader.load('models/'+h.id+'.glb',g=>{let m=null;g.scene.traverse(o=>{if(o.isMesh&&!m)m=o});MODELS[h.id]=m;res()},undefined,()=>res()))))}
function makeChar(id,tint,scale=1){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const src=MODELS[id];let mesh,mat;
 if(src){mat=src.material.clone();mesh=new THREE.Mesh(src.geometry,mat)}else{mat=new THREE.MeshStandardMaterial({color:HEROES[HI[id]].col,roughness:.6});mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.45,.9,6,12),mat);mesh.position.y=.9}
 mat.emissive=new THREE.Color(0);if(tint!=null)mat.color=new THREE.Color(tint).lerp(new THREE.Color(1,1,1),.35);
 mesh.castShadow=true;body.add(mesh);root.scale.setScalar(scale);
 const sh=new THREE.Mesh(new THREE.CircleGeometry(.6,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;root.add(sh);
 return {root,body,mat}}
// ================= ARENA =================
let arena=null,R=9;const obst=[];const flick=[],spin=[],plights=[];let lavaTex=null,cloudM=null,skyBolt=0;
const particles=[];let ambient=null;
function cvTex(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function crackTex(col,seed){let r=seed*7+3;const Rn=()=>(r=(r*9301+49297)%233280)/233280;return cvTex(1024,1024,(g)=>{g.fillStyle='#000';g.fillRect(0,0,1024,1024);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=14;
 for(let i=0;i<26;i++){let x=512+(Rn()-.5)*900,y=512+(Rn()-.5)*900;g.lineWidth=1+Rn()*3;g.beginPath();g.moveTo(x,y);for(let k=0;k<8;k++){x+=(Rn()-.5)*90;y+=(Rn()-.5)*90;g.lineTo(x,y)}g.stroke()}
 g.lineWidth=5;g.beginPath();g.arc(512,512,150,0,7);g.stroke();for(let j=0;j<6;j++){const a=j/6*6.283;g.beginPath();g.moveTo(512+Math.cos(a)*150,512+Math.sin(a)*150);g.lineTo(512+Math.cos(a+2.09)*150,512+Math.sin(a+2.09)*150);g.stroke()}
 g.font='bold 40px Georgia';g.fillStyle=col;for(let j=0;j<12;j++){g.save();g.translate(512,512);g.rotate(j/12*6.283);g.fillText('ᚱᚢᚾᛖᛋ'[j%5],-12,-430);g.restore()}})}
function bannerTex(c1,c2){return cvTex(128,256,(g,w,h)=>{g.fillStyle=c1;g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(w/2,h-40);g.lineTo(0,h);g.fill();g.strokeStyle=c2;g.lineWidth=6;g.strokeRect(8,8,w-16,h-70);g.fillStyle=c2;g.beginPath();g.moveTo(64,60);g.lineTo(94,110);g.lineTo(64,170);g.lineTo(34,110);g.fill();g.fillStyle=c1;g.beginPath();g.arc(64,112,14,0,7);g.fill()})}
function noiseTex(c1,c2){const t=cvTex(256,256,(g)=>{g.fillStyle=c1;g.fillRect(0,0,256,256);for(let i=0;i<220;i++){const x=Math.random()*256,y=Math.random()*256,r=6+Math.random()*30;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c2);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const STD=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,flatShading:true},o));
function glowS(c,sc,x,y,z,fl=true){const f=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));f.scale.setScalar(sc);f.position.set(x,y,z);f.userData.base=sc;if(fl){f.userData.flick=Math.random()*9;flick.push(f)}arena.add(f);return f}
function statue(x,z,s,m,eye){const g=new THREE.Group();const add=(geo,px,py,pz,rx=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);o.rotation.set(rx,0,rz);g.add(o);return o};
 add(new THREE.BoxGeometry(2.4,1,2.4),0,.5,0);add(new THREE.CylinderGeometry(.8,1.1,3.4,7),0,2.7,0);add(new THREE.BoxGeometry(2.6,.9,1.1),0,4.4,0);add(new THREE.DodecahedronGeometry(.7,0),0,5.4,0);
 add(new THREE.CylinderGeometry(.3,.35,2.6,6),-1.5,3.4,.3,0,.25);const sw=add(new THREE.BoxGeometry(.25,4.5,.5),1.5,4.2,.6,0,-.1);add(new THREE.CylinderGeometry(.3,.35,2.4,6),1.3,3.3,.3,0,-.2);
 g.position.set(x,-1,z);g.scale.setScalar(s);g.lookAt(0,-1,0);arena.add(g);if(eye){const e=glowS(eye,1.2*s,0,0,0,false);e.position.set(x*.98,-1+5.45*s,z*.98)}}
function rockIsle(x,y,z,s,m,top){const r=new THREE.Mesh(new THREE.ConeGeometry(1,2.2,7,1),m);r.rotation.x=Math.PI;r.position.set(x,y-1.1*s,z);r.scale.set(s,s,s);arena.add(r);const t=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.3,7),m);t.position.set(x,y,z);t.scale.set(s,1,s);arena.add(t);r.userData.bob=Math.random()*6;t.userData.bob=r.userData.bob;
 if(top){for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.22*s,(1+Math.random()*1.6)*s,6),m);const a=Math.random()*6.28;p.position.set(x+Math.cos(a)*.5*s,y+.6*s,z+Math.sin(a)*.5*s);arena.add(p);p.userData.bob=r.userData.bob}}}
function buildArena(w,quick,menu){if(arena)scene.remove(arena);arena=new THREE.Group();scene.add(arena);flick.length=0;spin.length=0;plights.length=0;obst.length=0;lavaTex=null;cloudM=null;const W=WORLDS[w];R=quick?9.5:[9,9.4,9,9.2,9.6][w];const q=S.q;
 scene.fog=new THREE.FogExp2(W.fog,[.024,.02,.022,.03,.02][w]);skyMat.uniforms.a.value.set(W.sky[0]);skyMat.uniforms.b.value.set(W.sky[1]);sun.color.set(W.light);hemi.color.set(W.amb).lerp(new THREE.Color(0xffffff),.25);hemi.groundColor.set(W.fog);
 const glowC=[0xff9a3a,0x9ad8ff,0xff6a1a,0x9a7aff,0x8ab8ff][w];
 const floorM=new THREE.MeshStandardMaterial({map:stoneTex(W.floor,W.edge,w+3),roughness:w==1?.22:.82,metalness:w==1?.25:0});
 if(w!==1){floorM.emissiveMap=crackTex('#'+glowC.toString(16).padStart(6,'0'),w+1);floorM.emissive=new THREE.Color(1,1,1);floorM.emissiveIntensity=[.35,0,.9,.55,.6][w]}
 const top=new THREE.Mesh(new THREE.CylinderGeometry(R,R,1.2,72,1),[STD(W.edge,{flatShading:false}),floorM,STD(W.edge)]);top.position.y=-.6;top.receiveShadow=true;arena.add(top);
 const trim=new THREE.Mesh(new THREE.TorusGeometry(R,.14,6,96),new THREE.MeshStandardMaterial({color:0x8a7040,metalness:.8,roughness:.35,emissive:glowC,emissiveIntensity:.25}));trim.rotation.x=Math.PI/2;trim.position.y=.02;arena.add(trim);
 const pm=STD(W.edge);const dark=STD(new THREE.Color(W.edge).multiplyScalar(.55));
 const under=new THREE.Mesh(new THREE.ConeGeometry(R*.98,10,40,3,true),pm);under.rotation.x=Math.PI;under.position.y=-6.2;arena.add(under);
 // shared: pillars + braziers around edge
 const pg=new THREE.CylinderGeometry(.35,.45,3.2,8);const np=w===3?6:8;
 for(let i=0;i<np;i++){const a=i/np*Math.PI*2+.2,x=Math.cos(a)*(R+.9),z=Math.sin(a)*(R+.9);const p=new THREE.Mesh(pg,pm);p.position.set(x,.6,z);p.castShadow=true;arena.add(p);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.6,.4,.35,8),dark);cap.position.set(x,2.3,z);arena.add(cap);glowS(glowC,1.7,x,2.75,z);
  if(w===0&&i%2===0){const b=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.8),new THREE.MeshStandardMaterial({map:bannerTex('#6a1410','#d9a84a'),side:THREE.DoubleSide,transparent:true,alphaTest:.5}));b.position.set(x*.95,1.2,z*.95);b.lookAt(0,1.2,0);b.userData.sway=Math.random()*6;spin.push(b);arena.add(b)}}
 // point lights (warm flicker)
 const nl=q===0?0:2;for(let i=0;i<nl;i++){const a=i*Math.PI+.6;const L=new THREE.PointLight(glowC,q>1?14:10,14,1.6);L.position.set(Math.cos(a)*(R-.5),2.6,Math.sin(a)*(R-.5));L.userData.f=Math.random()*9;plights.push(L);arena.add(L)}
 // distant titan statues
 const stM=STD(new THREE.Color(W.edge).multiplyScalar(.7));const ns=q===0?3:5;
 for(let i=0;i<ns;i++){const a=i/ns*Math.PI*2+.6;statue(Math.cos(a)*(R+14+i%2*5),Math.sin(a)*(R+14+i%2*5),2+i%2*.7,stM,[0xff5a1a,0x9ad8ff,0xff3a0a,0xb08aff,0x9ad8ff][w])}
 // floating isles
 const ni=q===0?6:12;for(let i=0;i<ni;i++){const a=Math.random()*6.28,d=R+5+Math.random()*16;rockIsle(Math.cos(a)*d,-2-Math.random()*7,Math.sin(a)*d,.8+Math.random()*1.8,pm,Math.random()<.4)}
 // rubble along edge
 const rg=new THREE.DodecahedronGeometry(.3,0);for(let i=0;i<(q?26:12);i++){const r=new THREE.Mesh(rg,dark);const a=Math.random()*6.28,d=R-.3-Math.random()*.4;r.position.set(Math.cos(a)*d,.05,Math.sin(a)*d);r.scale.setScalar(.5+Math.random());r.rotation.set(Math.random()*3,Math.random()*3,0);r.castShadow=true;arena.add(r)}
 const ob=(x,z,r,mesh)=>{if(menu)return;obst.push({x,z,r});mesh.position.x=x;mesh.position.z=z;mesh.castShadow=true;mesh.receiveShadow=true;arena.add(mesh)};
 if(w===0){// broken columns inside, 4
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,.9+(i%2)*.6,9),pm);c.position.y=.45+(i%2)*.3;c.castShadow=true;g.add(c);const bs=new THREE.Mesh(new THREE.BoxGeometry(1.4,.3,1.4),dark);bs.position.y=.15;g.add(bs);ob(Math.cos(a)*5.3,Math.sin(a)*5.3,.75,g)}}
 if(w===1){const im=new THREE.MeshStandardMaterial({color:0xaee4ff,emissive:0x2a6aa0,emissiveIntensity:.6,roughness:.1,metalness:.1,transparent:true,opacity:.85,flatShading:true});
  const cl=(x,z,s)=>{const g=new THREE.Group();for(let k=0;k<4;k++){const o=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),im);o.scale.set(.6,1.6+Math.random()*1.4,.6);o.position.set((Math.random()-.5)*.7,.8,(Math.random()-.5)*.7);o.rotation.set((Math.random()-.5)*.6,Math.random()*3,(Math.random()-.5)*.6);g.add(o)}g.scale.setScalar(s);return g};
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2+.5;ob(Math.cos(a)*5,Math.sin(a)*5,.8,cl(0,0,1))}
  for(let i=0;i<10;i++){const a=i/10*6.28+.3,g=cl(0,0,.9+Math.random());g.position.set(Math.cos(a)*(R+2.2),-.2,Math.sin(a)*(R+2.2));arena.add(g)}
  const sm=STD(0xe8f2ff,{roughness:1});for(let i=0;i<8;i++){const a=i/8*6.28,m=new THREE.Mesh(new THREE.ConeGeometry(12+Math.random()*8,18+Math.random()*14,7),sm);m.position.set(Math.cos(a)*60,-14,Math.sin(a)*60);arena.add(m)}}
 if(w===2){lavaTex=noiseTex('#5a0e00','rgba(255,140,30,.9)');lavaTex.repeat.set(8,8);const sea=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({map:lavaTex,color:0xffffff}));sea.rotation.x=-Math.PI/2;sea.position.y=-11;arena.add(sea);
  const am=STD(0x6a6470,{metalness:.6,roughness:.45,flatShading:false});for(let i=0;i<2;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,.8,.8),am);b.position.y=.4;g.add(b);const t=new THREE.Mesh(new THREE.BoxGeometry(1.9,.35,.9),am);t.position.y=.95;g.add(t);const hot=new THREE.Mesh(new THREE.BoxGeometry(.8,.1,.5),new THREE.MeshBasicMaterial({color:0xff7a2a}));hot.position.y=1.15;g.add(hot);g.rotation.y=i*1.3;ob(i?4.6:-4.6,i?-2:2,.95,g)}
  
  for(let i=0;i<4;i++){const a=i/4*6.28+.4,ch=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2.2,14,8),dark);ch.position.set(Math.cos(a)*(R+8),-2,Math.sin(a)*(R+8));arena.add(ch);glowS(0xff6a1a,5,ch.position.x,5.5,ch.position.z)}}
 if(w===3){const tm=STD(0x4a4458);for(let i=0;i<18;i++){const a=i/18*6.28+.1,t=new THREE.Mesh(new THREE.BoxGeometry(.6,.9+Math.random()*.5,.18),tm);t.position.set(Math.cos(a)*(R-.6),.4,Math.sin(a)*(R-.6));t.lookAt(0,.4,0);t.rotation.z=(Math.random()-.5)*.3;t.castShadow=true;arena.add(t);if(i%3===0)glowS(0xffc070,.5,t.position.x*.93,.9,t.position.z*.93)}
  const arcM=STD(0x2e2838);for(let i=0;i<6;i++){const a=i/6*6.28,g=new THREE.Mesh(new THREE.TorusGeometry(2,.3,6,12,Math.PI),arcM);g.position.set(Math.cos(a)*(R+2.5),2.4,Math.sin(a)*(R+2.5));g.lookAt(0,2.4,0);arena.add(g);for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,4.4,.5),arcM);p.position.copy(g.position).add(new THREE.Vector3(-Math.sin(a)*2*s,-2,Math.cos(a)*2*s));p.position.y=.2;arena.add(p)}}}
 if(w===4){const rm=STD(0x3a4458,{metalness:.5});for(let i=0;i<3;i++){const a=i/3*Math.PI*2+1,g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.15,.5,3,6),rm);p.position.y=1.5;g.add(p);const o=new THREE.Mesh(new THREE.OctahedronGeometry(.35,0),new THREE.MeshBasicMaterial({color:0xcfe8ff}));o.position.y=3.3;g.add(o);spin.push(o);ob(Math.cos(a)*5.2,Math.sin(a)*5.2,.6,g);glowS(0x9ad8ff,2,g.position.x,3.3,g.position.z)}
  for(let i=0;i<14;i++){const sh=new THREE.Mesh(new THREE.OctahedronGeometry(.6+Math.random(),0),rm);const a=Math.random()*6.28,d=R+3+Math.random()*6;sh.position.set(Math.cos(a)*d,2+Math.random()*5,Math.sin(a)*d);sh.scale.y=2;sh.userData.orb={a,d,s:.05+Math.random()*.1,y:sh.position.y};spin.push(sh);arena.add(sh)}
  cloudM=new THREE.MeshBasicMaterial({map:noiseTex('#0a0e18','rgba(140,160,200,.5)'),transparent:true,opacity:.9,depthWrite:false});cloudM.map.repeat.set(4,4);const cp=new THREE.Mesh(new THREE.PlaneGeometry(220,220),cloudM);cp.rotation.x=-Math.PI/2;cp.position.y=-9;arena.add(cp)}
 if(w===0){const sea=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({map:noiseTex('#140806','rgba(255,90,20,.35)')}));sea.material.map.repeat.set(6,6);sea.rotation.x=-Math.PI/2;sea.position.y=-14;arena.add(sea);lavaTex=sea.material.map}
 // ambient particles
 if(ambient)scene.remove(ambient);const N=Math.round((W.part==='rain'?500:300)*QK()),pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*40;pos[i*3+1]=Math.random()*16-2;pos[i*3+2]=(Math.random()-.5)*40}
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 ambient=new THREE.Points(gg,new THREE.PointsMaterial({map:GLOW,size:W.part==='rain'?.12:W.part==='snow'?.22:.18,color:{ember:0xff8a3a,snow:0xffffff,wisp:0x9a8aff,rain:0xaac8ff}[W.part],transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));ambient.userData.k=W.part;scene.add(ambient);
 Audio.key=w;Audio.setK&&Audio.setK();
 hz.length=0;hzT=3;blade=null;
 if(W.hz==='blade'){blade=new THREE.Group();const bm=new THREE.Mesh(new THREE.BoxGeometry(R*1.9,.25,.35),new THREE.MeshStandardMaterial({color:0x9aa0b0,metalness:.8,roughness:.3,emissive:0x4a2a8a,emissiveIntensity:.8}));bm.position.y=.5;bm.castShadow=true;blade.add(bm);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.6,.8,.8,12),new THREE.MeshStandardMaterial({color:0x3a3048,metalness:.5}));hub.position.y=.4;blade.add(hub);arena.add(blade)}
 arena.userData.w=w}
function updateArena(dt,T){if(!arena)return;flick.forEach(f=>f.scale.setScalar(f.userData.base*(.9+Math.sin(T*13+f.userData.flick)*.08+Math.random()*.06)));
 plights.forEach(L=>L.intensity=(S.q>1?14:10)*(.85+Math.sin(T*9+L.userData.f)*.1+Math.random()*.08));
 spin.forEach(o=>{if(o.userData.orb){const u=o.userData.orb;u.a+=dt*u.s;o.position.set(Math.cos(u.a)*u.d,u.y+Math.sin(T+u.d)*.4,Math.sin(u.a)*u.d);o.rotation.y+=dt}else if(o.userData.sway!==undefined)o.rotation.z=Math.sin(T*1.5+o.userData.sway)*.06;else o.rotation.y+=dt*2});
 if(lavaTex){lavaTex.offset.x+=dt*.01;lavaTex.offset.y+=dt*.006}if(cloudM)cloudM.map.offset.x+=dt*.015;
 arena.children.forEach(o=>{if(o.userData.bob!==undefined){o.position.y+=Math.sin(T+o.userData.bob)*dt*.2}});
 if(arena.userData.w===4){skyBolt-=dt;if(skyBolt<=0){skyBolt=4+Math.random()*6;flashT=Math.max(flashT,.06);if(state==='play')Audio.noise(1.2,200,.25,1,'lowpass')}}}
function pushObst(e){for(const o of obst){const dx=e.pos.x-o.x,dz=e.pos.z-o.z,d=Math.hypot(dx,dz),m=o.r+.4*e.sc;if(d<m&&d>0){e.pos.x=o.x+dx/d*m;e.pos.z=o.z+dz/d*m;const vn=(e.vel.x*dx+e.vel.z*dz)/d;if(vn<0){e.vel.x-=vn*dx/d;e.vel.z-=vn*dz/d}}}}
// ================= FX =================
const fxGroup=new THREE.Group();scene.add(fxGroup);const sparks=[];
const sparkMatCache={};function sMat(c){return sparkMatCache[c]||(sparkMatCache[c]=new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}))}
const sparkPool=[];
function burst(p,c,n=12,sp=6,life=.5,size=.35,up=3){n=Math.max(1,Math.round(n*QK()));for(let i=0;i<n;i++){let s=sparkPool.pop();if(!s){s=new THREE.Sprite(sMat(c));fxGroup.add(s)}s.material=sMat(c);s.visible=true;s.position.copy(p);const a=Math.random()*6.28,v=Math.random()*sp;s.userData={vx:Math.cos(a)*v,vy:Math.random()*up+1,vz:Math.sin(a)*v,l:life*(.6+Math.random()*.6),L:life,sz:size};sparks.push(s)}}
const rings=[];function ring(p,r,c,life=.4){const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:RING,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.06,p.z);m.userData={r,l:life,L:life};fxGroup.add(m);rings.push(m)}
const slashGeo=new THREE.RingGeometry(.55,1,32,1,-1.1,2.2),slashGeo2=new THREE.RingGeometry(.85,1.08,32,1,-1.25,2.5);
function slash(e,c){const s=e.h.range*e.sc*(e.rm||1);const mk=(g,op,y,l,rz)=>{const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.rotation.z=-e.face+Math.PI/2+rz;m.position.set(e.pos.x,y,e.pos.z);m.scale.setScalar(s);m.userData={l,L:l,sl:1,s0:s,op};fxGroup.add(m);rings.push(m)};
 const alt=(e._alt=-(e._alt||1));mk(slashGeo,.95,1,.2,alt*.15);if(e.team===0){mk(slashGeo2,.5,1.15,.28,alt*.3);const fx=Math.sin(e.face),fz=Math.cos(e.face);for(let i=0;i<5;i++){const a=e.face+(i/4-.5)*2.2;burst(new THREE.Vector3(e.pos.x+Math.sin(a)*s*.9,1.05,e.pos.z+Math.cos(a)*s*.9),c,1,.6,.25,.28,.2)}}}
function shock(p,c,r=1.6){ring(p,r,c,.25)}
// coins
const coinMat=new THREE.SpriteMaterial({map:GLOW,color:0xffd24a,blending:THREE.AdditiveBlending,depthWrite:false});const coinsFx=[];let bcoins=0,coinSnd=0;
function dropCoins(p,n){for(let i=0;i<n;i++){const s=new THREE.Sprite(coinMat);s.scale.setScalar(.45);s.position.set(p.x,1,p.z);fxGroup.add(s);const a=Math.random()*6.28,v=2+Math.random()*3;coinsFx.push({s,vx:Math.cos(a)*v,vy:5+Math.random()*3,vz:Math.sin(a)*v,t:0})}}
function updCoins(dt){for(let i=coinsFx.length-1;i>=0;i--){const c=coinsFx[i];c.t+=dt;const p=c.s.position;if(c.t<.55||!player){c.vy-=16*dt;p.x+=c.vx*dt;p.y=Math.max(.3,p.y+c.vy*dt);p.z+=c.vz*dt}else{const tx=player.pos.x-p.x,ty=1.2-p.y,tz=player.pos.z-p.z,d=Math.hypot(tx,ty,tz);const sp=8+c.t*20;p.x+=tx/d*sp*dt;p.y+=ty/d*sp*dt;p.z+=tz/d*sp*dt;if(d<.5){fxGroup.remove(c.s);coinsFx.splice(i,1);bcoins++;const bc=$('bcoin');if(bc){bc.textContent='🪙 '+bcoins;bc.classList.remove('pop');void bc.offsetWidth;bc.classList.add('pop')}if(T-coinSnd>.06){coinSnd=T;Audio.coin()}continue}}if(c.t>4){fxGroup.remove(c.s);coinsFx.splice(i,1)}}}
function clearCoins(){coinsFx.forEach(c=>fxGroup.remove(c.s));coinsFx.length=0}
// combo
let combo=0,comboT=0;const CTIER=[[50,'TITANIC!','c4'],[35,'UNSTOPPABLE!','c4'],[20,'SAVAGE!','c3'],[10,'BRUTAL!','c2'],[5,'','c1']];
function addCombo(){combo++;comboT=2.6;const el=$('combo');if(!el)return;const t=CTIER.find(x=>combo>=x[0]);el.className=t?t[2]:'';el.innerHTML=combo>=2?`<b>${combo}</b> HIT COMBO`:'';el.style.opacity=combo>=2?1:0;el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),80);
 const m=CTIER.find(x=>x[0]===combo&&x[1]);if(m){banner(m[1],'cb');Audio.tone(440+combo*8,.4,'sawtooth',.12,880);ring(player.pos,5,curFx().hit,.5);burst(player.pos.clone().setY(1),curFx().hit,30,7,.6,.4,5);happyMini()}}
function happyMini(){shake=Math.max(shake,.2)}
const curFx=()=>FXP[trial&&trial.fx!=null?trial.fx:S.fxs]||FXP[0];
const curWp=id=>{const i=trial&&trial.wp!=null&&trial.hero===id?trial.wp:trial&&trial.wp!=null&&!trial.hero?trial.wp:(S.wsel[id]||0);return WEAPONS[i]};
let trial=null;
let shake=0,hitstop=0,fovK=0;let vlT=0;function vigLow(){if(T-vlT>1.2){vlT=T;vig('#8a0000',.25)}}
const labels=document.getElementById('labels');
function dmgText(p,v,cls=''){const d=document.createElement('div');d.className='dmg '+cls;d.textContent=v;labels.appendChild(d);d._p=p.clone().add(new THREE.Vector3((Math.random()-.5)*.6,2.2,0));d._t=.8;dmgs.push(d)}
const dmgs=[];
// ================= ENTITIES =================
let ents=[],player=null,mode=null,stageW=0,stageN=0,wave=0,waves=1,time=0,state='menu',kos=0,dmgTaken=0,spUsed=0,revived=false,bossE=null;
const hz=[];let hzT=0,blade=null;
function makeEnt(id,team,opt={}){const h=HEROES[HI[id]];const sc=opt.scale||1;const tint=opt.tint!==undefined?opt.tint:null;const c=makeChar(id,tint,sc);scene.add(c.root);
 const l=team===0?lvOf(id):{p:0,v:0};const mult=opt.mult||1;
 const e={id,h,team,root:c.root,body:c.body,mat:c.mat,sc,pos:new THREE.Vector3(),vel:new THREE.Vector3(),face:0,hp:h.hp*(1+.1*l.v)*mult*(opt.hpm||1),dmg:h.dmg*(1+.1*l.p)*(team?(.3+.3*mult)*(opt.dm||1):1+curWp(id).d),rm:team?1:1+curWp(id).r,swing:0,spd:h.spd*(team?.78:1)*(opt.spdm||1),
  atkCd:0,spCd:team?h.cd*1.5:1,dashCd:0,stun:0,flash:0,wind:0,frenzy:0,falling:0,dead:0,squash:0,boss:!!opt.boss,ai:{t:Math.random(),strafe:Math.random()<.5?1:-1},inv:0,charge:0,blink:0};
 e.max=e.hp;c.root.children[1].material.color.set(team?0x8a0a0a:0xffc040);c.root.children[1].material.opacity=team?.5:.4;
 if(team===0){const wp=curWp(id);if(wp.ty){const m=wpModel(wp.ty,wp.c);c.body.add(m);e.wmod=m}if(wp.d>0){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:wp.c,blending:THREE.AdditiveBlending,depthWrite:false}));g.position.set(.45,1.05,.35);g.scale.setScalar(.6+wp.d*2.5);g.userData.wg=1;c.body.add(g);e.wglow=g}}
 if(team){const b=document.createElement('div');b.className='ehp'+(e.boss?' boss':'');b.innerHTML='<i></i>';labels.appendChild(b);e.bar=b}
 ents.push(e);return e}
function clearEnts(){toks.clear();ents.forEach(e=>{scene.remove(e.root);e.bar&&e.bar.remove()});ents=[];dmgs.forEach(d=>d.remove());dmgs.length=0;bossE=null;const bb=document.getElementById('bossbar');bb&&bb.remove()}
function damage(t,amt,from,kb=6,crit=false){if(t.dead||t.falling||t.inv>0)return;
 if(t===player&&t.block&&from&&from.team&&amt>0&&T-t.blockT0>=.32){t.st=(t.st||0)-Math.min(45,amt*1.6+8);t.stD=.8;if(t.st<=0){t.st=0;t.block=0;t.stun=.8;moveTxt('GUARD BROKEN','h');Audio.boom();shake=Math.max(shake,.4)}}
 if(t===player&&t.block&&from&&from.team&&amt>0){if(T-t.blockT0<.32){t.inv=.4;from.stun=1.4;from.flash=.3;slowmo(.45,.2);zoomT=.4;zoomTgt=t;moveTxt('PERFECT PARRY!','p');ring(t.pos,3,0x9ad8ff,.4);burst(t.pos.clone().setY(1.2),0xffffff,24,7,.4,.35,3);Audio.tone(1200,.25,'triangle',.12,1800);addUlt(t,15);quest&&0;
   setTimeout(()=>{if(from.dead||t.dead)return;t.face=Math.atan2(from.pos.x-t.pos.x,from.pos.z-t.pos.z);t.swing=.3;slash(t,0x9ad8ff);moveTxt('COUNTER','f');damage(from,t.dmg*2.4,t,14,true)},140);return}
  amt*=.25;kb*=.3;burst(t.pos.clone().setY(1.2),0x9ad8ff,6,3,.2,.25,1);addUlt(t,3)}
 if(t.team&&t.eblock>0&&from===player&&amt>0){const fx=Math.sin(t.face),fz=Math.cos(t.face);tmp.subVectors(from.pos,t.pos).setY(0).normalize();if(tmp.x*fx+tmp.z*fz>.2){if(amt>=from.dmg*2.2){t.eblock=0;t.stun=1.1;moveTxt('GUARD BREAK!','h');ring(t.pos,2.5,0xffd36a,.4);Audio.boom()}else{amt*=.25;kb*=.3;dmgText(t.pos,'BLOCK','b');burst(t.pos.clone().setY(1.2),0x9ad8ff,8,4,.25,.25,1);Audio.tone(900,.12,'square',.06,600);t.swing=.2}}}
 if(amt>0){t.hitT=amt>=t.max*.12||kb>=12?.45:.25;if(t.rec>0&&from===player){amt*=1.35;crit=crit||Math.random()<.4}if(t.team&&from===player&&!t.boss){t.poise=(t.poise||0)+(kb>=12?2:1);t.poiseT=1.6;if(t.poise>=3&&t.wind>0){t.wind=0;t.ecombo=0;t.stun=.55;t.poise=0;moveTxt('STAGGER','h');releaseTok(t)}}if(t===player&&!t.block){t.stun=Math.max(t.stun,kb>=10?.35:.18);t.vel.multiplyScalar(1)}}
 if(from===player&&t.team&&amt>0)addUlt(player,3.2);if(t===player&&amt>0)addUlt(t,amt/t.max*35);if(from&&from.team===0&&t.team){addCombo();amt*=1+Math.min(.3,combo*.01)}amt=Math.round(amt*(crit?1.8:1));t.hp-=amt;t.flash=.15;t.squash=.25;
 const d=new THREE.Vector3().subVectors(t.pos,from?from.pos:t.pos.clone().add(new THREE.Vector3(0,0,-1)));d.y=0;d.normalize();const res=t.boss?.35:1;t.vel.addScaledVector(d,kb*res);
 dmgText(t.pos,amt,t.team===0?'p':crit?'c':'');Audio.hit(t.team===0);const hc=t.team===0?0xff3a3a:from&&from.team===0?curFx().hit:0xffc46a;const fk=from&&from.team===0?curFx().k:1;burst(t.pos.clone().setY(1.1),hc,Math.round(10*fk),5+fk,.35,.3);burst(t.pos.clone().setY(1.1),0xffffff,crit?8:3,8,.15,.22,1);if(t.team)shock(t.pos,hc,crit?2.6:1.5);
 if(t.team===0){dmgTaken+=amt;shake=Math.max(shake,.25);combo=0;const el=$('combo');if(el)el.style.opacity=0;vig('#ff2a1a',.35)}else shake=Math.max(shake,.12);hitstop=Math.max(hitstop,crit?.11:kb>=12?.09:t.team===0?.07:.055);if(kb>=12&&from===player)fovK=Math.max(fovK,4);
 if(from&&from.frenzy>0)from.hp=Math.min(from.max,from.hp+amt*.3);
 if(t.hp<=0)kill(t)}
function kill(t){releaseTok(t);t.dead=1;t.hp=0;if(t.team){dropCoins(t.pos,t.boss?30:3+(Math.random()*3|0));const left=ents.filter(e=>e.team&&!e.dead).length;if(t.boss){slowmo(1.9,.16);zoomT=1.9;zoomTgt=t;banner('TITAN SLAIN','big');flashT=.15;Audio.win()}else if(left===0){slowmo(.8,.25);zoomT=.7;zoomTgt=t}else slowmo(.14,.4)}burst(t.pos.clone().setY(1),t.boss?0xff6a2a:0xffaa5a,t.boss?60:28,9,.9,.5,6);ring(t.pos,t.boss?8:3.5,0xffaa5a,.6);Audio.boom();
 if(t.team){kos++;quest('ko');S.coins+=t.boss?0:0;}if(t.bar){t.bar.remove();t.bar=null}
 if(t===player)setTimeout(()=>endBattle(false),900)}
// ================= COMBAT =================
const wMet=new THREE.MeshStandardMaterial({color:0xc8ccd8,metalness:.85,roughness:.28}),wWood=new THREE.MeshStandardMaterial({color:0x4a2e1a,roughness:.8}),wGold=new THREE.MeshStandardMaterial({color:0xd9a84a,metalness:.9,roughness:.3});
function wpModel(ty,c){const g=new THREE.Group(),gl=new THREE.MeshBasicMaterial({color:c});const add=(geo,m,x,y,z,rz=0,rx=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.z=rz;o.rotation.x=rx;o.castShadow=true;g.add(o);return o};const B=(a,b,c2)=>new THREE.BoxGeometry(a,b,c2),C=(a,b,h,n=8)=>new THREE.CylinderGeometry(a,b,h,n);
 const hand=(grp,x)=>{grp.position.set(x*1.3,.9,.3);grp.rotation.x=.45;grp.rotation.z=x>0?-.15:.15;return grp};
 if(ty==='sword'){add(C(.025,.025,.22),wWood,0,0,0);add(B(.3,.05,.07),wGold,0,.13,0);add(B(.08,.95,.025),wMet,0,.62,0);add(B(.025,.95,.03),gl,0,.62,0)}
 else if(ty==='greatsword'){add(C(.03,.03,.36),wWood,0,0,0);add(B(.46,.07,.09),wGold,0,.2,0);add(B(.15,1.45,.035),wMet,0,.95,0);add(B(.035,1.4,.04),gl,0,.95,0)}
 else if(ty==='axe'){add(C(.03,.035,1.1),wWood,0,.4,0);add(B(.36,.3,.04),wMet,.16,.85,0);add(B(.04,.32,.05),gl,.34,.85,0);add(B(.14,.14,.05),wGold,-.08,.85,0)}
 else if(ty==='spear'){add(C(.025,.03,1.8),wWood,0,.55,0);add(new THREE.ConeGeometry(.07,.38,6),wMet,0,1.6,0);add(new THREE.ConeGeometry(.03,.3,6),gl,0,1.62,0);add(B(.16,.04,.04),wGold,0,1.4,0)}
 else if(ty==='hammer'){add(C(.03,.035,1.1),wWood,0,.4,0);add(B(.46,.28,.28),wMet,0,.95,0);add(B(.48,.06,.3),gl,0,.95,0)}
 else if(ty==='daggers'){const one=()=>{const d=new THREE.Group();[[C(.02,.02,.14),wWood,0,0],[B(.14,.03,.05),wGold,0,.08],[B(.05,.45,.02),wMet,0,.32],[B(.015,.45,.025),gl,0,.32]].forEach(a=>{const o=new THREE.Mesh(a[0],a[1]);o.position.set(a[2],a[3],0);d.add(o)});return d};const L=hand(one(),.42),Rr=hand(one(),-.42);const w=new THREE.Group();w.add(L,Rr);w.userData.dual=1;return w}
 else if(ty==='bow'){const t=add(new THREE.TorusGeometry(.6,.03,6,18,Math.PI*1.1),wWood,0,0,0,Math.PI/2-.55);add(B(.012,1.1,.012),gl,-.33,0,0);g.position.set(.4,1.05,.3);g.rotation.y=Math.PI/2;return g}
 else if(ty==='staff'){add(C(.03,.04,1.7),wWood,0,.55,0);add(new THREE.SphereGeometry(.13,12,10),gl,0,1.5,0);add(new THREE.TorusGeometry(.15,.025,6,14),wGold,0,1.5,0);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false}));sp.position.set(0,1.5,0);sp.scale.setScalar(.7);g.add(sp)}
 else if(ty==='scythe'){add(C(.025,.03,1.8),wWood,0,.55,0);const bl=add(new THREE.TorusGeometry(.5,.045,4,14,Math.PI*.65),wMet,-.48,1.35,0,.25);add(new THREE.TorusGeometry(.53,.015,4,14,Math.PI*.65),gl,-.48,1.35,0,.25)}
 return hand(g,-.42)}
const AIT={knight:'aggr',wolf:'aggr',minotaur:'aggr',demon:'aggr',lich:'ranged',archer:'ranged',dragon:'ranged',golem:'tank',giant:'tank',rogue:'assassin',assassin:'assassin',valkyrie:'assassin'};
const AIP={aggr:{keep:0,wind:.34,combo:3,lunge:.35,dodge:.08,block:.05},ranged:{keep:6.5,wind:.42,combo:2,shot:1,dodge:.3,block:0},tank:{keep:0,wind:.55,combo:1,slam:.55,dodge:0,block:.4},assassin:{keep:0,wind:.24,combo:2,lunge:.55,dodge:.4,block:0}};
function warn(e,r,t,c=0xff2a1a){ring(e.pos.clone().add(new THREE.Vector3(Math.sin(e.face)*r*.45,0,Math.cos(e.face)*r*.45)),r,c,t)}
const toks=new Set();function releaseTok(e){toks.delete(e)}function tokMax(){return mode==='camp'&&stageW===0?1:stageN>=6||mode==='gaunt'?2:2}
function eAtk(e){const P=AIP[e.ait];const k=e.akind;e.swing=.3;
 if(k==='shot'){shot(e,e.face,e.boss?0xff3a3a:0xff7a4a,.85,0);burst(e.pos.clone().setY(1.1),0xff7a4a,5,2,.2,.3,0);Audio.zap()}
 else if(k==='slam'){e.squash=.4;ring(e.pos,3.4,0xff6a2a,.45);burst(e.pos.clone().setY(.3),0xc9a070,26,6,.5,.4,3);Audio.boom();shake=Math.max(shake,.3);ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<3.1){damage(t,e.dmg*1.4,e,11);if(!t.inv)t.stun=Math.max(t.stun,.35)}})}
 else if(k==='lunge'){const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x=fx*15;e.vel.z=fz*15;slash(e,0xff5a3a);Audio.swing();setTimeout(()=>{if(!e.dead)ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<e.h.range*e.sc+1)damage(t,e.dmg*1.15,e,8)})},90)}
 else{e.atkCd=0;attack(e)}
 e.atkCd=(e.ecombo>0?.05:(e.boss?.9:1.25))*(P.wind>.5?1.3:1);if(!(e.ecombo>0)){e.rec=e.boss?.45:.6;releaseTok(e)}
 if(e.ecombo>0){e.ecombo--;e.wind=.17;e.akind=k==='slam'?'swing':k}}
function eReact(pl){const fx=Math.sin(pl.face),fz=Math.cos(pl.face),dk=stageW===0&&mode==='camp'?.35:1;ents.forEach(e=>{if(!e.team||e.dead||e.stun>0||e.wind>0||e.leap)return;tmp.subVectors(e.pos,pl.pos);const d=tmp.length();if(d>4.2)return;if((tmp.x*fx+tmp.z*fz)/d<.3)return;const P=AIP[e.ait];
 if(Math.random()<P.block*dk){e.eblock=.55;e.squash=.15}
 else if((e.dodgeCd||0)<=0&&Math.random()<P.dodge*dk){e.dodgeCd=2.2;const sd=Math.random()<.5?1:-1;e.vel.x+=(-fz*sd+tmp.x/d*.6)*15;e.vel.z+=(fx*sd+tmp.z/d*.6)*15;e.inv=.22;burst(e.pos.clone().setY(.4),0xffffff,8,2,.3,.3,1);Audio.dash()}})}
const styleOf=e=>{const w=curWp(e.id);return WT[(w&&w.ty)||HSTYLE[e.id]||'sword']};
const ULTGAIN=()=>S.mv.ultx?1.5:1;
function addUlt(e,v){if(e!==player)return;const was=e.ult>=100;e.ult=Math.min(100,(e.ult||0)+v*ULTGAIN());if(!was&&e.ult>=100){Audio.tone(660,.3,'triangle',.1,990);moveTxt('ULTIMATE READY','u')}}
function moveTxt(t,c=''){const d=document.createElement('div');d.className='mvt '+c;d.textContent=t;$('hud').appendChild(d);setTimeout(()=>d.remove(),900)}
function hitArc(e,r,arc,dm,kb,crit,stun){let n=0;const fx=Math.sin(e.face),fz=Math.cos(e.face);ents.forEach(t=>{if(t.team===e.team||t.dead)return;tmp.subVectors(t.pos,e.pos);tmp.y=0;const d=tmp.length();if(d>r+.4*t.sc)return;tmp.normalize();if(tmp.x*fx+tmp.z*fz<arc&&d>.9)return;damage(t,e.dmg*dm,e,kb,crit||Math.random()<.15);if(stun)t.stun=Math.max(t.stun,stun);n++});return n}
function hitRad(e,p,r,dm,kb,stun){ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(p)<r+.4*t.sc){damage(t,e.dmg*dm,e,kb);if(stun)t.stun=Math.max(t.stun,stun)}})}
function aim(e,r=10){const fx=Math.sin(e.face),fz=Math.cos(e.face);let best=null,bd=1e9;ents.forEach(t=>{if(t.team===e.team||t.dead)return;tmp.subVectors(t.pos,e.pos);const d=tmp.length();if(d<r&&(tmp.x*fx+tmp.z*fz)/d>.3&&d<bd){bd=d;best=t}});if(best)e.face=Math.atan2(best.pos.x-e.pos.x,best.pos.z-e.pos.z)}
function shot(e,a,c,dm,big){const b=newBolt(e,a,c);b.vx*=2;b.vz*=2;b.noHome=1;b.l=.8;b.dm=dm;if(big){b.pierce=new Set();b.s.scale.setScalar(1.3)}else b.s.scale.set(.6,.6,1);bolts.push(b)}
function finisher(e,st,col){const fx=Math.sin(e.face),fz=Math.cos(e.face),r=e.h.range*e.sc*(e.rm||1)*st.r+.4;moveTxt(st.fn,'f');shake=Math.max(shake,.3);Audio.boom();
 switch(st.fin){
 case'spin':e.spin=.35;slash(e,col);setTimeout(()=>slash(e,col),90);hitArc(e,r*1.25,-1.1,1.6*st.d,10,true);ring(e.pos,r*1.3,col,.4);break;
 case'slam':{const p=e.pos.clone().add(new THREE.Vector3(fx*1.6,0,fz*1.6));ring(p,4.5,col,.5);burst(p.clone().setY(.3),col,40,8,.6,.45,5);hitRad(e,p,2.8,2*st.d,13,.6);slowmo(.15,.3);break}
 case'cleave':hitArc(e,r*1.1,0,2.4*st.d,14,true);ring(e.pos,r,col,.35);burst(e.pos.clone().setY(1),col,26,7,.5,.4,3);break;
 case'lunge':e.vel.x=fx*19;e.vel.z=fz*19;e.inv=.25;setTimeout(()=>hitArc(e,r*1.6,.6,1.8*st.d,15,true),90);burst(e.pos.clone().setY(1),col,16,3,.4,.35);break;
 case'quake':ring(e.pos,5,col,.6);ring(e.pos,3,0xffffff,.3);burst(e.pos.clone().setY(.3),col,46,9,.7,.45,6);hitRad(e,e.pos,4.2,1.8*st.d,12,1);shake=.5;slowmo(.15,.3);break;
 case'flurry':[0,80,160].forEach((d,k)=>setTimeout(()=>{if(e.dead)return;slash(e,col);Audio.swing();hitArc(e,r*1.1,.2,.9*st.d,k==2?12:3,k==2)},d));break;
 case'volley':for(let i=-1;i<=1;i++)shot(e,e.face+i*.22,col,1.3*st.d,1);break;
 case'nova':ring(e.pos,5,col,.5);burst(e.pos.clone().setY(1),col,40,8,.6,.45,3);hitRad(e,e.pos,4,1.6*st.d,14);break;
 case'reap':slash(e,col);e.spin=.35;ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<5){tmp.subVectors(e.pos,t.pos).setY(0).normalize();t.vel.addScaledVector(tmp,9);damage(t,e.dmg*1.5*st.d,e,0);e.hp=Math.min(e.max,e.hp+e.dmg*.3)}});ring(e.pos,5,col,.5);break}}
function heavy(e){if(e.dead||e.stun>0||e.leap)return;if(e===player){if((e.st??100)<15){moveTxt('NO STAMINA','h');return}e.st-=15;e.stD=.6}const st=styleOf(e),col=curWp(e.id).ty?curWp(e.id).c:curFx().sl,r=e.h.range*e.sc*(e.rm||1)*st.r+.4;e.atkCd=.55;e.swing=.3;e.squash=-.35;aim(e);moveTxt('HEAVY STRIKE','h');Audio.boom();Audio.swing();shake=.45;hitstop=.08;
 if(st.ranged){shot(e,e.face,col,3*st.d,1);ring(e.pos,2.5,col,.3)}else{slash(e,col);setTimeout(()=>slash(e,0xffffff),60);hitArc(e,r*1.4,-.1,2.6*st.d,17,true,.5);ring(e.pos.clone().add(new THREE.Vector3(Math.sin(e.face)*1.5,0,Math.cos(e.face)*1.5)),3.5,col,.45)}
 burst(e.pos.clone().setY(1),col,30,7,.5,.4,3)}
function jump(e){if(e.dead||e.stun>0||e.leap||(e.jumpCd||0)>0||e.block)return;e.jumpCd=1.2;const to=e.pos.clone().add(new THREE.Vector3(Math.sin(e.face)*4.2,0,Math.cos(e.face)*4.2));e.leap={t:0,L:.6,from:e.pos.clone(),to,small:1};e.inv=.45;Audio.dash();burst(e.pos.clone().setY(.3),0xffffff,12,3,.4,.3,1)}
function plunge(e){const L=e.leap;if(!L||!L.small||L.pl)return;L.pl=1;L.from=e.pos.clone().setY(0);const near=ents.filter(t=>t.team!==e.team&&!t.dead).sort((a,b)=>a.pos.distanceTo(e.pos)-b.pos.distanceTo(e.pos))[0];if(near&&near.pos.distanceTo(e.pos)<6)L.to=near.pos.clone();L.t=0;L.L=.16;moveTxt('AERIAL PLUNGE','f')}
function blockOn(e,on){if(!e||e.dead)return;if(on&&!e.block){if((e.st??100)<5)return;e.atkCd=Math.min(e.atkCd,.05);e.block=1;if((e.pcd||0)<=0){e.blockT0=T;e.pcd=.6}}else if(!on)e.block=0}
function grab(e){if(!S.mv.grab||e.dead||e.stun>0||e.leap||(e.grabCd||0)>0)return;const fx=Math.sin(e.face),fz=Math.cos(e.face);let t=null,bd=2.6;ents.forEach(o=>{if(o.team!==e.team&&!o.dead&&!o.falling){const d=o.pos.distanceTo(e.pos);if(d<bd){bd=d;t=o}}});if(!t)return;e.grabCd=2.5;Audio.boom();
 if(t.boss){t.stun=.6;damage(t,e.dmg,e,4);moveTxt('TOO HEAVY!','h');return}
 let dx=t.pos.x,dz=t.pos.z;const dl=Math.hypot(dx,dz);if(dl>.5){dx/=dl;dz/=dl}else{dx=fx;dz=fz}const ax=fx*.6+dx*.4,az=fz*.6+dz*.4,al=Math.hypot(ax,az)||1;
 t.stun=1.4;t.thrown=.45;t.vel.set(ax/al*27,0,az/al*27);damage(t,e.dmg*1.2,e,0);e.face=Math.atan2(ax,az);e.swing=.3;slash(e,0xffd36a);moveTxt('THROW!','f');burst(t.pos.clone().setY(1.5),0xffd36a,20,4,.4)}
function ultimate(e){if(!e||(e.ult||0)<100||e.dead||e.falling||e.leap)return;e.ult=0;const u=ULTS[e.id]||ULTS.knight,c=u[2],hex='#'+c.toString(16).padStart(6,'0');e.inv=2.2;
 slowmo(.9,.1);zoomT=.9;zoomTgt=e;banner('⚡ '+u[0].toUpperCase()+' ⚡','big');vig(hex,.75);$('lbox').classList.add('on');setTimeout(()=>$('lbox').classList.remove('on'),1500);Audio.tone(110,1.2,'sawtooth',.16,440);Audio.tone(220,1.2,'square',.06,880);
 ring(e.pos,3,c,.8);burst(e.pos.clone().setY(1),c,60,3,1,.5,8);quest('sp');
 setTimeout(()=>{if(state!=='play')return;flashT=.18;shake=.7;Audio.boom();const foes=ents.filter(t=>t.team!==e.team&&!t.dead);const D=e.dmg*3.2;
  if(u[1]==='nova'){[0,140,280].forEach((d,k)=>setTimeout(()=>{ring(e.pos,5+k*3.5,c,.7);burst(e.pos.clone().setY(.5),c,50,12,.8,.5,4)},d));foes.forEach(t=>{if(t.pos.distanceTo(e.pos)<12){damage(t,D,e,18,true);t.stun=1.2;if(e.id==='giant')t.frozen=t.stun=2.5}})}
  else if(u[1]==='meteor'){const pts=foes.map(t=>t.pos.clone());for(let i=0;i<5;i++){const a=Math.random()*6.28,r=Math.random()*R*.8;pts.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r))}pts.forEach((p,i)=>setTimeout(()=>meteor(e,p,c,D),i*110))}
  else if(u[1]==='storm'){foes.concat(foes).forEach((t,i)=>setTimeout(()=>{if(t.dead)return;bolt3d(t.pos,c);damage(t,D*.6,e,8,true);t.stun=1.2},i*120))}
  else{let k=0;const tg=foes.concat(foes).slice(0,12);tg.forEach((t,i)=>setTimeout(()=>{if(e.dead||t.dead)return;burst(e.pos.clone().setY(1),c,14,4,.4);e.pos.copy(t.pos).add(new THREE.Vector3((Math.random()-.5)*1.4,0,(Math.random()-.5)*1.4));clampIn(e);e.face=Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z);Audio.swing();slash(e,c);damage(t,D*.55,e,6,true)},i*90));if(e.id==='wolf')e.frenzy=6}
  slowmo(.35,.35)},650)}
const falls=[];function meteor(e,p,c,D){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(2.2);s.position.set(p.x+3,14,p.z-2);fxGroup.add(s);falls.push({s,p,t:0,L:.35,hit:()=>{ring(p,4,c,.5);burst(p.clone().setY(.4),c,30,8,.6,.45,6);burst(p.clone().setY(.4),0xffffff,8,6,.3,.3,3);Audio.boom();shake=Math.max(shake,.4);hitRad(e,p,2.4,D/e.dmg*.8,12,.8)}})}
function bolt3d(p,c){const m=new THREE.Mesh(new THREE.BoxGeometry(.25,16,.25),new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(p.x,8,p.z);fxGroup.add(m);falls.push({s:m,p,t:0,L:.25,beam:1});ring(p,3,c,.4);burst(p.clone().setY(1),c,24,6,.5,.4,6);Audio.zap();flashT=.08}
function updFalls(rdt){for(let i=falls.length-1;i>=0;i--){const f=falls[i];f.t+=rdt;const k=Math.min(1,f.t/f.L);if(f.beam){f.s.material.opacity=1-k;f.s.scale.x=f.s.scale.z=1+k*2}else{f.s.position.set(f.p.x+3*(1-k),14*(1-k)+.5,f.p.z-2*(1-k));if(Math.random()<.8)burst(f.s.position,0xffa040,1,1,.3,.4,0)}if(k>=1){f.hit&&f.hit();fxGroup.remove(f.s);falls.splice(i,1)}}}

const tmp=new THREE.Vector3();
function attack(e){if(e.team===0&&e.leap&&S.mv.plunge){plunge(e);return}if(e===player&&(e.atkCd>0||e.stun>0)&&!e.dead){e.buf=T;return}if(e.atkCd>0||e.stun>0||e.dead||e.falling||e.leap||e.block)return;
 if(e.team===0){const st=styleOf(e),wp=curWp(e.id),col=wp.ty?wp.c:wp.d>0?wp.c:curFx().sl;tutEv('atk');aim(e);if(!tutOn)eReact(e);
  if((e.dashT||0)>0){e.dashT=0;e.atkCd=.4;const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x=fx*22;e.vel.z=fz*22;e.inv=.3;e.swing=.3;slash(e,col);moveTxt('DASH STRIKE','f');Audio.swing();burst(e.pos.clone().setY(.8),col,18,3,.4,.35);setTimeout(()=>hitArc(e,(e.h.range*e.sc*st.r+.4)*1.7,.5,1.7*st.d,12,true),70);return}
  const chain=S.mv.chain4?4:3;if(T-(e.lastA||0)>.95)e.cstep=0;const k=e.cstep||0,fin=k>=chain-1;e.lastA=T;e.cstep=fin?0:k+1;e.sdir=k%2?-1:1;
  e.atkCd=.42*st.sp*(fin?1.35:1)*(e.frenzy>0?.5:1);e.squash=-.2;e.swing=.3;Audio.swing();
  if(fin&&k===3){slash(e,0xffd36a);moveTxt('EXECUTIONER','f');hitArc(e,(e.h.range*e.sc*(e.rm||1)*st.r+.4)*1.2,0,3*st.d,16,true,.5);ring(e.pos,3,0xffd36a,.4);return}
  if(fin){finisher(e,st,col);return}
  if(st.ranged){shot(e,e.face,col,(st.ranged===2?1.1:1)*st.d,0);burst(e.pos.clone().setY(1.1),col,4,2,.2,.3,0);return}
  slash(e,col);hitArc(e,e.h.range*e.sc*(e.rm||1)*st.r+.4,st.arc,st.d,7,false);return}
e.atkCd=(e.frenzy>0?.22:.45);e.squash=-.2;e.swing=.3;Audio.swing();const wp=e.team?null:curWp(e.id);slash(e,e.team?0xff7a5a:wp.d>0?wp.c:curFx().sl);if(e.team===0)tutEv('atk');
 const r=e.h.range*e.sc*(e.rm||1)+.4,fx=Math.sin(e.face),fz=Math.cos(e.face);
 ents.forEach(t=>{if(t.team===e.team||t.dead)return;tmp.subVectors(t.pos,e.pos);tmp.y=0;const d=tmp.length();if(d>r+.4*t.sc)return;tmp.normalize();if(tmp.x*fx+tmp.z*fz<.25&&d>.9)return;damage(t,e.dmg,e,e.team?5:7,e.team===0&&Math.random()<.15)})}
function special(e){if(e.spCd>0||e.stun>0||e.dead||e.falling||e.leap)return false;e.spCd=e.h.cd*(e.team?1.6:1);if(e.team===0){spUsed++;quest('sp');tutEv('sp');slowmo(.45,.3);zoomT=.55;zoomTgt=e;banner('✦ '+e.h.sp.toUpperCase()+' ✦','sp');vig('#'+e.h.col.toString(16).padStart(6,'0'),.5);Audio.tone(220,.6,'sawtooth',.12,660)}
 const foes=ents.filter(t=>t.team!==e.team&&!t.dead);const near=(r)=>foes.filter(t=>t.pos.distanceTo(e.pos)<r);
 switch(e.id){
 case'knight':e.charge=.45;e.inv=.45;Audio.dash();ring(e.pos,2,0x6aa8ff);break;
 case'rogue':{let n=foes.sort((a,b)=>a.pos.distanceTo(e.pos)-b.pos.distanceTo(e.pos))[0];if(n){burst(e.pos.clone().setY(1),0x4dff9a,20,4,.5);const back=new THREE.Vector3(Math.sin(n.face),0,Math.cos(n.face));e.pos.copy(n.pos).addScaledVector(back,-1.2);clampIn(e);e.face=Math.atan2(n.pos.x-e.pos.x,n.pos.z-e.pos.z);burst(e.pos.clone().setY(1),0x4dff9a,20,4,.5);Audio.zap();damage(n,e.dmg*1.6,e,8,true);setTimeout(()=>!n.dead&&damage(n,e.dmg*1.2,e,10),180)}break}
 case'wolf':e.frenzy=5;ring(e.pos,3,0xff3a3a,.6);Audio.boom();burst(e.pos.clone().setY(1),0xff3a3a,24,5,.6);break;
 case'minotaur':ring(e.pos,6,0xffaa5a,.5);Audio.boom();shake=.5;burst(e.pos.clone().setY(.3),0xc9a070,30,8,.6,.5,2);near(5.5*e.sc).forEach(t=>{damage(t,e.dmg*1.4,e,16);t.stun=.8});break;
 case'golem':ring(e.pos,5,0xff5a10,.6);Audio.boom();shake=.45;burst(e.pos.clone().setY(.5),0xff5a10,40,7,.8,.5,5);near(4.6*e.sc).forEach(t=>{damage(t,e.dmg*1.7,e,10);t.stun=1.4});break;
 case'lich':Audio.zap();for(let i=0;i<10;i++){const a=i/10*Math.PI*2;bolts.push(newBolt(e,a))}break;
 case'valkyrie':{let n=foes.sort((a,b)=>a.pos.distanceTo(e.pos)-b.pos.distanceTo(e.pos))[0];const to=n?n.pos.clone():e.pos.clone().add(new THREE.Vector3(Math.sin(e.face)*4,0,Math.cos(e.face)*4));e.leap={t:0,L:.55,from:e.pos.clone(),to};e.inv=.7;Audio.dash();burst(e.pos.clone().setY(.4),0xfff0a0,20,4,.5);break}
 case'assassin':{const tg=foes.filter(t=>t.pos.distanceTo(e.pos)<10).sort((a,b)=>a.pos.distanceTo(e.pos)-b.pos.distanceTo(e.pos)).slice(0,5);e.inv=.2+tg.length*.1;tg.forEach((t,i)=>setTimeout(()=>{if(e.dead||t.dead)return;burst(e.pos.clone().setY(1),0xff3a4a,14,4,.4);e.pos.copy(t.pos).add(new THREE.Vector3((Math.random()-.5)*1.4,0,(Math.random()-.5)*1.4));clampIn(e);e.face=Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z);Audio.swing();slash(e,0xff3a4a);damage(t,e.dmg*1.35,e,6,true)},i*110));break}
 case'archer':Audio.zap();for(let i=0;i<7;i++){const a=e.face+(i/6-.5)*1.1;const b=newBolt(e,a,0x4affd8);b.vx*=2;b.vz*=2;b.pierce=new Set();b.noHome=1;b.l=.9;b.s.scale.set(.7,.7,1);bolts.push(b)}break;
 case'giant':ring(e.pos,7,0x9ad8ff,.7);Audio.boom();shake=.5;burst(e.pos.clone().setY(1),0xdff4ff,50,9,.9,.5,4);near(6.2*e.sc).forEach(t=>{damage(t,e.dmg*.9,e,6);t.stun=2.2;t.frozen=2.2});break;
 case'dragon':e.breath=.9;Audio.noise(.9,700,.5,.6,'lowpass');break;
 case'demon':[0,.3,.6].forEach((d,k)=>setTimeout(()=>{if(e.dead)return;const r=2.4+k*2.1;ring(e.pos,r+1,0xff3a10,.45);Audio.boom();shake=Math.max(shake,.35);for(let j=0;j<14+k*6;j++){const a=j/(14+k*6)*6.28;burst(new THREE.Vector3(e.pos.x+Math.cos(a)*r,.3,e.pos.z+Math.sin(a)*r),j%2?0xff3a10:0xffa040,2,2,.6,.45,6)}ents.forEach(t=>{if(t.team!==e.team&&!t.dead){const d=t.pos.distanceTo(e.pos);if(d<r+1.1&&d>r-2.3)damage(t,e.dmg*1.15,e,10)}})},d*1000));break}
 return true}
const bolts=[];const boltMat=new THREE.SpriteMaterial({map:GLOW,color:0xc08aff,blending:THREE.AdditiveBlending,depthWrite:false});
function newBolt(e,a,c){const s=new THREE.Sprite(c?sMat(c):boltMat);s.scale.setScalar(.9);s.position.set(e.pos.x,1.1,e.pos.z);fxGroup.add(s);return{s,o:e,vx:Math.sin(a)*9,vz:Math.cos(a)*9,l:1.6}}
function dash(e){if(e.dead||e.falling||e.leap)return;if(e===player){if(e.dashCd>.75||(e.stun>0&&!(e.hitT>0))||(e.st??100)<20){if((e.st??100)<20)moveTxt('NO STAMINA','h');return}e.st-=20;e.stD=.6;e.stun=0;e.atkCd=Math.min(e.atkCd,0);e.buf=0;e.block=0;tutEv('dash');e.dashCd=.95;e.inv=.38;e.roll=.4;let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,mz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.y;if(Math.hypot(mx,mz)>.2)e.face=Math.atan2(mx,mz)}else{if(e.dashCd>0||e.stun>0)return;e.dashCd=1.1;e.inv=.25}e.dashT=.45;const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x+=fx*17;e.vel.z+=fz*17;Audio.dash();burst(e.pos.clone().setY(.4),0xffffff,8,2,.3,.3,1)}
function clampIn(e){const d=Math.hypot(e.pos.x,e.pos.z);if(d>R-.5){e.pos.x*=(R-.5)/d;e.pos.z*=(R-.5)/d}}
// ================= INPUT =================
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(state==='play'){if(e.code==='KeyJ'&&!e.repeat){attack(player);atkHeld=true;player.hold=0}if(e.code==='Space'&&!e.repeat)jump(player);if((e.code==='KeyI'||e.code==='KeyQ')&&!e.repeat)blockOn(player,1);if(e.code==='KeyU'||e.code==='KeyR')ultimate(player);if(e.code==='KeyG')grab(player);if(e.code==='KeyK'||e.code==='KeyE')special(player);if(e.code==='KeyL'||e.code==='ShiftLeft')dash(player);if(e.code==='Escape'||e.code==='KeyP')pause()}if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=0;if(e.code==='KeyJ')atkUp();if(e.code==='KeyI'||e.code==='KeyQ')blockOn(player,0)});addEventListener('mouseup',e=>{if(e.button===0&&atkHeld)atkUp()});
canvas.addEventListener('mousedown',e=>{if(state==='play'&&matchMedia('(pointer:fine)').matches){if(e.button===0){attack(player);atkHeld=true;player.hold=0}if(e.button===2)special(player)}});canvas.addEventListener('contextmenu',e=>e.preventDefault());
const joy=document.getElementById('joy'),knob=document.getElementById('knob');let jv={x:0,y:0},jid=null;
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;jv={x:0,y:0};knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
function jmove(e){const r=joy.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jv={x,y};knob.style.transform=`translate(${x*45}px,${y*45}px)`}
const btnBind=(id,f)=>{const b=document.getElementById(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();state==='play'&&f()})};
let atkHeld=false;const atkUp=()=>{if(atkHeld&&player&&state==='play'&&player.hold>=.45)heavy(player);atkHeld=false;if(player)player.hold=0};btnBind('atkB',()=>{attack(player);atkHeld=true;player.hold=0});['pointerup','pointercancel','pointerleave'].forEach(v=>document.getElementById('atkB').addEventListener(v,atkUp));
btnBind('jumpB',()=>jump(player));btnBind('grabB',()=>grab(player));btnBind('ultB',()=>ultimate(player));btnBind('blockB',()=>blockOn(player,1));['pointerup','pointercancel','pointerleave'].forEach(v=>document.getElementById('blockB').addEventListener(v,()=>blockOn(player,0)));
btnBind('spB',()=>special(player));btnBind('dashB',()=>dash(player));document.getElementById('pauseB').onclick=()=>pause();
// ================= BATTLE FLOW =================
const $=id=>document.getElementById(id);const hud=$('hud');
function setupStage(){clearEnts();clearCoins();bcoins=0;combo=0;$('bcoin').textContent='🪙 0';$('combo').style.opacity=0;bolts.forEach(b=>fxGroup.remove(b.s));bolts.length=0;
 const ph=trial&&trial.hero||S.hero;player=makeEnt(ph,0,{tint:SKINS[S.skin[ph]||0].c});player.pos.set(0,0,3);player.face=Math.PI;
 player.ult=0;$('grabB').style.display=S.mv.grab?'':'none';$('hname').textContent=player.h.name.toUpperCase()+' — '+player.h.title;kos=0;dmgTaken=0;spUsed=0;time=0;revived=false;wave=0;spawnWave()}
function enemyPool(w){const n=Math.min(HEROES.length,BASEH+w*2+2);return HEROES.slice(0,n).map(h=>h.id).filter(i=>i!==(trial&&trial.hero||S.hero))}
function spawnWave(){wave++;let list=[];
 if(mode==='camp'){const w=stageW,n=stageN;const diff=1+(w*STAGES_PER+n)*.065;const early=w===0&&n<3?.65:w===0?.85:1;
  if(n===STAGES_PER-1){const b=WORLDS[w].boss;const e=makeEnt(b,1,{scale:1.75,boss:true,mult:diff*1.1,hpm:w===0?2.6:3.3,dm:w===0?.8:1,tint:w===4?0x5a2020:0xff8a6a});bossE=e;placeAt(e,0,-4);showBoss(e);
   for(let i=0;i<Math.min(2,w);i++)list.push([enemyPool(w)[(i+w)%5],diff*.8,1])}
  else{const cnt=Math.min(6,2+Math.floor(n/2)+Math.floor(w/2)+(wave-1));const pool=enemyPool(w);for(let i=0;i<cnt;i++)list.push([pool[(i+n+w)%pool.length],diff,early])}}
 else if(mode==='event'){const ev=evInfo();const e=makeEnt(ev.id,1,{scale:1.9,boss:true,mult:1+S.maxW*.35+.3,hpm:3.6,tint:0xffb070});bossE=e;placeAt(e,0,-4);showBoss(e);if(wave===1)for(let i=0;i<2;i++)list.push([enemyPool(S.maxW)[i],1+S.maxW*.3,1])}
 else{const cnt=Math.min(8,1+wave);const pool=enemyPool(Math.min(4,wave/4|0));const diff=1+wave*.12;for(let i=0;i<cnt;i++)list.push([pool[(Math.random()*pool.length)|0],diff]);if(wave%5===0){const e=makeEnt(pool[(wave/5)%pool.length|0],1,{scale:1.6,boss:true,mult:diff,hpm:2.8,tint:0xff8a6a});bossE=e;placeAt(e,0,-4);showBoss(e)}}
 list.forEach(([id,m,dm],i)=>{const e=makeEnt(id,1,{mult:m,dm:dm||1,tint:0xd8c8c0});const a=i/list.length*Math.PI*2+Math.random();placeAt(e,Math.cos(a)*(R-2),Math.sin(a)*(R-2))});
 banner(mode==='event'?'DAILY TITAN':mode==='gaunt'?'WAVE '+wave:(stageN===STAGES_PER-1?'BOSS':waves>1?'WAVE '+wave+'/'+waves:'FIGHT'));}
function placeAt(e,x,z){e.pos.set(x,0,z);e.face=Math.atan2(-x,-z);e.inv=1;e.root.position.copy(e.pos);ring(e.pos,2,0xff5a3a,.6);burst(e.pos.clone().setY(1),0xff5a3a,14,3,.6)}
function showBoss(e){const d=document.createElement('div');d.id='bossbar';d.innerHTML=`<div id="bossn">${mode==='camp'?WORLDS[stageW].bossN.toUpperCase():mode==='event'?'DAILY TITAN · '+e.h.name.toUpperCase():'CHAMPION '+e.h.name.toUpperCase()}</div><div class="bar"><div id="bossfill"></div></div>`;hud.appendChild(d);if(mode==='camp'&&stageN===STAGES_PER-1||mode==='event'){setTimeout(()=>{if(state==='play'){zoomT=1.1;zoomTgt=e;slowmo(1,.5)}},300)}}
let bannerT=0;function banner(t,c=''){const b=$('banner');b.textContent=t;b.className=c;void b.offsetWidth;b.classList.add('in');b.style.opacity=1;bannerT=1.4}
function vig(c,o){const v=$('vig');v.style.boxShadow=`inset 0 0 140px 40px ${c}`;v.style.opacity=o;setTimeout(()=>v.style.opacity=0,120)}
function startBattle(m,w,n,free){const tutNow=!S.tut&&m==='camp'&&w===0&&n===0;if(!free&&!tutNow&&m!=='event'&&!useEnergy(()=>startBattle(m,w,n)))return;tutOn=tutNow;tutStep=0;tutN=0;$('tut').classList.add('hide');mode=m;stageW=w;stageN=n;waves=m==='camp'&&n>=4&&n<STAGES_PER-1?2:1;fade(()=>{buildArena(m==='camp'?w:m==='event'?evInfo().w:(Math.random()*5)|0,m==='gaunt');if(tutOn)tutShow();setupStage();showScreen(null);hud.classList.remove('hide');state='play';gpStart();Audio.intense=true;
 $('stageinfo').textContent=m==='camp'?WORLDS[w].n.toUpperCase()+'  ·  '+(w+1)+'-'+(n+1):m==='event'?'⚡ DAILY TITAN':'THE GAUNTLET'})}
function fade(cb){const f=$('fade');f.style.opacity=1;setTimeout(()=>{cb();f.style.opacity=0},360)}
function endBattle(win){if(state!=='play')return;state='end';gpStop();Audio.intense=false;
 if(!win&&!revived){showRevive();return}finish(win)}
function finish(win){hud.classList.add('hide');$('tut').classList.add('hide');tutOn=false;let coins=0,stars=0,gems=0;const wasTrial=trial;
 if(mode==='camp'){if(win){const hpP=player.hp/player.max,par=45+stageN*6+(stageN===STAGES_PER-1?40:0);stars=1+(hpP>=.5?1:0)+(time<=par?1:0);coins=Math.round((60+stageW*40+stageN*12)*(stageN===STAGES_PER-1?3:1));
   const k=stageW+'-'+stageN,prev=S.stars[k]||0;if(stars>prev){S.trophy+=(stars-prev)*10;S.stars[k]=stars}if(stars===3)quest('star3');S.wins++;quest('win');S.trophy+=2;
   if(stageN===STAGES_PER-1){quest('boss');gems+=15;let unlock=null;HEROES.forEach(h=>{if(h.u.t==='boss'&&h.u.v===stageW&&!S.owned[h.id]){S.owned[h.id]=1;unlock=h.id}});if(stageW>=S.maxW)S.maxW=Math.min(4,stageW+1);happy();if(unlock)setTimeout(()=>{fanfare('NEW CHAMPION',HEROES[HI[unlock]].name+', '+HEROES[HI[unlock]].title)},700)}
  }else coins=Math.round(kos*8)}
 else if(mode==='event'){if(win){coins=500+S.maxW*150;gems=40;S.ev=today();S.trophy+=10;happy()}else coins=Math.round(kos*10)}
 else{coins=Math.round((wave-1)*35+kos*6);if(wave-1>S.best){S.best=wave-1}quest('gaunt',wave-1);if(wave>2)S.trophy+=wave-1}
 let sb=0;if(mode!=='gaunt'){if(win){S.streak++;S.bestStreak=Math.max(S.bestStreak,S.streak);sb=Math.min(.5,(S.streak-1)*.1)}else S.streak=0}
 coins=Math.round(coins*(1+sb))+bcoins;trial=null;
 S.coins+=coins;S.gems+=gems;save();if(win)Audio.win();else Audio.lose();showResult(win,stars,coins,gems,sb,wasTrial)}
function showRevive(){revived=true;showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:420px"><h2>YOU HAVE FALLEN</h2><p>The arena is not done with you yet.</p>
 <button class="btn v" id="rv">📺 Rise Again (Ad)</button><button class="btn" id="rn">Give Up</button></div></div>`);
 $('rv').onclick=()=>ad('rewarded',()=>{showScreen(null);player.dead=0;player.falling=0;player.hp=player.max*.6;player.pos.set(0,0,0);player.vel.set(0,0,0);player.inv=2;player.root.visible=true;ring(player.pos,6,0xffd36a,.8);ents.filter(e=>e.team&&!e.dead).forEach(e=>{damage(e,0,player,14)});state='play';gpStart();Audio.intense=true},()=>toastModal('No ad available','Try again later.'));
 $('rn').onclick=()=>finish(false)}
function showResult(win,stars,coins,gems,sb=0,wasTrial=null){let st='';for(let i=0;i<3;i++)st+=`<span class="${i<stars?'on':''}">★</span>`;
 const next=mode==='camp'&&win&&stageN<STAGES_PER-1;const nextW=mode==='camp'&&win&&stageN===STAGES_PER-1&&stageW<4;
 showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:460px"><h2>${win?'VICTORY':mode==='gaunt'?'THE GAUNTLET ENDS':'DEFEAT'}</h2>
 ${mode==='camp'&&win?`<div class="stars">${st}</div><p style="color:#9a8a70;font-size:13px">★ Win &nbsp; ★ Keep 50% health &nbsp; ★ Finish fast</p>`:''}
 ${mode==='gaunt'?`<p>Waves survived: <b>${wave-1}</b> &nbsp; Best: <b>${S.best}</b></p>`:''}
 <p style="font:bold 22px Arial;color:#ffd36a">+${coins} 🪙 ${gems?`&nbsp; <span style="color:#b9a6ff">+${gems} 💎</span>`:''}</p>
 ${sb>0?`<p class="streak">🔥 Win streak ×${S.streak} — +${Math.round(sb*100)}% coins</p>`:win&&mode!=='gaunt'?`<p class="streak">🔥 Win streak ×${S.streak} — keep winning for bonus coins!</p>`:''}
 ${wasTrial?`<p class="near">That was a trial. Unlock it in the <b>Shop</b> to keep it.</p>`:''}<p class="near">${nearMiss()}</p>
 ${coins>0?'<button class="btn v" id="dbl">📺 Double Reward</button>':''}
 ${next?'<button class="btn g" id="nx">Next Stage</button>':''}${nextW?'<button class="btn g" id="nx">Next World</button>':''}
 ${!win||mode==='gaunt'?'<button class="btn g" id="rt">Try Again</button>':''}<button class="btn" id="hm">Back</button></div></div>`);
 const d=$('dbl');if(d)d.onclick=()=>ad('rewarded',()=>{S.coins+=coins;save();Audio.coin();d.remove()});
 const afterAd=f=>()=>{ad('midgame',f)};
 if($('nx'))$('nx').onclick=afterAd(()=>{if(nextW){showStory(stageW+1,()=>startBattle('camp',stageW+1,0))}else startBattle('camp',stageW,stageN+1)});
 if($('rt'))$('rt').onclick=afterAd(()=>{if(mode==='event'){if(S.ev!==today())startBattle('event',0,0);else mainMenu()}else startBattle(mode,stageW,stageN)});
 $('hm').onclick=()=>{cleanupBattle();mode==='camp'?campaign(stageW):mainMenu()};if(win)setTimeout(()=>{const c=document.querySelector('.stars');c&&c.classList.add('go')},50)}
function cleanupBattle(){clearEnts();clearCoins();trial=null;$('tut').classList.add('hide');state='menu';hud.classList.add('hide');gpStop();setupMenuScene()}
function pause(){if(state!=='play')return;state='pause';gpStop();showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:380px"><h2>PAUSED</h2><div class="near" style="text-align:left;font-size:12px;line-height:1.55"><b>TECHNIQUES</b><br>⚔ Tap ×3: combo chain → weapon finisher · Hold &amp; release: <b>Heavy Strike</b><br>➤ <b>Roll</b> (invulnerable, cancels recovery, costs stamina) · ➤ then ⚔: <b>Dash Strike</b><br>Enemies glow red before striking — after a swing they glow gold: punish them for bonus damage · ⤒ Jump (then ⚔: <b>Aerial Plunge</b>${S.mv.plunge?'':' 🔒'})<br>🛡 Press just before a hit: <b>Perfect Parry + Counter</b> · hold to block<br>✊ <b>Grab &amp; Throw</b> to the edge${S.mv.grab?'':' 🔒 Trophy Road'} · ⚡ <b>Ultimate</b> charges from hits${fine()?'<br><i>Keys: J attack · Space jump · Shift dash · K special · Q parry · R ultimate · G throw</i>':''}</div><button class="btn g" id="rs">Resume</button><button class="btn" id="snd">⚙ Settings</button><button class="btn" id="qt">Leave Battle</button><p class="near">${nearMiss()}</p></div></div>`);
 $('rs').onclick=()=>{showScreen(null);state='play';gpStart()};$('snd').onclick=()=>settings(()=>{state='play';pause.call();});$('qt').onclick=()=>{cleanupBattle();mainMenu()}}
function toggleMusic(){S.music=S.music?0:1;Audio.mv&&(Audio.mv.gain.value=S.music?.32:0);save()}
// ================= UPDATE =================
const camPos=new THREE.Vector3(0,14,12),camLook=new THREE.Vector3();
function updateBattle(dt){time+=dt;$('timer').textContent=fmtT(time);if(comboT>0){comboT-=dt;if(comboT<=0){combo=0;$('combo').style.opacity=0}}

 const W=mode==='camp'?WORLDS[stageW]:null;const ice=W&&W.hz==='ice';
 // player input
 if(player&&!player.dead&&!player.falling){let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,mz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.y;const l=Math.hypot(mx,mz);
  if(l>.1&&player.stun<=0&&player.charge<=0){mx/=Math.max(1,l);mz/=Math.max(1,l);const acc=ice?.25:1;player.vel.x+=(mx*player.spd-player.vel.x)*Math.min(1,dt*12*acc);player.vel.z+=(mz*player.spd-player.vel.z)*Math.min(1,dt*12*acc);player.face=lerpAng(player.face,Math.atan2(mx,mz),dt*14);if(tutOn&&tutStep===0){tutN+=dt;if(tutN>.35){tutStep=1;tutN=0;tutShow()}}}
  if(atkHeld){player.hold=(player.hold||0)+dt;if(player.hold>.3&&Math.random()<.5)burst(player.pos.clone().setY(1.1),0xffd36a,1,1.5,.3,.3,1)}$('atkB').classList.toggle('chg',atkHeld&&player.hold>.3);if(player.block){player.vel.multiplyScalar(.82);if(Math.random()<.2)burst(player.pos.clone().setY(1),0x9ad8ff,1,.6,.3,.25,0)}
  // auto-aim facing when attacking near enemy
 }
 // AI
 ents.forEach(e=>{if(e.team===0||e.dead||e.falling)return;e.ai.t-=dt;const p=player;if(!p||p.dead){return}if(tutOn&&tutStep<3){tmp.subVectors(p.pos,e.pos);e.face=lerpAng(e.face,Math.atan2(tmp.x,tmp.z),dt*6);return}
  tmp.subVectors(p.pos,e.pos);tmp.y=0;const d=tmp.length();const want=Math.atan2(tmp.x,tmp.z);e.face=lerpAng(e.face,want,dt*6);
  if(e.stun>0||e.charge>0)return;const rng=e.h.range*e.sc+.2;if(e.leap||e.breath>0)return;
  e.eblock=(e.eblock||0)-dt;e.dodgeCd=(e.dodgeCd||0)-dt;if(!e.ait)e.ait=AIT[e.id]||'aggr';const P=AIP[e.ait];
  if(e.spw>0){e.spw-=dt;e.vel.multiplyScalar(.85);if(Math.random()<.5)burst(e.pos.clone().setY(1.3),0xb06aff,1,1.5,.3,.35,2);if(e.spw<=0)special(e);return}
  if(e.wind>0){e.wind-=dt;e.vel.multiplyScalar(.8);if(e.wind<=0)eAtk(e);return}
  const ar=P.keep?P.keep+2.5:(e.akind0==='lunge'?rng+2.2:rng);
  let mx=0,mz=0;const str=e.ait==='assassin'?1:.4;
  if(P.keep&&d<P.keep*.7){mx=-tmp.x/d;mz=-tmp.z/d}else if(d>(P.keep?P.keep:rng*.85)){mx=tmp.x/d;mz=tmp.z/d}else{mx=-tmp.z/d*e.ai.strafe*str;mz=tmp.x/d*e.ai.strafe*str}
  if(Math.random()<dt*.3)e.ai.strafe*=-1;
  if(e.rec>0){e.rec-=dt;e.vel.multiplyScalar(.86);if(Math.random()<.25)burst(e.pos.clone().setY(1.8),0xffe08a,1,.6,.3,.25,0);return}
  if(!toks.has(e)&&toks.size>=tokMax()&&!P.keep&&d<rng+3.5){mx=-tmp.z/d*e.ai.strafe*.8+(d<rng+2.2?-tmp.x/d*.6:0);mz=tmp.x/d*e.ai.strafe*.8+(d<rng+2.2?-tmp.z/d*.6:0)}
  if(e.atkCd<=0&&d<ar&&(toks.has(e)||toks.size<tokMax())&&Math.random()<dt*(e.ait==='aggr'?4:3)){toks.add(e);Audio.tone(e.boss?180:320,.28,'sawtooth',.05,e.boss?120:220);const r0=Math.random();e.akind=P.shot?'shot':P.slam&&r0<P.slam?'slam':P.lunge&&r0<P.lunge&&d>rng*.6?'lunge':'swing';e.ecombo=e.akind==='slam'?0:Math.floor(Math.random()*P.combo)+(e.boss?1:0);
   const ww=Math.max(.38,P.wind*(e.boss?1.15:1)*(stageW===0&&mode==='camp'?1.4:1)+.12);e.wind=ww;e.flash=-.35;e.squash=.12;warn(e,e.akind==='slam'?3.4:e.akind==='shot'?1.6:e.akind==='lunge'?4.5:e.h.range*e.sc*1.6+.6,ww+.1);if(e.akind!=='shot')dmgText(e.pos,'!','w')}
  if(e.eblock>0){mx*=.3;mz*=.3;if(Math.random()<.3)burst(e.pos.clone().setY(1.1).add(new THREE.Vector3(Math.sin(e.face)*.5,0,Math.cos(e.face)*.5)),0x9ad8ff,1,.4,.2,.3,0)}
  // separation
  ents.forEach(o=>{if(o!==e&&!o.dead&&o.team===1){const dx=e.pos.x-o.pos.x,dz=e.pos.z-o.pos.z,dd=dx*dx+dz*dz;if(dd<1.6&&dd>0){mx+=dx/dd*.5;mz+=dz/dd*.5}}});
  // avoid edge
  const ed=Math.hypot(e.pos.x,e.pos.z);if(ed>R-1.5){mx-=e.pos.x/ed*1.2;mz-=e.pos.z/ed*1.2}
  const acc=ice?.3:1;e.vel.x+=(mx*e.spd-e.vel.x)*Math.min(1,dt*8*acc);e.vel.z+=(mz*e.spd-e.vel.z)*Math.min(1,dt*8*acc);
  if(e.spCd<=0&&!(e.spw>0)&&d<({lich:8,rogue:9,archer:9,assassin:8,valkyrie:9,dragon:4.5}[e.id]||4.5)&&Math.random()<dt*1.5){e.spw=.55;ring(e.pos,3,0xb06aff,.6);dmgText(e.pos,'✦','w')}
  if(e.dashCd<=0&&d>5&&!P.keep&&Math.random()<dt*(e.ait==='assassin'?1.2:.4))dash(e)});
 // physics
 ents.forEach(e=>{if(e.dead){e.squash=0;return}
  if(e.poiseT>0){e.poiseT-=dt;if(e.poiseT<=0)e.poise=0}if(e===player){e.stD=(e.stD||0)-dt;if(e.stD<=0&&!e.block)e.st=Math.min(100,(e.st??100)+dt*38);if(e.buf&&T-e.buf<.2&&e.atkCd<=0&&e.stun<=0){e.buf=0;attack(e)}}
  e.atkCd-=dt;e.spCd-=dt;e.dashCd-=dt;e.dashT=(e.dashT||0)-dt;e.jumpCd=(e.jumpCd||0)-dt;e.grabCd=(e.grabCd||0)-dt;e.pcd=(e.pcd||0)-dt;if(e.thrown>0){e.thrown-=dt;if(Math.random()<.7)burst(e.pos.clone().setY(1),0xffd36a,1,1,.3,.35,0)};e.stun-=dt;e.inv-=dt;e.frenzy-=dt;
  if(e.charge>0){e.charge-=dt;const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x=fx*16;e.vel.z=fz*16;ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<1.4*t.sc+.4&&!t._ch){t._ch=1;damage(t,e.dmg*1.3,e,18);t.stun=.6;setTimeout(()=>t._ch=0,500)}});if(Math.random()<.6)burst(e.pos.clone().setY(.6),0x6aa8ff,2,1,.3)}
  if(e.leap){const L=e.leap;L.t+=dt;if(L.pl&&L.py==null)L.py=e.pos.y;const k=Math.min(1,L.t/L.L);e.pos.lerpVectors(L.from,L.to,k);e.pos.y=L.pl?(L.py||2)*(1-k):Math.sin(k*Math.PI)*(L.small?2.6:4);e.vel.set(0,0,0);if(k>=1&&L.small){e.leap=null;e.pos.y=0;const P=!!L.pl;ring(e.pos,P?5:3,P?0xffd36a:0xffffff,.45);burst(e.pos.clone().setY(.3),P?0xffd36a:0xcfc6b0,P?44:16,P?9:5,.6,.4,P?6:2);Audio.boom();shake=P?.55:.2;if(P){flashT=.08;slowmo(.15,.3)}hitRad(e,e.pos,P?3.6:2.2,P?2.6:.9,P?14:7,P?.9:.3)}else if(k>=1){e.leap=null;e.pos.y=0;ring(e.pos,5,0xfff0a0,.5);ring(e.pos,3,0xffffff,.3);flashT=.1;Audio.zap();Audio.boom();shake=.5;burst(e.pos.clone().setY(.3),0xfff0a0,50,9,.7,.45,7);ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<3.4){damage(t,e.dmg*2,e,14);t.stun=.7}})}}
  if(e.breath>0){e.breath-=dt;e.vel.multiplyScalar(.8);const fx=Math.sin(e.face),fz=Math.cos(e.face);for(let k=0;k<2;k++){const d=1+Math.random()*4.5,sp=(Math.random()-.5)*d*.6;burst(new THREE.Vector3(e.pos.x+fx*d+fz*sp,1+Math.random()*.4,e.pos.z+fz*d-fx*sp),Math.random()<.5?0xff7a2a:0xffd04a,1,1.5,.4,.5+d*.08,1)}
   e._bt=(e._bt||0)-dt;if(e._bt<=0){e._bt=.12;ents.forEach(t=>{if(t.team===e.team||t.dead)return;tmp.subVectors(t.pos,e.pos);tmp.y=0;const d=tmp.length();if(d<5.8&&(tmp.x*fx+tmp.z*fz)/Math.max(d,.01)>.55)damage(t,e.dmg*.32,e,2)})}}
  if(e.frozen>0){e.frozen-=dt;if(Math.random()<.1)burst(e.pos.clone().setY(1),0xbfe8ff,1,.5,.5,.3,.5)}
  if(e.swing>0)e.swing-=dt;if(e.wmod&&e.swing>0){}
  if(e.frenzy>0&&Math.random()<.3)burst(e.pos.clone().setY(1.2),0xff3a3a,1,1,.4,.25);
  const fr=ice?1.2:7;if(e.falling===0&&!(e.thrown>0)){e.vel.x*=Math.max(0,1-dt*fr*(e.stun>0?.5:1)*.6);e.vel.z*=Math.max(0,1-dt*fr*(e.stun>0?.5:1)*.6)}
  if(!e.leap){e.pos.x+=e.vel.x*dt;e.pos.z+=e.vel.z*dt;if(!e.falling)pushObst(e)}
  const dd=Math.hypot(e.pos.x,e.pos.z);if(e===player&&!(e.hitT>0)&&dd>R-.5){clampIn(e)}else if(!e.falling&&!e.leap&&dd>R+.1){e.falling=1;e.vel.y=2;if(e.bar){e.bar.remove();e.bar=null}}
  if(e.falling){e.vel.y-=25*dt;e.pos.y+=e.vel.y*dt;if(e.pos.y<-14&&!e.dead){e.dead=1;e.root.visible=false;if(e.team){kos++;quest('ko')}if(e===player)setTimeout(()=>endBattle(false),400);else{ring(new THREE.Vector3(e.pos.x*.9,0,e.pos.z*.9),2,0xffffff,.4)}}}
 });
 // body collisions
 for(let i=0;i<ents.length;i++)for(let j=i+1;j<ents.length;j++){const a=ents[i],b=ents[j];if(a.dead||b.dead||a.falling||b.falling)continue;const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z,d=Math.hypot(dx,dz),m=.55*(a.sc+b.sc);if(d<m&&d>0){const p=(m-d)/2;a.pos.x-=dx/d*p;a.pos.z-=dz/d*p;b.pos.x+=dx/d*p;b.pos.z+=dz/d*p}}
 // bolts
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.l-=dt;const tg=b.noHome?null:ents.filter(t=>t.team!==b.o.team&&!t.dead)[0];if(tg){const dx=tg.pos.x-b.s.position.x,dz=tg.pos.z-b.s.position.z,d=Math.hypot(dx,dz);b.vx+=dx/d*dt*14;b.vz+=dz/d*dt*14}
  b.s.position.x+=b.vx*dt;b.s.position.z+=b.vz*dt;let hit=false;ents.forEach(t=>{if(!hit&&t.team!==b.o.team&&!t.dead&&Math.hypot(t.pos.x-b.s.position.x,t.pos.z-b.s.position.z)<.8*t.sc){if(b.pierce){if(!b.pierce.has(t)){b.pierce.add(t);damage(t,b.o.dmg*(b.dm||1),b.o,5)}}else{damage(t,b.o.dmg*(b.dm||.7),b.o,4);hit=true}}});if(b.pierce&&Math.random()<.5)burst(b.s.position,0x4affd8,1,.3,.2,.25,0);
  if(hit||b.l<=0){burst(b.s.position,b.pierce?0x4affd8:0xc08aff,6,3,.3);fxGroup.remove(b.s);bolts.splice(i,1)}}
 updateHazards(dt,W);
 // win check
 const foes=ents.filter(e=>e.team&&!e.dead);if(player&&!player.dead&&foes.length===0&&state==='play'){
  if(mode==='gaunt'){S.coins+=10;spawnWave();player.hp=Math.min(player.max,player.hp+player.max*.15)}else if(wave<waves){spawnWave()}else{state='wait';setTimeout(()=>{state='play';endBattle(true)},900);banner('VICTORY');}}
 // HUD
 if(player){$('hpbar').style.width=Math.max(0,player.hp/player.max*100)+'%';$('stbar').style.width=Math.max(0,player.st??100)+'%';$('stbar').classList.toggle('low',(player.st??100)<20);if(player.hp/player.max<.3)vigLow();const c=Math.max(0,player.spCd/player.h.cd);$('spCd').style.height=(c*100)+'%';const u=player.ult||0;$('ultF').style.height=u+'%';$('ultB').classList.toggle('full',u>=100);$('blockB').classList.toggle('on',!!player.block)}
 if(bossE){const f=$('bossfill');f&&(f.style.width=Math.max(0,bossE.hp/bossE.max*100)+'%')}
}
function updateHazards(dt,W){if(!W)return;const lvl=stageN;
 if(W.hz==='blade'&&blade){blade.rotation.y+=dt*(1+lvl*.12);const a=-blade.rotation.y;ents.forEach(e=>{if(e.dead||e.falling)return;const ang=Math.atan2(e.pos.z,e.pos.x);// distance to blade line
   const along=e.pos.x*Math.cos(a)+e.pos.z*Math.sin(a),perp=-e.pos.x*Math.sin(a)+e.pos.z*Math.cos(a);if(Math.abs(perp)<.5&&Math.abs(along)<R*.95&&e.inv<=0){damage(e,e.team?6:8,null,0);const s=Math.sign(perp)||1;e.vel.x+=-Math.sin(a)*s*12;e.vel.z+=Math.cos(a)*s*12;e.inv=.5}})}
 if(W.hz==='ice'&&lvl<2)return;if(W.hz==='spikes'&&lvl<2)return;
 hzT-=dt;if(hzT<=0&&W.hz!=='blade'){hzT=Math.max(.8,2.6-lvl*.18);const n=1+Math.floor(lvl/3);for(let i=0;i<n;i++){const tgt=Math.random()<.5&&player?player.pos:{x:(Math.random()-.5)*R*1.4,z:(Math.random()-.5)*R*1.4};
   const r={spikes:1.4,ice:1.6,lava:1.8,storm:1.5}[W.hz];const x=tgt.x+(Math.random()-.5)*2,z=tgt.z+(Math.random()-.5)*2;if(Math.hypot(x,z)>R-1)continue;
   const col={spikes:0xff6a3a,ice:0x9ad8ff,lava:0xff5a10,storm:0xcfe0ff}[W.hz];const m=new THREE.Mesh(new THREE.CircleGeometry(r,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.position.set(x,.05,z);fxGroup.add(m);hz.push({m,x,z,r,t:1.1,col,type:W.hz,life:W.hz==='lava'?4:0})}}
 if(W.hz==='storm'&&Math.random()<dt*.15){const a=Math.random()*6.28;windV.set(Math.cos(a),0,Math.sin(a));windT=2.5;banner('GUST!')}
 if(windT>0){windT-=dt;ents.forEach(e=>{if(!e.dead&&!e.falling){e.vel.addScaledVector(windV,dt*6)}});if(ambient)ambient.position.addScaledVector(windV,dt*4)}
 for(let i=hz.length-1;i>=0;i--){const h=hz[i];h.t-=dt;
  if(h.t>0){h.m.material.opacity=.15+.35*Math.abs(Math.sin(h.t*12))}
  else if(!h.fired){h.fired=1;Audio[h.type==='storm'?'zap':'boom']();const p=new THREE.Vector3(h.x,0,h.z);burst(p.clone().setY(.3),h.col,22,5,.6,.45,h.type==='storm'?9:5);ring(p,h.r*1.3,h.col,.4);shake=Math.max(shake,.15);
   if(h.type==='storm'){flashT=.12}
   ents.forEach(e=>{if(!e.dead&&!e.falling&&Math.hypot(e.pos.x-h.x,e.pos.z-h.z)<h.r+.3*e.sc){damage(e,e.team?12:10+stageW*2,null,0);const d=new THREE.Vector3(e.pos.x-h.x,0,e.pos.z-h.z).normalize();e.vel.addScaledVector(d,8);if(h.type==='ice')e.stun=.6}});
   if(h.type==='lava'){h.m.material.opacity=.7;h.m.material.blending=THREE.NormalBlending}}
  else if(h.life>0){h.life-=dt;h.m.material.opacity=.5+.2*Math.sin(time*6);if(Math.random()<dt*8)burst(new THREE.Vector3(h.x+(Math.random()-.5)*h.r,.1,h.z+(Math.random()-.5)*h.r),0xff7a2a,1,.5,.6,.3,2);ents.forEach(e=>{if(!e.dead&&!e.falling&&Math.hypot(e.pos.x-h.x,e.pos.z-h.z)<h.r){if(!e._lv||e._lv<time){e._lv=time+.5;damage(e,4+stageW,null,0)}}})}
  else{h.m.material.opacity-=dt*2;if(h.m.material.opacity<=0){fxGroup.remove(h.m);h.m.geometry.dispose();hz.splice(i,1)}}}}
let windT=0,flashT=0;const windV=new THREE.Vector3();
const fmtT=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function lerpAng(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*Math.min(1,t)}
// visual sync + procedural animation
const v2=new THREE.Vector3();
function animEnts(dt,T){ents.forEach(e=>{const r=e.root;if(e.dead&&!e.falling){e.dT=(e.dT||0)+dt;const k=Math.min(1,e.dT/.45);e.body.rotation.x=-k*1.45;e.body.position.y=Math.sin(k*Math.PI)*.35;e.mat.emissive.setRGB(.3*(1-k),.1*(1-k),0);if(e.dT>1.1){r.scale.multiplyScalar(Math.max(0,1-dt*4));r.position.y-=dt*.8;if(r.scale.x<.03)r.visible=false}return}
  r.position.set(e.pos.x,e.pos.y,e.pos.z);r.rotation.y=e.face;const sp=Math.hypot(e.vel.x,e.vel.z);
  const run=Math.min(1,sp/6),ph=T*11+e.ai.t*9;
  e.squash+= (0-e.squash)*Math.min(1,dt*10);const sq=e.squash;
  e.body.position.y=Math.abs(Math.sin(ph))*.14*run+Math.sin(T*2+e.ai.t*7)*.02;
  e.body.scale.set(1+sq*.5,1-sq+Math.sin(T*2.2+e.ai.t)*.012,1+sq*.5);
  if(e.hitT>0)e.hitT-=dt;const hk=Math.max(0,e.hitT||0);e.body.rotation.x=run*.18-hk*1.1+(e.eblock>0||e.block?.12:0)+(e.wind>0?-.35:0)+(e.spw>0?-.3:0)+(e.charge>0?.35:0)+(e.leap?-.4:0);e.body.rotation.z=Math.sin(ph)*.07*run+Math.sin(hk*40)*hk*.25;if(e.wind>0){e.body.position.z=-.25}
  if(e.roll>0){e.roll-=dt;e.body.rotation.x=(1-e.roll/.4)*6.283;e.body.position.y+=.25*Math.sin((1-e.roll/.4)*Math.PI)}
  if(e.spin>0){e.spin-=dt;e.body.rotation.y=(1-e.spin/.35)*6.283}else if(e.swing>0){const k=1-e.swing/.3;e.body.rotation.y=(e.sdir||1)*(k<.25?-k/.25*.55:-.55+Math.min(1,(k-.25)/.35)*1.25-Math.max(0,k-.6)/.4*.7);e.body.position.z=Math.sin(k*Math.PI)*.45;e.body.rotation.x+=Math.sin(k*Math.PI)*.22}else{e.body.rotation.y*=.8;e.body.position.z*=.8}
  if(e.wglow)e.wglow.material.opacity=.6+Math.sin(T*6)*.3;
  const fl=e.flash>0?e.flash/.15:0;e.flash-=dt;
  if(e.flash>0)e.mat.emissive.setRGB(fl*1.2,fl*1.0,fl*.9);else if(e.wind>0){const w=.5+.5*Math.abs(Math.sin(T*22));e.mat.emissive.setRGB(.9*w,.15*w,0)}else if(e.rec>0)e.mat.emissive.setRGB(.25,.2,.05);else if(e.frenzy>0)e.mat.emissive.setRGB(.35,0,0);else if(e.frozen>0)e.mat.emissive.setRGB(.2,.45,.7);else if(e.stun>0)e.mat.emissive.setRGB(.15,.15,.3);else if(e.inv>0&&e.team===0)e.mat.emissive.setRGB(.1,.1,.15);else e.mat.emissive.setRGB(0,0,0);
  if(e.bar){v2.set(e.pos.x,e.pos.y+2.3*e.sc,e.pos.z).project(camera);e.bar.style.left=(v2.x*.5+.5)*innerWidth+'px';e.bar.style.top=(-v2.y*.5+.5)*innerHeight+'px';e.bar.firstChild.style.width=Math.max(0,e.hp/e.max*100)+'%'}})}
// ================= MENU SCENE =================
let menuChar=null;
function setupMenuScene(){clearEnts();buildArena(Math.min(S.maxW,4),false,true);menuChar=makeEnt(S.hero,0,{tint:SKINS[S.skin[S.hero]||0].c});menuChar.pos.set(0,0,0);menuChar.face=0}
// ================= UI SCREENS =================
const scr=$('screens');
function showScreen(html){scr.innerHTML=html||'';scr.querySelectorAll('.btn,.tab,.st,.hc').forEach(b=>b.addEventListener('click',()=>Audio.click()))}
const cur=()=>`<div class="cur">🪙 ${S.coins} <b>💎 ${S.gems}</b> 🏆 ${S.trophy}</div>`;
function dot(b){return b?' <span style="color:#ff5a3a">●</span>':''}
// ---------- economy helpers ----------
const ENMAX=5,ENMS=5*60*1000;// 1 energy per 5 minutes
function enTick(){const now=Date.now();if(!S.enT)S.enT=now;if(S.en>=ENMAX){S.enT=now;return}const k=Math.floor((now-S.enT)/ENMS);if(k>0){S.en=Math.min(ENMAX,S.en+k);S.enT+=k*ENMS;if(S.en>=ENMAX)S.enT=now;save()}}
function enLeft(){enTick();if(S.en>=ENMAX)return '';const ms=ENMS-(Date.now()-S.enT);return fmtT(Math.max(0,ms/1000))}
function useEnergy(retry){enTick();if(S.en>0){if(S.en>=ENMAX)S.enT=Date.now();S.en--;save();return true}
 toastModal('OUT OF ENERGY',`Energy refills <b>1 ⚡ every 5 minutes</b> (next in ${enLeft()}).<br><br><button class="btn v" id="enad">📺 Refill ⚡ ${ENMAX}/${ENMAX}</button>`);
 setTimeout(()=>{const b=$('enad');b&&(b.onclick=()=>ad('rewarded',()=>{S.en=ENMAX;save();b.closest('.scr').remove();retry&&retry()},()=>toastModal('No ad available','Try again in a moment.')))},0);return false}
const owns=(kind,key)=>kind==='hero'?!!S.owned[key]:kind==='wp'?((S.wp[key.split(':')[0]]||[0]).includes(+key.split(':')[1])):!!S.fx[key];
function payPrice(p,kind,key,done){// returns true if handled
 if(p.t==='coins'){if(S.coins<p.v)return toastModal('NOT ENOUGH COINS',`You need 🪙 ${p.v-S.coins} more. Win battles, open the free chest, or claim quests.`);S.coins-=p.v;grant(kind,key);done()}
 else if(p.t==='gems'){if(S.gems<p.v)return toastModal('NOT ENOUGH GEMS',`You need 💎 ${p.v-S.gems} more. Earn gems from bosses, the Daily Titan, Trophy Road, or 📺 free gems in the Shop.`);S.gems-=p.v;grant(kind,key);done()}
 else if(p.t==='ads'){ad('rewarded',()=>{const k=kind+':'+key;S.adp[k]=(S.adp[k]||0)+1;if(S.adp[k]>=p.v)grant(kind,key);save();done()},()=>toastModal('No ad available','Try again in a moment.'))}}
function grant(kind,key){if(kind==='hero')S.owned[key]=1;else if(kind==='wp'){const [h,i]=key.split(':');(S.wp[h]=S.wp[h]||[0]).push(+i);S.wsel[h]=+i}else{S.fx[key]=1;S.fxs=+key}save();Audio.win();happy();fanfare(kind==='hero'?'CHAMPION UNLOCKED':kind==='wp'?'WEAPON FORGED':'EFFECT UNLOCKED',kind==='hero'?HEROES[HI[key]].name:kind==='wp'?WEAPONS[+key.split(':')[1]].n:FXP[+key].n)}
function priceBtn(p,id,kind,key){if(p.t==='ads'){const k=kind+':'+key,n=S.adp[k]||0;return `<button class="btn s v" id="${id}">📺 Watch ad ${n}/${p.v}</button>`}
 const can=p.t==='coins'?S.coins>=p.v:S.gems>=p.v;return `<button class="btn s ${can?'g':'off'}" id="${id}">${priceTxt(p)}</button>`}
function fanfare(t,sub){const d=document.createElement('div');d.className='fanfare';d.innerHTML=`<div class="rays"></div><h1>${t}</h1><h3>${sub||''}</h3>`;document.body.appendChild(d);[523,659,784,1047].forEach((f,i)=>setTimeout(()=>Audio.tone(f,.6,'triangle',.22),i*110));setTimeout(()=>Audio.tone(1568,1.2,'triangle',.15),480);if(menuChar)burstUI();setTimeout(()=>d.classList.add('out'),1500);setTimeout(()=>d.remove(),2100)}
// near-miss progress for exit screens
function nearMiss(){const c=[];
 HEROES.forEach(h=>{if(S.owned[h.id])return;const u=h.u;
  if(u.t==='boss'){const w=u.v;if(w<=S.maxW){let left=0;for(let n=0;n<STAGES_PER;n++)if(!S.stars[w+'-'+n])left++;c.push([left/8,`⚔ ${left} stage${left>1?'s':''} until you can unlock <b>${h.name}</b>`])}}
  else if(u.t==='coins'&&S.coins<u.v)c.push([(u.v-S.coins)/u.v,`🪙 ${u.v-S.coins} more coins to unlock <b>${h.name}</b>`]);
  else if(u.t==='gems'&&S.gems<u.v)c.push([(u.v-S.gems)/u.v,`💎 ${u.v-S.gems} more gems to unlock <b>${h.name}</b>`]);
  else if(u.t==='trophy'&&S.trophy<u.v)c.push([(u.v-S.trophy)/u.v,`🏆 ${u.v-S.trophy} trophies to unlock <b>${h.name}</b>`]);
  else if(u.t==='ads'){const n=S.adp['hero:'+h.id]||0;c.push([(u.v-n)/u.v*.9,`📺 ${u.v-n} ad${u.v-n>1?'s':''} away from unlocking <b>${h.name}</b>`])}});
 const tr=TROPHY[S.trClaim];if(tr&&S.trophy<tr[0])c.push([(tr[0]-S.trophy)/tr[0]+.05,`🏆 ${tr[0]-S.trophy} trophies to your next Trophy Road reward`]);
 c.sort((a,b)=>a[0]-b[0]);return c[0]?'Almost there: '+c[0][1]:''}
// free chest every 4 hours
const CHEST_MS=4*3600*1000;const chestReady=()=>Date.now()>=S.chest;
function chest(){if(!chestReady()){toastModal('FREE CHEST','Next chest in <b>'+fmtH(S.chest-Date.now())+'</b>. Come back soon!');return}
 const c=150+Math.round(Math.random()*250)+S.maxW*60,g=Math.random()<.4?5+(Math.random()*10|0):0;S.chest=Date.now()+CHEST_MS;S.coins+=c;S.gems+=g;save();Audio.win();burstUI();
 const d=document.createElement('div');d.className='scr dim';d.style.zIndex=9;d.innerHTML=`<div class="panel chestp"><div class="chestI">🎁</div><h2>CHEST OPENED</h2><p class="rw">+${c} 🪙 ${g?`&nbsp; +${g} 💎`:''}</p><button class="btn v" id="chx">📺 Double it</button><button class="btn g" id="chok">Collect</button><p class="near">Next free chest in 4 hours.</p></div>`;document.body.appendChild(d);
 $('chok').onclick=()=>{d.remove();mainMenu()};$('chx').onclick=()=>ad('rewarded',()=>{S.coins+=c;S.gems+=g;save();Audio.coin();d.remove();mainMenu()})}
const fmtH=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return (m/60|0)+'h '+String(m%60).padStart(2,'0')+'m'};
// daily titan event
function evInfo(){const d=Math.floor(Date.now()/864e5);const pool=HEROES.filter(h=>h.id!==S.hero);const h=pool[d%pool.length];return {id:h.id,h,w:d%5}}
function evLeft(){const n=new Date();const e=new Date(n);e.setHours(24,0,0,0);return fmtH(e-n)}
function event(){const ev=evInfo();const done=S.ev===today();showScreen(`<div class="scr dim">${cur()}<div class="panel" style="max-width:480px;text-align:center"><div class="sub" style="margin:0">⚡ LIMITED · ENDS IN ${evLeft()}</div><h2>THE DAILY TITAN</h2>
 <p>Today <b>${ev.h.name}, ${ev.h.title}</b> rises as a colossal Titan in ${WORLDS[ev.w].n}.</p><p class="rw">Reward: 🪙 ${500+S.maxW*150} · 💎 40 · 🏆 10</p>
 ${done?'<p style="color:#8ad98a">✔ Defeated today. A new Titan rises tomorrow.</p>':'<button class="btn g" id="evgo">⚔ Fight (free)</button>'}<button class="btn" id="bk">Back</button></div></div>`);
 $('evgo')&&($('evgo').onclick=()=>startBattle('event',0,0,true));$('bk').onclick=mainMenu}
// ---------- main menu ----------
function shopDot(){return HEROES.some(h=>!S.owned[h.id]&&((h.u.t==='coins'&&S.coins>=h.u.v)||(h.u.t==='gems'&&S.gems>=h.u.v)))||WEAPONS.some((w,i)=>!owns('wp',S.hero+':'+i)&&((w.p.t==='coins'&&S.coins>=w.p.v)||(w.p.t==='gems'&&S.gems>=w.p.v)))||(S.gad.d!==today()||S.gad.n<5)}
function trophyHeroes(){HEROES.forEach(h=>{if(h.u.t==='trophy'&&!S.owned[h.id]&&S.trophy>=h.u.v){S.owned[h.id]=1;save();setTimeout(()=>fanfare('CHAMPION UNLOCKED',h.name),400)}})}
let menuTick=null;
function mainMenu(){state='menu';rollQuests();enTick();trophyHeroes();const dl=S.dl.last!==today();const qr=S.day.q.some(q=>!q.c&&q.p>=q.n);const tr=TROPHY[S.trClaim]&&S.trophy>=TROPHY[S.trClaim][0];const ch=chestReady();const ev=S.ev!==today();
 showScreen(`<div class="scr menu">${cur()}<div class="en" id="en"></div><h1 class="title">ARENA<br><span style="font-size:.6em">OF TITANS</span></h1><div class="sub">FIVE ARENAS · ONE OATH</div>
 <div class="side"><button class="sb" id="bch">🎁<small id="chT">${ch?'FREE!':fmtH(S.chest-Date.now())}</small>${ch?'<i></i>':''}</button><button class="sb" id="bev">⚡<small>TITAN</small>${ev?'<i></i>':''}</button><button class="sb" id="bd">📅<small>DAILY</small>${dl?'<i></i>':''}</button><button class="sb" id="bq">📜<small>QUESTS</small>${qr?'<i></i>':''}</button><button class="sb" id="bt">🏆<small>ROAD</small>${tr?'<i></i>':''}</button></div>
 <div style="margin-top:auto;margin-bottom:3vh;text-align:center"><p class="near" style="margin:0 0 8px">${S.streak>1?`🔥 Win streak ×${S.streak} · `:''}${nearMiss()}</p><button class="btn g big" id="bc">⚔ Campaign</button><button class="btn" id="bg">☠ The Gauntlet</button>
 <div><button class="btn s" id="bh">🛡 Champions</button><button class="btn s" id="bs">🛒 Shop${dot(shopDot())}</button><button class="btn s" id="bset">⚙</button></div></div></div>`);
 $('bc').onclick=()=>{const w=S.maxW;if(!S.seen['w0']){showStory(0,()=>campaign(0))}else campaign(Math.min(w,4))};
 $('bg').onclick=()=>startBattle('gaunt',0,0);$('bh').onclick=()=>heroes(S.hero);$('bd').onclick=daily;$('bq').onclick=quests;$('bt').onclick=trophy;$('bs').onclick=()=>shop('hero');$('bset').onclick=()=>settings(mainMenu);$('bch').onclick=chest;$('bev').onclick=event;
 clearInterval(menuTick);const upd=()=>{if(!$('en')){clearInterval(menuTick);return}enTick();$('en').innerHTML=`⚡ ${S.en}/${ENMAX}${S.en<ENMAX?` <small>+1 in ${enLeft()}</small>`:''}`;const c=$('chT');if(c&&!chestReady())c.textContent=fmtH(S.chest-Date.now())};upd();menuTick=setInterval(upd,1000);
 if(dl&&!S._shownDaily){S._shownDaily=1;setTimeout(daily,500)}}
// ---------- settings ----------
function settings(back){const row=(l,id,v)=>`<div class="row"><div>${l}</div><button class="btn s ${v?'g':''}" id="${id}">${v}</button></div>`;
 showScreen(`<div class="scr dim"><div class="panel" style="max-width:440px"><h2>SETTINGS</h2>${row('🔊 Sound effects','ssf',S.sfx?'On':'Off')}${row('♪ Music','smu',S.music?'On':'Off')}
 <div class="row"><div>✨ Quality<br><small style="color:#9a8a70">Shadows, lights & particles. Resolution always stays full.</small></div><div>${['Low','Medium','High'].map((q,i)=>`<button class="btn s ${S.q===i?'g':''}" data-q="${i}">${q}</button>`).join('')}</div></div>
 ${row('📳 Screen shake','ssh',S.shake?'On':'Off')}<div class="row"><div>🎓 Tutorial</div><button class="btn s" id="stu">Replay</button></div><button class="btn" id="bk">Back</button></div></div>`);
 $('ssf').onclick=()=>{S.sfx=S.sfx?0:1;Audio.sv&&(Audio.sv.gain.value=S.sfx?.7:0);save();settings(back)};$('smu').onclick=()=>{toggleMusic();settings(back)};$('ssh').onclick=()=>{S.shake=S.shake?0:1;save();settings(back)};
 $('stu').onclick=()=>{S.tut=0;save();toastModal('TUTORIAL','The tutorial will play in stage 1-1.')};
 scr.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{S.q=+b.dataset.q;save();applyQuality();settings(back)});$('bk').onclick=back}
function applyQuality(){const on=S.q>0&&!location.search.includes('nosh');renderer.shadowMap.enabled=on;const m=S.q>1?2048:1024;if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}sun.shadow.mapSize.set(m,m);scene.traverse(o=>{if(o.material){[].concat(o.material).forEach(x=>x.needsUpdate=true)}});if(state==='menu'&&arena){const w=arena.userData.w;buildArena(w,false,true)}}
// ---------- shop ----------
function shop(tab){state='menu';const tabs=[['hero','Champions'],['wp','Weapons'],['fx','Effects'],['free','Free 💎']].map(([k,n])=>`<div class="tab ${tab===k?'on':''}" data-t="${k}">${n}</div>`).join('');let body='';
 if(tab==='hero')body=HEROES.map(h=>{const o=S.owned[h.id];const p=h.u;let act='';if(o)act='<span class="ok">✔ Owned</span>';else if(p.t==='coins'||p.t==='gems'||p.t==='ads')act=priceBtn(p,'b_'+h.id,'hero',h.id)+`<button class="btn s v" id="t_${h.id}">📺 Try 1 battle</button>`;else act=`<span class="lk">${p.t==='boss'?'⚔ Defeat '+WORLDS[p.v].bossN.split(',')[0]:'🏆 '+S.trophy+'/'+p.v+' trophies'}</span><button class="btn s v" id="t_${h.id}">📺 Try 1 battle</button>`;
  return `<div class="item"><img class="pt" src="portraits/${h.id}.jpg" style="border-color:#${h.col.toString(16).padStart(6,'0')};${o?'':'filter:grayscale(.6) brightness(.8)'}"><div class="it"><b>${h.name}</b> <small>${h.title}</small><br><small>✦ ${h.sp} · ❤${h.hp} ⚔${h.dmg}</small></div><div class="ia">${act}</div></div>`}).join('');
 if(tab==='wp'){const hid=S.hero;body=`<p class="near" style="margin-top:0">Weapons for <b>${HEROES[HI[hid]].name}</b> (change champion in Champions). Every weapon has its own model, moveset, speed and 3rd-hit finisher.</p>`+WEAPONS.map((w,i)=>{const o=owns('wp',hid+':'+i),on=(S.wsel[hid]||0)===i;
  const act=o?(on?'<span class="ok">✔ Equipped</span>':`<button class="btn s g" id="e_${i}">Equip</button>`):priceBtn(w.p,'b_'+i,'wp',hid+':'+i)+`<button class="btn s v" id="t_${i}">📺 Try 1 battle</button>`;
  return `<div class="item"><div class="sw" style="background:#${w.c.toString(16).padStart(6,'0')};box-shadow:0 0 14px #${w.c.toString(16).padStart(6,'0')}"></div><div class="it"><b>${w.n}</b><br><small>${(()=>{const t=WT[w.ty||HSTYLE[hid]];return `${w.ty?t.n:t.n+' (native)'} · ⚔×${(t.d*(1+w.d)).toFixed(2)} · ⏱${t.sp<.9?'Fast':t.sp>1.3?'Slow':'Normal'} · ↔${t.ranged?'Ranged':t.r>1.2?'Long':'Mid'}<br>Finisher: ${t.fn}`})()}</small></div><div class="ia">${act}</div></div>`}).join('')}
 if(tab==='fx')body=`<p class="near" style="margin-top:0">Effect packs change your hit sparks, shockwaves and slash trails.</p>`+FXP.map((f,i)=>{const o=!!S.fx[i]||i===0,on=S.fxs===i;const act=o?(on?'<span class="ok">✔ Equipped</span>':`<button class="btn s g" id="e_${i}">Equip</button>`):priceBtn(f.p,'b_'+i,'fx',i)+`<button class="btn s v" id="t_${i}">📺 Try 1 battle</button>`;
  return `<div class="item"><div class="sw" style="background:radial-gradient(#fff,#${f.hit.toString(16).padStart(6,'0')} 50%,#000);"></div><div class="it"><b>${f.n}</b><br><small>${['Warm golden sparks','Fiery bursts, 60% more sparks','Icy shards and frost trails','Purple void rifts','Radiant holy light, double sparks'][i]}</small></div><div class="ia">${act}</div></div>`}).join('');
 if(tab==='free'){if(S.gad.d!==today())S.gad={d:today(),n:0};body=`<div class="item"><div class="it" style="text-align:center"><b>Free Gems</b><br><small>Watch a short ad for 💎 8. ${5-S.gad.n} left today.</small></div><div class="ia">${S.gad.n<5?'<button class="btn s v" id="gad">📺 +8 💎</button>':'<span class="lk">Come back tomorrow</span>'}</div></div>
  <div class="item"><div class="it" style="text-align:center"><b>Energy Refill</b><br><small>⚡ ${S.en}/${ENMAX} · refills 1 every 5 min</small></div><div class="ia"><button class="btn s v" id="ead">📺 Fill ⚡</button></div></div><p class="near">No real money. Everything is earned by playing or watching optional ads.</p>`}
 showScreen(`<div class="scr dim">${cur()}<div class="panel shop"><h2>SHOP</h2><div class="tabs">${tabs}</div><div class="items">${body}</div><button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('.tab').forEach(t=>t.onclick=()=>shop(t.dataset.t));$('bk').onclick=mainMenu;const re=()=>shop(tab);
 const tryB=(o)=>ad('rewarded',()=>{trial=o;toastModal('TRIAL READY','Your next battle uses it. Pick a stage!');campaign(Math.min(S.maxW,4))},()=>toastModal('No ad available','Try again in a moment.'));
 if(tab==='hero')HEROES.forEach(h=>{const b=$('b_'+h.id);b&&(b.onclick=()=>payPrice(h.u,'hero',h.id,re));const t=$('t_'+h.id);t&&(t.onclick=()=>tryB({hero:h.id}))});
 if(tab==='wp')WEAPONS.forEach((w,i)=>{const b=$('b_'+i);b&&(b.onclick=()=>payPrice(w.p,'wp',S.hero+':'+i,re));const e=$('e_'+i);e&&(e.onclick=()=>{S.wsel[S.hero]=i;save();Audio.coin();re()});const t=$('t_'+i);t&&(t.onclick=()=>tryB({wp:i}))});
 if(tab==='fx')FXP.forEach((f,i)=>{const b=$('b_'+i);b&&(b.onclick=()=>payPrice(f.p,'fx',i,re));const e=$('e_'+i);e&&(e.onclick=()=>{S.fxs=i;save();Audio.coin();re()});const t=$('t_'+i);t&&(t.onclick=()=>tryB({fx:i}))});
 $('gad')&&($('gad').onclick=()=>ad('rewarded',()=>{S.gems+=8;S.gad.n++;save();Audio.coin();re()},()=>toastModal('No ad available','Try again in a moment.')));
 $('ead')&&($('ead').onclick=()=>ad('rewarded',()=>{S.en=ENMAX;save();Audio.coin();re()},()=>toastModal('No ad available','Try again in a moment.')))}
// ---------- tutorial ----------
let tutOn=false,tutStep=0,tutN=0;const fine=()=>matchMedia('(pointer:fine)').matches;
const TUT=()=>[fine()?'Move with <b>W A S D</b>':'Drag the <b>left stick</b> to move',fine()?'Attack: <b>J / Left-click</b>. Hit the dummy foes!':'Tap <b>⚔</b> to attack. Hit the foes!',fine()?'Dash: <b>Shift / L</b>':'Tap <b>➤</b> to dash',fine()?'Special: <b>E / K / Right-click</b>':'Tap <b>✦</b> for your special move','Defeat every foe! Knock them off the edge for a quick win.'];
function tutShow(){const t=$('tut');t.classList.remove('hide');t.innerHTML=`<small>TUTORIAL ${Math.min(tutStep+1,4)}/4</small><br>`+TUT()[tutStep];t.classList.remove('pop');void t.offsetWidth;t.classList.add('pop');if(tutStep>=4){S.tut=1;save();setTimeout(()=>{t.classList.add('hide');tutOn=false},3000)}}
function tutEv(k){if(!tutOn)return;if(tutStep===1&&k==='atk'&&++tutN>=3){tutStep=2;tutN=0;tutShow()}else if(tutStep===2&&k==='dash'){tutStep=3;if(player)player.spCd=0;tutShow()}else if(tutStep===3&&k==='sp'){tutStep=4;tutShow()}}
function showStory(w,cb){S.seen['w'+w]=1;save();const W=WORLDS[w];showScreen(`<div class="scr dim"><div class="sub">CHAPTER ${['I','II','III','IV','V'][w]}</div><h1 class="title" style="font-size:clamp(30px,6vw,54px)">${W.n.toUpperCase()}</h1><p class="story">${W.story}</p><button class="btn g" id="sg">Continue</button></div>`);$('sg').onclick=cb}
function campaign(w){state='menu';let tabs='';for(let i=0;i<5;i++)tabs+=`<div class="tab ${i===w?'on':''} ${i>S.maxW?'off':''}" data-w="${i}">${i<=S.maxW?'':'🔒 '}${i+1}. ${WORLDS[i].n}</div>`;
 let g='';for(let n=0;n<STAGES_PER;n++){const k=w+'-'+n,st=S.stars[k]||0;const open=w<=S.maxW&&(n===0||S.stars[w+'-'+(n-1)]);const boss=n===STAGES_PER-1;
  g+=`<div class="st ${open?'':'lock'} ${boss?'boss':''}" data-n="${n}">${boss?'☠':n+1}<small>${'★'.repeat(st)}${'☆'.repeat(3-st)}</small></div>`}
 const tot=Object.values(S.stars).reduce((a,b)=>a+b,0);
 showScreen(`<div class="scr dim">${cur()}<div class="panel"><h2>CAMPAIGN · ${tot}/120 ★</h2><div class="tabs">${tabs}</div><p style="text-align:center;color:#b7a58a;font-style:italic;margin:4px 0 12px">Hazard: ${['Spike traps','Slippery ice & falling icicles','Lava eruptions','Spinning crypt blade','Lightning & storm gusts'][w]} · Boss: ${WORLDS[w].bossN}</p><div class="grid">${g}</div><button class="btn" id="bk" style="margin-top:14px">Back</button></div></div>`);
 scr.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{const i=+t.dataset.w;if(i<=S.maxW){if(!S.seen['w'+i])showStory(i,()=>campaign(i));else campaign(i)}});
 scr.querySelectorAll('.st').forEach(t=>t.onclick=()=>{if(!t.classList.contains('lock'))startBattle('camp',w,+t.dataset.n)});$('bk').onclick=mainMenu}
function heroes(sel){const h=HEROES[HI[sel]];const own=S.owned[sel];const l=lvOf(sel);const cp=Math.round(120*Math.pow(1.55,l.p)),cv=Math.round(120*Math.pow(1.55,l.v));
 setMenuHero(sel);
 let list=HEROES.map(x=>`<div class="hc ${x.id===sel?'on':''} ${S.owned[x.id]?'':'lk'}" data-h="${x.id}"><img src="portraits/${x.id}.jpg"><br>${S.owned[x.id]?'':'🔒'}<b>${x.name}</b></div>`).join('');
 let skins=SKINS.map((s,i)=>{const have=i===0||(S.skins[sel]||[]).includes(i);const on=(S.skin[sel]||0)===i;return `<button class="btn s ${on?'g':''}" data-s="${i}" style="${s.c?'border-color:#'+s.c.toString(16).padStart(6,'0'):''}">${s.n}${have?'':' 💎'+s.g}</button>`}).join('');
 const u=h.u;const lockTxt=own?'':(u.t==='coins'||u.t==='gems'||u.t==='ads')?priceBtn(u,'buy','hero',sel):u.t==='boss'?`<p style="color:#ff9b7a">Defeat the boss of ${WORLDS[u.v].n} to unlock.</p>`:`<p style="color:#ff9b7a">Reach 🏆 ${u.v} trophies (${S.trophy}/${u.v}).</p>`;
 showScreen(`<div class="scr dim" style="justify-content:flex-end;background:linear-gradient(#0000 30%,#000d 60%)">${cur()}<div class="panel heroP"><div class="hl">${list}</div>
 <div class="hero"><div class="info"><h2 style="text-align:left;margin:0">${h.name.toUpperCase()}</h2><div style="color:#b7a58a;font-style:italic">${h.title}</div>
 <p style="margin:6px 0">❤ ${Math.round(h.hp*(1+.1*l.v))} &nbsp; ⚔ ${Math.round(h.dmg*(1+.1*l.p))} &nbsp; 👟 ${h.spd} &nbsp; 🗡 ${own?curWp(sel).n:''}</p><p style="margin:6px 0"><b style="color:#b9a6ff">✦ ${h.sp}</b> — ${h.spd2}</p></div>
 <div class="info">${own?`<div class="row">Power Lv ${l.p}<button class="btn s ${S.coins<cp||l.p>=10?'off':''}" id="up">${l.p>=10?'MAX':'🪙 '+cp}</button></div><div class="row">Vitality Lv ${l.v}<button class="btn s ${S.coins<cv||l.v>=10?'off':''}" id="uv">${l.v>=10?'MAX':'🪙 '+cv}</button></div>
 ${S.hero===sel?'<p style="text-align:center;color:#8ad98a">✔ Selected</p>':'<button class="btn g" id="sel">Select</button>'}`:lockTxt}</div></div>
 ${own?`<div style="text-align:center;margin-top:6px">${skins}<button class="btn s" id="wps">🗡 Weapons</button></div>`:''}<button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('.hc').forEach(c=>c.onclick=()=>heroes(c.dataset.h));$('bk').onclick=()=>{setMenuHero(S.hero);mainMenu()};
 const B=(id,f)=>$(id)&&($(id).onclick=f);
 B('buy',()=>payPrice(h.u,'hero',sel,()=>heroes(sel)));
 B('up',()=>{if(S.coins>=cp&&l.p<10){S.coins-=cp;S.lv[sel]={...l,p:l.p+1};save();heroes(sel);fanfare('LEVEL UP','Power '+(l.p+1))}});
 B('uv',()=>{if(S.coins>=cv&&l.v<10){S.coins-=cv;S.lv[sel]={...l,v:l.v+1};save();heroes(sel);fanfare('LEVEL UP','Vitality '+(l.v+1))}});
 B('sel',()=>{S.hero=sel;save();heroes(sel)});B('wps',()=>{S.hero=sel;save();shop('wp')});
 scr.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const i=+b.dataset.s;const have=i===0||(S.skins[sel]||[]).includes(i);if(!have){if(S.gems<SKINS[i].g)return;S.gems-=SKINS[i].g;(S.skins[sel]=S.skins[sel]||[]).push(i)}S.skin[sel]=i;save();heroes(sel)})}
function setMenuHero(id){if(state!=='menu')return;clearEnts();menuChar=makeEnt(id,0,{tint:SKINS[S.skin[id]||0].c});menuChar.pos.set(0,0,0);if(!S.owned[id])menuChar.mat.color.setRGB(.15,.15,.18)}
function daily(){const can=S.dl.last!==today();const yest=new Date(Date.now()-864e5).toDateString();if(can&&S.dl.last&&S.dl.last!==yest)S.dl.n=0;const i=S.dl.n%7;
 const days=DAILY.map((d,k)=>`<div class="${k<i?'dn':k===i&&can?'nw':''}">Day ${k+1}<br>${d[0]?'🪙'+d[0]:'💎'+d[1]}</div>`).join('');
 showScreen(`<div class="scr dim">${cur()}<div class="panel" style="max-width:520px;text-align:center"><h2>DAILY OFFERING</h2><p style="color:#b7a58a">Return every day. Miss a day and the streak resets.</p><div class="days">${days}</div>
 ${can?'<button class="btn g" id="cl">Claim</button><button class="btn v" id="cl2">📺 Claim x2</button>':'<p>Come back tomorrow, champion.</p>'}<button class="btn" id="bk">Back</button></div></div>`);
 const claim=m=>{const d=DAILY[i];S.coins+=d[0]*m;S.gems+=d[1]*m;S.dl={last:today(),n:S.dl.n+1};save();Audio.win();burstUI();daily()};
 $('cl')&&($('cl').onclick=()=>claim(1));$('cl2')&&($('cl2').onclick=()=>ad('rewarded',()=>claim(2)));$('bk').onclick=mainMenu}
function burstUI(){if(menuChar){burst(menuChar.pos.clone().setY(1.5),0xffd36a,40,6,1,.4,6);ring(menuChar.pos,4,0xffd36a,.7)}}
function quests(){const q=S.day.q.map((q,i)=>{const t=QPOOL.find(p=>p[0]===q.k)[1].replace('{n}',q.n);const done=q.p>=q.n;return `<div class="row"><div style="flex:1">${t}<div class="prog"><i style="width:${Math.min(100,q.p/q.n*100)}%"></i></div><small>${Math.min(q.p,q.n)}/${q.n}</small></div>${q.c?'✔':`<button class="btn s ${done?'g':'off'}" data-q="${i}">🪙 ${q.r}</button>`}</div>`}).join('');
 showScreen(`<div class="scr dim">${cur()}<div class="panel" style="max-width:520px"><h2>DAILY QUESTS</h2>${q}<p style="text-align:center;color:#9a8a70;font-size:13px">New quests every day.</p><button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const q=S.day.q[+b.dataset.q];if(q.p>=q.n&&!q.c){q.c=1;S.coins+=q.r;S.trophy+=5;save();Audio.coin();burstUI();quests()}});$('bk').onclick=mainMenu}
function trophy(){const rows=TROPHY.map((t,i)=>{const got=i<S.trClaim,can=!got&&i===S.trClaim&&S.trophy>=t[0];const rw=t[1]==='move'?'⚔ Technique: '+MOVES[t[2]]:t[1]==='coins'?'🪙 '+t[2]:t[1]==='gems'?'💎 '+t[2]:'🎨 Random skin';
  return `<div class="row" style="${got?'opacity:.5':''}"><div>🏆 ${t[0]}</div><div style="flex:1;text-align:center">${rw}</div>${got?'✔':`<button class="btn s ${can?'g':'off'}" data-t="${i}">${can?'Claim':'Locked'}</button>`}</div>`}).join('');
 showScreen(`<div class="scr dim">${cur()}<div class="panel" style="max-width:520px"><h2>TROPHY ROAD</h2><p style="text-align:center;color:#b7a58a">Earn trophies from stars, victories, quests and the Gauntlet.</p>${rows}<button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const i=+b.dataset.t,t=TROPHY[i];if(i!==S.trClaim||S.trophy<t[0])return;if(t[1]==='move'){S.mv[t[2]]=1;S.trClaim++;save();Audio.win();fanfare('NEW TECHNIQUE',MOVES[t[2]]);trophy();return}if(t[1]==='coins')S.coins+=t[2];else if(t[1]==='gems')S.gems+=t[2];else{const h=S.hero;const a=(S.skins[h]=S.skins[h]||[]);const opts=[1,2,3,4].filter(x=>!a.includes(x));if(opts.length)a.push(opts[0]);else S.gems+=40}S.trClaim++;save();Audio.win();happy();trophy()});$('bk').onclick=mainMenu}
function toastModal(t,b){const d=document.createElement('div');d.className='scr dim';d.style.zIndex=9;d.innerHTML=`<div class="panel" style="max-width:400px;text-align:center"><h2>${t}</h2><p>${b}</p><button class="btn g">OK</button></div>`;document.body.appendChild(d);d.querySelector('button').onclick=()=>d.remove()}
// ================= LOOP =================
let last=performance.now(),T=0,slowT=0,slowK=1,zoomT=0,zoomTgt=null;
function slowmo(t,k){if(t>slowT||k<slowK){slowT=t;slowK=k}}
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;const rdt=dt;T+=dt;
 if(slowT>0){slowT-=rdt;dt*=slowK;if(slowT<=0)slowK=1}
 if(hitstop>0){hitstop-=rdt;dt*=.04}
 if(state==='play')updateBattle(dt);updFalls(rdt);
 animEnts(dt,T);
 if((state==='play'||state==='wait'||state==='end'||state==='pause')&&player){const asp=camera.aspect;let back=asp<1?12:8.5,hgt=asp<1?14:10.5;let tx=player.pos.x*.75,tz=player.pos.z*.75;{let n=null,bd=9;ents.forEach(o=>{if(o.team&&!o.dead&&!o.falling){const d=o.pos.distanceTo(player.pos);if(d<bd){bd=d;n=o}}});if(n){tx+=(n.pos.x-player.pos.x)*.22;tz+=(n.pos.z-player.pos.z)*.22}}
  if(zoomT>0){zoomT-=rdt;const f=zoomTgt||player;back*=.5;hgt*=.45;tx=f.pos.x;tz=f.pos.z}
  camLook.lerp(v2.set(tx,zoomT>0?1:0,tz),Math.min(1,rdt*(zoomT>0?6:4)));camPos.lerp(v2.set(camLook.x,hgt,camLook.z+back),Math.min(1,rdt*(zoomT>0?5:4)))}
 else if(state==='intro'){const k=Math.min(1,introT/3.2);introT+=rdt;const e=1-Math.pow(1-k,3);camLook.set(0,1.1,0);camPos.set(Math.sin(e*2.2-1.2)*(22-17.5*e),14-11.8*e,Math.cos(e*2.2-1.2)*(22-17.5*e))}
 else{const a=T*.15;camLook.lerp(v2.set(0,1.1,0),.1);camPos.lerp(v2.set(Math.sin(a)*4.5,2.2,Math.cos(a)*4.5+0),.05);if(menuChar)menuChar.face=Math.sin(T*.3)*.4+Math.atan2(camPos.x,camPos.z)}
 camera.position.copy(camPos);if(fovK>0){fovK=Math.max(0,fovK-rdt*14)}const fv=48-fovK;if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}if(shake>0&&S.shake){shake=Math.max(0,shake-rdt*1.6-shake*rdt*3);const q=shake*shake*1.6;camera.position.x+=(Math.random()-.5)*q;camera.position.y+=(Math.random()-.5)*q}else shake=Math.max(0,shake-rdt);camera.lookAt(camLook);
 sun.position.set(camLook.x+8,18,camLook.z+6);fill.position.copy(camera.position);fill.target.position.copy(camLook);sun.target.position.copy(camLook);
 for(let i=sparks.length-1;i>=0;i--){const s=sparks[i],u=s.userData;u.l-=dt;if(u.l<=0){s.visible=false;sparks.splice(i,1);sparkPool.push(s);continue}u.vy-=9*dt*(u.g??1);s.position.x+=u.vx*dt;s.position.y+=u.vy*dt;s.position.z+=u.vz*dt;const k=u.l/u.L;s.scale.setScalar(u.sz*(.4+k));s.material.opacity=k}
 for(let i=rings.length-1;i>=0;i--){const m=rings[i],u=m.userData;u.l-=dt;const k=1-u.l/u.L;if(!u.sl)m.scale.setScalar(.2+k*u.r);else m.scale.setScalar(u.s0*(1+k*.25));m.material.opacity=(1-k)*(u.op||.9);if(u.l<=0){fxGroup.remove(m);m.material.dispose();if(!u.sl)m.geometry.dispose();rings.splice(i,1)}}
 updCoins(dt);
 for(let i=dmgs.length-1;i>=0;i--){const d=dmgs[i];d._t-=rdt;d._p.y+=rdt*1.5;v2.copy(d._p).project(camera);d.style.left=(v2.x*.5+.5)*innerWidth+'px';d.style.top=(-v2.y*.5+.5)*innerHeight+'px';d.style.opacity=Math.min(1,d._t*3);if(d._t<=0){d.remove();dmgs.splice(i,1)}}
 if(bannerT>0){bannerT-=rdt;if(bannerT<=0)$('banner').style.opacity=0}
 if(ambient){const p=ambient.geometry.attributes.position,k=ambient.userData.k;for(let i=0;i<p.count;i++){let y=p.getY(i);y+=k==='ember'?dt*1.2:k==='wisp'?dt*.3:k==='rain'?-dt*18:-dt*1.5;if(y>14)y=-2;if(y<-2)y=14;p.setY(i,y)}p.needsUpdate=true}
 skyMat.uniforms.t.value=T;
 if(flashT>0){flashT-=rdt;renderer.toneMappingExposure=EXPO+flashT*12}else renderer.toneMappingExposure=EXPO;
 updateArena(rdt,T);
 renderer.render(scene,camera)}
// ================= BOOT =================
let introT=0;
(async()=>{const sp=$('splash');
 const sdkW=(async()=>{try{SDK||await Promise.race([sdkReady,new Promise(r=>setTimeout(r,2500))]);SDK&&SDK.game.loadingStart&&SDK.game.loadingStart()}catch(e){}})();
 const tot=HEROES.length,ld={},sz={};let shown=0,done=0;const creep=setInterval(()=>{if(shown<92){shown++;$('ldbar').style.width=shown+'%';$('ldpct').textContent=shown+'%'}},350);const prog=()=>{let a=0,b=0;HEROES.forEach(h=>{const t=sz[h.id]||640000;b+=t;a+=Math.min(t,ld[h.id]||0)});const v=Math.min(100,Math.max(shown,Math.round(a/b*100),Math.round(done/tot*100)));shown=v;$('ldbar').style.width=v+'%';$('ldpct').textContent=v+'%'};prog();
 await Promise.all(HEROES.map(h=>new Promise(res=>{let ok=0;const fin=()=>{if(ok)return;ok=1;done++;ld[h.id]=sz[h.id]||640000;prog();res()};setTimeout(fin,25000);
  loader.load('models/'+h.id+'.glb',g=>{let m=null;g.scene.traverse(o=>{if(o.isMesh&&!m)m=o});MODELS[h.id]=m;fin()},x=>{if(x.total)sz[h.id]=x.total;ld[h.id]=x.loaded;prog()},fin)})));
 clearInterval(creep);shown=100;$('ldbar').style.width='100%';$('ldpct').textContent='100%';await Promise.race([sdkW,new Promise(r=>setTimeout(r,3000))]);
 setupMenuScene();try{SDK&&SDK.game.loadingStop&&SDK.game.loadingStop()}catch(e){}requestAnimationFrame(frame);
 const tips=['Knock foes off the edge for an instant kill.','Chain hits without getting struck to build a combo.','A free chest waits every 4 hours.','The Daily Titan changes every day.'];
 $('ldtxt').textContent=tips[(Math.random()*tips.length)|0];
 sp.classList.add('ready');const go=()=>{sp.removeEventListener('pointerdown',go);removeEventListener('keydown',go);Audio.init();Audio.ctx&&Audio.ctx.resume();Audio.tone(110,2.2,'sawtooth',.18,55);Audio.boom();
  sp.classList.add('out');state='intro';showScreen('<div class="scr introT"><div class="sub">A TALE OF FALLEN GODS</div><h1 class="title">ARENA<br><span style="font-size:.6em">OF TITANS</span></h1></div>');introT=0;setTimeout(()=>sp.remove(),1200);setTimeout(()=>{if(state==='intro'){camPos.set(0,2.2,4.5);mainMenu()}},3300)};
 sp.addEventListener('pointerdown',go);addEventListener('keydown',go);if(location.search.includes('auto'))go()})();
const muteB=document.getElementById('muteB');const muteUpd=()=>{muteB.textContent=(S.sfx||S.music)?'🔊':'🔇'};muteB.addEventListener('pointerdown',ev=>{ev.stopPropagation();const on=!(S.sfx||S.music);S.sfx=on;S.music=on;if(Audio.sv)Audio.sv.gain.value=on?.7:0;if(Audio.mv)Audio.mv.gain.value=on?.32:0;save();muteUpd()});muteUpd();
addEventListener('blur',()=>{if(state==='play')pause()});addEventListener('visibilitychange',()=>{if(document.hidden){save();if(state==='play')pause()}});
window.__G={setupMenuScene,get menuChar(){return menuChar},renderer,shop,settings,chest,event,heroes,mainMenu,get S(){return S},get ents(){return ents},get state(){return state},startBattle,get player(){return player}};
