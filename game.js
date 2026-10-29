import * as THREE from 'three';
import { GLTFLoader } from './GLTFLoader.js';
// ================= SDK =================
let SDK=null;const sdkReady=(async()=>{try{if(window.CrazyGames){await CrazyGames.SDK.init();SDK=CrazyGames.SDK;}}catch(e){SDK=null}})();
let gpOn=false;const gpStart=()=>{if(gpOn)return;gpOn=true;try{SDK&&SDK.game.gameplayStart()}catch(e){}};const gpStop=()=>{if(!gpOn)return;gpOn=false;try{SDK&&SDK.game.gameplayStop()}catch(e){}};
const happy=()=>{try{SDK&&SDK.game.happytime()}catch(e){}};
function ad(type,ok,fail){if(!SDK){ok&&ok();return}const was=gpOn;gpStop();Audio.duck(true);
 const done=f=>{Audio.duck(false);if(was)gpStart();f&&f()};
 try{SDK.ad.requestAd(type,{adFinished:()=>done(ok),adError:()=>done(type==='rewarded'?fail:ok),adStarted:()=>{}})}catch(e){done(ok)}}
// ================= DATA =================
const HEROES=[
 {id:'knight',name:'Aldric',title:'The Oathbound Knight',hp:120,dmg:14,spd:6.2,range:2.3,sp:'Shield Charge',spd2:'Charge forward, smashing foes aside.',cd:6,cost:0,col:0x6aa8ff},
 {id:'rogue',name:'Nyx',title:'Emerald Shade',hp:85,dmg:12,spd:7.6,range:2.0,sp:'Shadow Blink',spd2:'Teleport behind the nearest foe and strike twice.',cd:5,cost:1500,col:0x4dff9a},
 {id:'wolf',name:'Fenrak',title:'The Chained Beast',hp:110,dmg:13,spd:7.0,range:2.1,sp:'Blood Frenzy',spd2:'Rage: double attack speed and lifesteal for 5s.',cd:9,cost:0,boss:1,col:0xffcc44},
 {id:'minotaur',name:'Gorath',title:'Lord of the Labyrinth',hp:160,dmg:17,spd:5.6,range:2.5,sp:'Earthshatter',spd2:'Slam the ground, hurling every nearby foe.',cd:7,cost:0,boss:0,col:0xff8a3a},
 {id:'golem',name:'Kragg',title:'The Molten Heart',hp:200,dmg:19,spd:5.0,range:2.6,sp:'Magma Burst',spd2:'Erupt with lava, burning and stunning foes.',cd:8,cost:0,boss:2,col:0xff5a1a},
 {id:'lich',name:'Morvane',title:'The Crowned Dead',hp:95,dmg:15,spd:6.0,range:2.2,sp:'Soul Nova',spd2:'Unleash a ring of soul fire that seeks foes.',cd:6,cost:0,boss:3,col:0xb76aff},
];
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
const TROPHY=[[50,'coins',300],[120,'gems',15],[200,'coins',800],[300,'skin',1],[420,'gems',30],[560,'coins',2000],[720,'gems',50],[900,'coins',4000],[1100,'gems',80],[1400,'coins',8000]];
const QPOOL=[['win','Win {n} battles',3,150],['ko','Defeat {n} enemies',25,150],['sp','Use specials {n} times',15,120],['star3','Earn 3 stars {n} times',2,200],['gaunt','Reach wave {n} in the Gauntlet',5,250],['boss','Defeat {n} boss',1,300]];
const DAILY=[[200,0],[0,10],[400,0],[600,0],[0,25],[1000,0],[0,60]];
// ================= SAVE =================
const KEY='aot_save_v1';
const S0={coins:0,gems:0,hero:'knight',owned:{knight:1},lv:{},skin:{},skins:{},stars:{},maxW:0,trophy:0,trClaim:0,day:{d:'',q:[]},dl:{last:'',n:0},best:0,music:1,sfx:1,seen:{},wins:0};
let S;try{S=Object.assign(structuredClone(S0),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=structuredClone(S0)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const today=()=>new Date().toDateString();
function rollQuests(){if(S.day.d===today())return;let p=[...QPOOL].sort(()=>Math.random()-.5).slice(0,3);S.day={d:today(),q:p.map(q=>({k:q[0],n:q[2],r:q[3],p:0,c:0}))};save()}
rollQuests();
function quest(k,v=1){S.day.q.forEach(q=>{if(q.k===k&&!q.c){q.p=k==='gaunt'?Math.max(q.p,v):q.p+v}});save()}
const lvOf=id=>S.lv[id]||{p:0,v:0};
// ================= AUDIO =================
const Audio={ctx:null,m:null,mv:null,sv:null,init(){if(this.ctx)return;try{const C=this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.m=C.createGain();this.m.connect(C.destination);this.mv=C.createGain();this.mv.gain.value=S.music?.32:0;this.mv.connect(this.m);this.sv=C.createGain();this.sv.gain.value=S.sfx?.7:0;this.sv.connect(this.m);
 const b=C.createBuffer(1,C.sampleRate,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b;this.music()}catch(e){}},
 duck(on){if(this.m)this.m.gain.value=on?0:1},
 tone(f,dur,type='sine',v=.3,f2=0,dest){const C=this.ctx;if(!C)return;const t=C.currentTime,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(dest||this.sv);o.start(t);o.stop(t+dur)},
 noise(dur,fq,v=.3,q=1,type='bandpass',dest){const C=this.ctx;if(!C)return;const t=C.currentTime,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=this.nb;f.type=type;f.frequency.setValueAtTime(fq,t);f.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(dest||this.sv);s.start(t,Math.random()*.5);s.stop(t+dur)},
 swing(){this.noise(.16,1800,.25,2)},hit(h){this.noise(.12,500,.5,1,'lowpass');this.tone(h?90:140,.15,'triangle',.4,50)},
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
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(window.devicePixelRatio||1);// full device resolution, never lowered
renderer.shadowMap.enabled=!location.search.includes('nosh');renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(48,1,.1,200);
function resize(){renderer.setPixelRatio(window.devicePixelRatio||1);renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<1?62:48;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const hemi=new THREE.HemisphereLight(0x8090b0,0x201008,1.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc890,2.8);sun.position.set(8,18,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=sc.bottom=-14;sc.right=sc.top=14;sc.near=1;sc.far=50;sun.shadow.bias=-.0008;scene.add(sun,sun.target);
const rim=new THREE.DirectionalLight(0x8090ff,1.0);rim.position.set(-8,6,-10);scene.add(rim);
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
let arena=null,R=9;
const particles=[];let ambient=null;
function buildArena(w,quick){if(arena)scene.remove(arena);arena=new THREE.Group();scene.add(arena);const W=WORLDS[w];R=quick?9.5:9;
 scene.fog=new THREE.FogExp2(W.fog,.022);skyMat.uniforms.a.value.set(W.sky[0]);skyMat.uniforms.b.value.set(W.sky[1]);sun.color.set(W.light);hemi.color.set(W.amb);hemi.groundColor.set(W.fog);
 const top=new THREE.Mesh(new THREE.CylinderGeometry(R,R,1.2,64,1),[new THREE.MeshStandardMaterial({color:W.edge,roughness:.95}),new THREE.MeshStandardMaterial({map:stoneTex(W.floor,W.edge,w+3),roughness:w==1?.25:.85,metalness:w==1?.2:0}),new THREE.MeshStandardMaterial({color:W.edge})]);
 top.position.y=-.6;top.receiveShadow=true;arena.add(top);
 const under=new THREE.Mesh(new THREE.ConeGeometry(R*.98,9,32,1,true),new THREE.MeshStandardMaterial({color:W.edge,roughness:1,flatShading:true}));under.rotation.x=Math.PI;under.position.y=-5.7;arena.add(under);
 // pillars + braziers
 const pg=new THREE.CylinderGeometry(.35,.45,3.2,8),pm=new THREE.MeshStandardMaterial({color:W.edge,roughness:.9,flatShading:true});
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2,p=new THREE.Mesh(pg,pm);p.position.set(Math.cos(a)*(R+.9),.6,Math.sin(a)*(R+.9));p.castShadow=true;arena.add(p);
  const f=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:w==3?0x9a7aff:w==1?0x9ad8ff:0xff9a3a,blending:THREE.AdditiveBlending,depthWrite:false}));f.scale.setScalar(1.6);f.position.set(p.position.x,2.5,p.position.z);f.userData.flick=Math.random()*9;arena.add(f)}
 // floating debris
 const rg=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<14;i++){const r=new THREE.Mesh(rg,pm);const a=Math.random()*6.28,d=R+5+Math.random()*16;r.position.set(Math.cos(a)*d,-3-Math.random()*8,Math.sin(a)*d);r.scale.setScalar(.6+Math.random()*2.2);r.userData.bob=Math.random()*6;r.rotation.set(Math.random()*3,Math.random()*3,0);arena.add(r)}
 // lava pools / ice tint etc
 if(W.hz==='lava'){const lm=new THREE.MeshBasicMaterial({color:0xff5a10});const sea=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:0x6a1a04}));sea.rotation.x=-Math.PI/2;sea.position.y=-12;arena.add(sea)}
 // ambient particles
 if(ambient)scene.remove(ambient);const N=W.part==='rain'?500:260,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*40;pos[i*3+1]=Math.random()*16-2;pos[i*3+2]=(Math.random()-.5)*40}
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 ambient=new THREE.Points(gg,new THREE.PointsMaterial({map:GLOW,size:W.part==='rain'?.12:W.part==='snow'?.22:.18,color:{ember:0xff8a3a,snow:0xffffff,wisp:0x9a8aff,rain:0xaac8ff}[W.part],transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));ambient.userData.k=W.part;scene.add(ambient);
 Audio.key=w;Audio.setK&&Audio.setK();
 // hazards
 hz.length=0;hzT=3;blade=null;
 if(W.hz==='blade'){blade=new THREE.Group();const bm=new THREE.Mesh(new THREE.BoxGeometry(R*1.9,.25,.35),new THREE.MeshStandardMaterial({color:0x9aa0b0,metalness:.8,roughness:.3,emissive:0x2a1a4a}));bm.position.y=.5;bm.castShadow=true;blade.add(bm);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.6,.8,.8,12),new THREE.MeshStandardMaterial({color:0x3a3048,metalness:.5}));hub.position.y=.4;blade.add(hub);arena.add(blade)}
}
// ================= FX =================
const fxGroup=new THREE.Group();scene.add(fxGroup);const sparks=[];
const sparkMatCache={};function sMat(c){return sparkMatCache[c]||(sparkMatCache[c]=new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}))}
const sparkPool=[];
function burst(p,c,n=12,sp=6,life=.5,size=.35,up=3){for(let i=0;i<n;i++){let s=sparkPool.pop();if(!s){s=new THREE.Sprite(sMat(c));fxGroup.add(s)}s.material=sMat(c);s.visible=true;s.position.copy(p);const a=Math.random()*6.28,v=Math.random()*sp;s.userData={vx:Math.cos(a)*v,vy:Math.random()*up+1,vz:Math.sin(a)*v,l:life*(.6+Math.random()*.6),L:life,sz:size};sparks.push(s)}}
const rings=[];function ring(p,r,c,life=.4){const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:RING,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.06,p.z);m.userData={r,l:life,L:life};fxGroup.add(m);rings.push(m)}
const slashGeo=new THREE.RingGeometry(.6,1,24,1,-1,2);
function slash(e,c){const m=new THREE.Mesh(slashGeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.rotation.z=-e.face+Math.PI/2;m.position.set(e.pos.x,1,e.pos.z);const s=e.h.range*e.sc;m.scale.setScalar(s);m.userData={l:.18,L:.18,sl:1};fxGroup.add(m);rings.push(m)}
let shake=0,hitstop=0;
const labels=document.getElementById('labels');
function dmgText(p,v,cls=''){const d=document.createElement('div');d.className='dmg '+cls;d.textContent=v;labels.appendChild(d);d._p=p.clone().add(new THREE.Vector3((Math.random()-.5)*.6,2.2,0));d._t=.8;dmgs.push(d)}
const dmgs=[];
// ================= ENTITIES =================
let ents=[],player=null,mode=null,stageW=0,stageN=0,wave=0,waves=1,time=0,state='menu',kos=0,dmgTaken=0,spUsed=0,revived=false,bossE=null;
const hz=[];let hzT=0,blade=null;
function makeEnt(id,team,opt={}){const h=HEROES[HI[id]];const sc=opt.scale||1;const tint=opt.tint!==undefined?opt.tint:null;const c=makeChar(id,tint,sc);scene.add(c.root);
 const l=team===0?lvOf(id):{p:0,v:0};const mult=opt.mult||1;
 const e={id,h,team,root:c.root,body:c.body,mat:c.mat,sc,pos:new THREE.Vector3(),vel:new THREE.Vector3(),face:0,hp:h.hp*(1+.1*l.v)*mult*(opt.hpm||1),dmg:h.dmg*(1+.1*l.p)*(team?.35+.3*mult:1),spd:h.spd*(team?.78:1)*(opt.spdm||1),
  atkCd:0,spCd:team?h.cd*1.5:1,dashCd:0,stun:0,flash:0,wind:0,frenzy:0,falling:0,dead:0,squash:0,boss:!!opt.boss,ai:{t:Math.random(),strafe:Math.random()<.5?1:-1},inv:0,charge:0,blink:0};
 e.max=e.hp;
 if(team){const b=document.createElement('div');b.className='ehp'+(e.boss?' boss':'');b.innerHTML='<i></i>';labels.appendChild(b);e.bar=b}
 ents.push(e);return e}
function clearEnts(){ents.forEach(e=>{scene.remove(e.root);e.bar&&e.bar.remove()});ents=[];dmgs.forEach(d=>d.remove());dmgs.length=0;bossE=null;const bb=document.getElementById('bossbar');bb&&bb.remove()}
function damage(t,amt,from,kb=6,crit=false){if(t.dead||t.falling||t.inv>0)return;amt=Math.round(amt*(crit?1.8:1));t.hp-=amt;t.flash=.15;t.squash=.25;
 const d=new THREE.Vector3().subVectors(t.pos,from?from.pos:t.pos.clone().add(new THREE.Vector3(0,0,-1)));d.y=0;d.normalize();const res=t.boss?.35:1;t.vel.addScaledVector(d,kb*res);
 dmgText(t.pos,amt,t.team===0?'p':crit?'c':'');Audio.hit(t.team===0);burst(t.pos.clone().setY(1.1),t.team===0?0xff3a3a:0xffc46a,10,5,.35,.3);
 if(t.team===0){dmgTaken+=amt;shake=Math.max(shake,.25)}else shake=Math.max(shake,.12);hitstop=crit?.08:.035;
 if(from&&from.frenzy>0)from.hp=Math.min(from.max,from.hp+amt*.3);
 if(t.hp<=0)kill(t)}
function kill(t){t.dead=1;t.hp=0;burst(t.pos.clone().setY(1),t.boss?0xff6a2a:0xffaa5a,t.boss?60:28,9,.9,.5,6);ring(t.pos,t.boss?8:3.5,0xffaa5a,.6);Audio.boom();
 if(t.team){kos++;quest('ko');S.coins+=t.boss?0:0;}if(t.bar){t.bar.remove();t.bar=null}
 if(t===player)setTimeout(()=>endBattle(false),900)}
// ================= COMBAT =================
const tmp=new THREE.Vector3();
function attack(e){if(e.atkCd>0||e.stun>0||e.dead||e.falling)return;e.atkCd=(e.frenzy>0?.22:.45);e.squash=-.2;Audio.swing();slash(e,e.team?0xff7a5a:0xfff0c0);
 const r=e.h.range*e.sc+.4,fx=Math.sin(e.face),fz=Math.cos(e.face);
 ents.forEach(t=>{if(t.team===e.team||t.dead)return;tmp.subVectors(t.pos,e.pos);tmp.y=0;const d=tmp.length();if(d>r+.4*t.sc)return;tmp.normalize();if(tmp.x*fx+tmp.z*fz<.25&&d>.9)return;damage(t,e.dmg,e,e.team?5:7,e.team===0&&Math.random()<.15)})}
function special(e){if(e.spCd>0||e.stun>0||e.dead||e.falling)return false;e.spCd=e.h.cd*(e.team?1.6:1);if(e.team===0){spUsed++;quest('sp')}
 const foes=ents.filter(t=>t.team!==e.team&&!t.dead);const near=(r)=>foes.filter(t=>t.pos.distanceTo(e.pos)<r);
 switch(e.id){
 case'knight':e.charge=.45;e.inv=.45;Audio.dash();ring(e.pos,2,0x6aa8ff);break;
 case'rogue':{let n=foes.sort((a,b)=>a.pos.distanceTo(e.pos)-b.pos.distanceTo(e.pos))[0];if(n){burst(e.pos.clone().setY(1),0x4dff9a,20,4,.5);const back=new THREE.Vector3(Math.sin(n.face),0,Math.cos(n.face));e.pos.copy(n.pos).addScaledVector(back,-1.2);clampIn(e);e.face=Math.atan2(n.pos.x-e.pos.x,n.pos.z-e.pos.z);burst(e.pos.clone().setY(1),0x4dff9a,20,4,.5);Audio.zap();damage(n,e.dmg*1.6,e,8,true);setTimeout(()=>!n.dead&&damage(n,e.dmg*1.2,e,10),180)}break}
 case'wolf':e.frenzy=5;ring(e.pos,3,0xff3a3a,.6);Audio.boom();burst(e.pos.clone().setY(1),0xff3a3a,24,5,.6);break;
 case'minotaur':ring(e.pos,6,0xffaa5a,.5);Audio.boom();shake=.5;burst(e.pos.clone().setY(.3),0xc9a070,30,8,.6,.5,2);near(5.5*e.sc).forEach(t=>{damage(t,e.dmg*1.4,e,16);t.stun=.8});break;
 case'golem':ring(e.pos,5,0xff5a10,.6);Audio.boom();shake=.45;burst(e.pos.clone().setY(.5),0xff5a10,40,7,.8,.5,5);near(4.6*e.sc).forEach(t=>{damage(t,e.dmg*1.7,e,10);t.stun=1.4});break;
 case'lich':Audio.zap();for(let i=0;i<10;i++){const a=i/10*Math.PI*2;bolts.push(newBolt(e,a))}break}
 return true}
const bolts=[];const boltMat=new THREE.SpriteMaterial({map:GLOW,color:0xc08aff,blending:THREE.AdditiveBlending,depthWrite:false});
function newBolt(e,a){const s=new THREE.Sprite(boltMat);s.scale.setScalar(.9);s.position.set(e.pos.x,1.1,e.pos.z);fxGroup.add(s);return{s,o:e,vx:Math.sin(a)*9,vz:Math.cos(a)*9,l:1.6}}
function dash(e){if(e.dashCd>0||e.stun>0||e.dead||e.falling)return;e.dashCd=1.1;e.inv=.25;const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x+=fx*17;e.vel.z+=fz*17;Audio.dash();burst(e.pos.clone().setY(.4),0xffffff,8,2,.3,.3,1)}
function clampIn(e){const d=Math.hypot(e.pos.x,e.pos.z);if(d>R-.5){e.pos.x*=(R-.5)/d;e.pos.z*=(R-.5)/d}}
// ================= INPUT =================
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(state==='play'){if(e.code==='KeyJ'||e.code==='Space')attack(player);if(e.code==='KeyK'||e.code==='KeyE')special(player);if(e.code==='KeyL'||e.code==='ShiftLeft')dash(player);if(e.code==='Escape'||e.code==='KeyP')pause()}if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
canvas.addEventListener('mousedown',e=>{if(state==='play'&&matchMedia('(pointer:fine)').matches){if(e.button===0)attack(player);if(e.button===2)special(player)}});canvas.addEventListener('contextmenu',e=>e.preventDefault());
const joy=document.getElementById('joy'),knob=document.getElementById('knob');let jv={x:0,y:0},jid=null;
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;jv={x:0,y:0};knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
function jmove(e){const r=joy.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jv={x,y};knob.style.transform=`translate(${x*45}px,${y*45}px)`}
const btnBind=(id,f)=>{const b=document.getElementById(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();state==='play'&&f()})};
let atkHeld=false;btnBind('atkB',()=>{attack(player);atkHeld=true});document.getElementById('atkB').addEventListener('pointerup',()=>atkHeld=false);document.getElementById('atkB').addEventListener('pointerleave',()=>atkHeld=false);
btnBind('spB',()=>special(player));btnBind('dashB',()=>dash(player));document.getElementById('pauseB').onclick=()=>pause();
// ================= BATTLE FLOW =================
const $=id=>document.getElementById(id);const hud=$('hud');
function setupStage(){clearEnts();bolts.forEach(b=>fxGroup.remove(b.s));bolts.length=0;
 const ph=S.hero;player=makeEnt(ph,0,{tint:SKINS[S.skin[ph]||0].c});player.pos.set(0,0,3);player.face=Math.PI;
 $('hname').textContent=player.h.name.toUpperCase()+' — '+player.h.title;kos=0;dmgTaken=0;spUsed=0;time=0;revived=false;wave=0;spawnWave()}
function enemyPool(w){const all=HEROES.map(h=>h.id);return all.filter(i=>i!==S.hero)}
function spawnWave(){wave++;let list=[];
 if(mode==='camp'){const w=stageW,n=stageN;const diff=1+(w*STAGES_PER+n)*.07;
  if(n===STAGES_PER-1){const b=WORLDS[w].boss;const e=makeEnt(b,1,{scale:1.75,boss:true,mult:diff*1.15,hpm:4.5,tint:w===4?0x5a2020:0xff8a6a});bossE=e;placeAt(e,0,-4);showBoss(e);
   for(let i=0;i<Math.min(2,w);i++)list.push([enemyPool(w)[(i+w)%5],diff*.8])}
  else{const cnt=Math.min(6,2+Math.floor(n/2)+Math.floor(w/2)+(wave-1));const pool=enemyPool(w);for(let i=0;i<cnt;i++)list.push([pool[(i+n+w)%pool.length],diff])}}
 else{const cnt=Math.min(8,1+wave);const pool=enemyPool(0);const diff=1+wave*.12;for(let i=0;i<cnt;i++)list.push([pool[(Math.random()*pool.length)|0],diff]);if(wave%5===0){const e=makeEnt(pool[(wave/5)%pool.length|0],1,{scale:1.6,boss:true,mult:diff,hpm:3.5,tint:0xff8a6a});bossE=e;placeAt(e,0,-4);showBoss(e)}}
 list.forEach(([id,m],i)=>{const e=makeEnt(id,1,{mult:m,tint:0x9a8a8a});const a=i/list.length*Math.PI*2+Math.random();placeAt(e,Math.cos(a)*(R-2),Math.sin(a)*(R-2))});
 banner(mode==='gaunt'?'WAVE '+wave:(stageN===STAGES_PER-1?'BOSS':waves>1?'WAVE '+wave+'/'+waves:'FIGHT'));}
function placeAt(e,x,z){e.pos.set(x,0,z);e.face=Math.atan2(-x,-z);e.inv=1;e.root.position.copy(e.pos);ring(e.pos,2,0xff5a3a,.6);burst(e.pos.clone().setY(1),0xff5a3a,14,3,.6)}
function showBoss(e){const d=document.createElement('div');d.id='bossbar';d.innerHTML=`<div id="bossn">${mode==='camp'?WORLDS[stageW].bossN.toUpperCase():'CHAMPION '+e.h.name.toUpperCase()}</div><div class="bar"><div id="bossfill"></div></div>`;hud.appendChild(d)}
let bannerT=0;function banner(t){const b=$('banner');b.textContent=t;b.style.opacity=1;bannerT=1.4}
function startBattle(m,w,n){mode=m;stageW=w;stageN=n;waves=m==='camp'&&n>=4&&n<STAGES_PER-1?2:1;fade(()=>{buildArena(m==='camp'?w:(Math.random()*5)|0,m!=='camp');setupStage();showScreen(null);hud.classList.remove('hide');state='play';gpStart();Audio.intense=true;
 $('stageinfo').textContent=m==='camp'?WORLDS[w].n.toUpperCase()+'  ·  '+(w+1)+'-'+(n+1):'THE GAUNTLET'})}
function fade(cb){const f=$('fade');f.style.opacity=1;setTimeout(()=>{cb();f.style.opacity=0},360)}
function endBattle(win){if(state!=='play')return;state='end';gpStop();Audio.intense=false;
 if(!win&&!revived){showRevive();return}finish(win)}
function finish(win){hud.classList.add('hide');let coins=0,stars=0,gems=0;
 if(mode==='camp'){if(win){const hpP=player.hp/player.max,par=45+stageN*6+(stageN===STAGES_PER-1?40:0);stars=1+(hpP>=.5?1:0)+(time<=par?1:0);coins=Math.round((60+stageW*40+stageN*12)*(stageN===STAGES_PER-1?3:1));
   const k=stageW+'-'+stageN,prev=S.stars[k]||0;if(stars>prev){S.trophy+=(stars-prev)*10;S.stars[k]=stars}if(stars===3)quest('star3');S.wins++;quest('win');S.trophy+=2;
   if(stageN===STAGES_PER-1){quest('boss');gems+=15;const b=WORLDS[stageW].boss;let unlock=null;if(!S.owned[b]){S.owned[b]=1;unlock=b}if(stageW>=S.maxW)S.maxW=Math.min(4,stageW+1);happy();if(unlock)setTimeout(()=>toastModal('NEW CHAMPION','<b>'+HEROES[HI[unlock]].name+', '+HEROES[HI[unlock]].title+'</b> now fights for you.'),600)}
  }else coins=Math.round(kos*8)}
 else{coins=Math.round((wave-1)*35+kos*6);if(wave-1>S.best){S.best=wave-1}quest('gaunt',wave-1);if(wave>2)S.trophy+=wave-1}
 S.coins+=coins;S.gems+=gems;save();if(win)Audio.win();else Audio.lose();showResult(win,stars,coins,gems)}
function showRevive(){revived=true;showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:420px"><h2>YOU HAVE FALLEN</h2><p>The arena is not done with you yet.</p>
 <button class="btn v" id="rv">📺 Rise Again (Ad)</button><button class="btn" id="rn">Give Up</button></div></div>`);
 $('rv').onclick=()=>ad('rewarded',()=>{showScreen(null);player.dead=0;player.falling=0;player.hp=player.max*.6;player.pos.set(0,0,0);player.vel.set(0,0,0);player.inv=2;player.root.visible=true;ring(player.pos,6,0xffd36a,.8);ents.filter(e=>e.team&&!e.dead).forEach(e=>{damage(e,0,player,14)});state='play';gpStart();Audio.intense=true},()=>toastModal('No ad available','Try again later.'));
 $('rn').onclick=()=>finish(false)}
function showResult(win,stars,coins,gems){let st='';for(let i=0;i<3;i++)st+=`<span class="${i<stars?'on':''}">★</span>`;
 const next=mode==='camp'&&win&&stageN<STAGES_PER-1;const nextW=mode==='camp'&&win&&stageN===STAGES_PER-1&&stageW<4;
 showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:460px"><h2>${win?'VICTORY':mode==='gaunt'?'THE GAUNTLET ENDS':'DEFEAT'}</h2>
 ${mode==='camp'&&win?`<div class="stars">${st}</div><p style="color:#9a8a70;font-size:13px">★ Win &nbsp; ★ Keep 50% health &nbsp; ★ Finish fast</p>`:''}
 ${mode==='gaunt'?`<p>Waves survived: <b>${wave-1}</b> &nbsp; Best: <b>${S.best}</b></p>`:''}
 <p style="font:bold 22px Arial;color:#ffd36a">+${coins} 🪙 ${gems?`&nbsp; <span style="color:#b9a6ff">+${gems} 💎</span>`:''}</p>
 ${coins>0?'<button class="btn v" id="dbl">📺 Double Reward</button>':''}
 ${next?'<button class="btn g" id="nx">Next Stage</button>':''}${nextW?'<button class="btn g" id="nx">Next World</button>':''}
 ${!win||mode==='gaunt'?'<button class="btn g" id="rt">Try Again</button>':''}<button class="btn" id="hm">Back</button></div></div>`);
 const d=$('dbl');if(d)d.onclick=()=>ad('rewarded',()=>{S.coins+=coins;save();Audio.coin();d.remove()});
 const afterAd=f=>()=>{ad('midgame',f)};
 if($('nx'))$('nx').onclick=afterAd(()=>{if(nextW){showStory(stageW+1,()=>startBattle('camp',stageW+1,0))}else startBattle('camp',stageW,stageN+1)});
 if($('rt'))$('rt').onclick=afterAd(()=>startBattle(mode,stageW,stageN));
 $('hm').onclick=()=>{cleanupBattle();mode==='camp'?campaign(stageW):mainMenu()}}
function cleanupBattle(){clearEnts();state='menu';hud.classList.add('hide');gpStop();setupMenuScene()}
function pause(){if(state!=='play')return;state='pause';gpStop();showScreen(`<div class="scr dim"><div class="panel" style="text-align:center;max-width:380px"><h2>PAUSED</h2><button class="btn g" id="rs">Resume</button><button class="btn" id="snd">${S.music?'Music: On':'Music: Off'}</button><button class="btn" id="qt">Leave Battle</button></div></div>`);
 $('rs').onclick=()=>{showScreen(null);state='play';gpStart()};$('snd').onclick=()=>{toggleMusic();$('snd').textContent=S.music?'Music: On':'Music: Off'};$('qt').onclick=()=>{cleanupBattle();mainMenu()}}
function toggleMusic(){S.music=S.music?0:1;Audio.mv&&(Audio.mv.gain.value=S.music?.32:0);save()}
// ================= UPDATE =================
const camPos=new THREE.Vector3(0,14,12),camLook=new THREE.Vector3();
function updateBattle(dt){time+=dt;$('timer').textContent=fmtT(time);
 const W=mode==='camp'?WORLDS[stageW]:null;const ice=W&&W.hz==='ice';
 // player input
 if(player&&!player.dead&&!player.falling){let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,mz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.y;const l=Math.hypot(mx,mz);
  if(l>.1&&player.stun<=0&&player.charge<=0){mx/=Math.max(1,l);mz/=Math.max(1,l);const acc=ice?.25:1;player.vel.x+=(mx*player.spd-player.vel.x)*Math.min(1,dt*12*acc);player.vel.z+=(mz*player.spd-player.vel.z)*Math.min(1,dt*12*acc);player.face=lerpAng(player.face,Math.atan2(mx,mz),dt*14)}
  if(atkHeld)attack(player);
  // auto-aim facing when attacking near enemy
 }
 // AI
 ents.forEach(e=>{if(e.team===0||e.dead||e.falling)return;e.ai.t-=dt;const p=player;if(!p||p.dead){return}
  tmp.subVectors(p.pos,e.pos);tmp.y=0;const d=tmp.length();const want=Math.atan2(tmp.x,tmp.z);e.face=lerpAng(e.face,want,dt*6);
  if(e.stun>0||e.charge>0)return;const rng=e.h.range*e.sc+.2;
  if(e.wind>0){e.wind-=dt;if(e.wind<=0)attack(e);return}
  let mx=0,mz=0;if(d>rng*.85){mx=tmp.x/d;mz=tmp.z/d}else{mx=-tmp.z/d*e.ai.strafe*.4;mz=tmp.x/d*e.ai.strafe*.4;if(e.atkCd<=0&&Math.random()<dt*3){e.wind=e.boss?.45:.35;e.flash=-.35}}
  // separation
  ents.forEach(o=>{if(o!==e&&!o.dead&&o.team===1){const dx=e.pos.x-o.pos.x,dz=e.pos.z-o.pos.z,dd=dx*dx+dz*dz;if(dd<1.6&&dd>0){mx+=dx/dd*.5;mz+=dz/dd*.5}}});
  // avoid edge
  const ed=Math.hypot(e.pos.x,e.pos.z);if(ed>R-1.5){mx-=e.pos.x/ed*1.2;mz-=e.pos.z/ed*1.2}
  const acc=ice?.3:1;e.vel.x+=(mx*e.spd-e.vel.x)*Math.min(1,dt*8*acc);e.vel.z+=(mz*e.spd-e.vel.z)*Math.min(1,dt*8*acc);
  if(e.spCd<=0&&d<(e.id==='lich'?8:e.id==='rogue'?9:4.5)&&Math.random()<dt*1.5)special(e);
  if(e.dashCd<=0&&d>5&&Math.random()<dt*.4)dash(e)});
 // physics
 ents.forEach(e=>{if(e.dead){e.squash=0;return}
  e.atkCd-=dt;e.spCd-=dt;e.dashCd-=dt;e.stun-=dt;e.inv-=dt;e.frenzy-=dt;
  if(e.charge>0){e.charge-=dt;const fx=Math.sin(e.face),fz=Math.cos(e.face);e.vel.x=fx*16;e.vel.z=fz*16;ents.forEach(t=>{if(t.team!==e.team&&!t.dead&&t.pos.distanceTo(e.pos)<1.4*t.sc+.4&&!t._ch){t._ch=1;damage(t,e.dmg*1.3,e,18);t.stun=.6;setTimeout(()=>t._ch=0,500)}});if(Math.random()<.6)burst(e.pos.clone().setY(.6),0x6aa8ff,2,1,.3)}
  if(e.frenzy>0&&Math.random()<.3)burst(e.pos.clone().setY(1.2),0xff3a3a,1,1,.4,.25);
  const fr=ice?1.2:7;if(e.falling===0){e.vel.x*=Math.max(0,1-dt*fr*(e.stun>0?.5:1)*.6);e.vel.z*=Math.max(0,1-dt*fr*(e.stun>0?.5:1)*.6)}
  e.pos.x+=e.vel.x*dt;e.pos.z+=e.vel.z*dt;
  const dd=Math.hypot(e.pos.x,e.pos.z);if(!e.falling&&dd>R+.1){e.falling=1;e.vel.y=2;if(e.bar){e.bar.remove();e.bar=null}}
  if(e.falling){e.vel.y-=25*dt;e.pos.y+=e.vel.y*dt;if(e.pos.y<-14&&!e.dead){e.dead=1;e.root.visible=false;if(e.team){kos++;quest('ko')}if(e===player)setTimeout(()=>endBattle(false),400);else{ring(new THREE.Vector3(e.pos.x*.9,0,e.pos.z*.9),2,0xffffff,.4)}}}
 });
 // body collisions
 for(let i=0;i<ents.length;i++)for(let j=i+1;j<ents.length;j++){const a=ents[i],b=ents[j];if(a.dead||b.dead||a.falling||b.falling)continue;const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z,d=Math.hypot(dx,dz),m=.55*(a.sc+b.sc);if(d<m&&d>0){const p=(m-d)/2;a.pos.x-=dx/d*p;a.pos.z-=dz/d*p;b.pos.x+=dx/d*p;b.pos.z+=dz/d*p}}
 // bolts
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.l-=dt;const tg=ents.filter(t=>t.team!==b.o.team&&!t.dead)[0];if(tg){const dx=tg.pos.x-b.s.position.x,dz=tg.pos.z-b.s.position.z,d=Math.hypot(dx,dz);b.vx+=dx/d*dt*14;b.vz+=dz/d*dt*14}
  b.s.position.x+=b.vx*dt;b.s.position.z+=b.vz*dt;let hit=false;ents.forEach(t=>{if(!hit&&t.team!==b.o.team&&!t.dead&&Math.hypot(t.pos.x-b.s.position.x,t.pos.z-b.s.position.z)<.8*t.sc){damage(t,b.o.dmg*.7,b.o,4);hit=true}});
  if(hit||b.l<=0){burst(b.s.position,0xc08aff,6,3,.3);fxGroup.remove(b.s);bolts.splice(i,1)}}
 updateHazards(dt,W);
 // win check
 const foes=ents.filter(e=>e.team&&!e.dead);if(player&&!player.dead&&foes.length===0&&state==='play'){
  if(mode==='gaunt'){S.coins+=10;spawnWave();player.hp=Math.min(player.max,player.hp+player.max*.15)}else if(wave<waves){spawnWave()}else{state='wait';setTimeout(()=>{state='play';endBattle(true)},900);banner('VICTORY');}}
 // HUD
 if(player){$('hpbar').style.width=Math.max(0,player.hp/player.max*100)+'%';const c=Math.max(0,player.spCd/player.h.cd);$('spCd').style.height=(c*100)+'%'}
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
function animEnts(dt,T){ents.forEach(e=>{const r=e.root;if(e.dead&&!e.falling){r.scale.multiplyScalar(Math.max(0,1-dt*5));if(r.scale.x<.02)r.visible=false;r.position.y-=dt*.5;return}
  r.position.set(e.pos.x,e.pos.y,e.pos.z);r.rotation.y=e.face;const sp=Math.hypot(e.vel.x,e.vel.z);
  const run=Math.min(1,sp/6),ph=T*11+e.ai.t*9;
  e.squash+= (0-e.squash)*Math.min(1,dt*10);const sq=e.squash;
  e.body.position.y=Math.abs(Math.sin(ph))*.14*run+Math.sin(T*2+e.ai.t*7)*.02;
  e.body.scale.set(1+sq*.5,1-sq+Math.sin(T*2.2+e.ai.t)*.012,1+sq*.5);
  e.body.rotation.x=run*.18+(e.wind>0?-.25:0)+(e.charge>0?.35:0);e.body.rotation.z=Math.sin(ph)*.07*run;
  const fl=e.flash>0?e.flash/.15:0;e.flash-=dt;
  if(e.flash>0)e.mat.emissive.setRGB(fl*1.2,fl*1.0,fl*.9);else if(e.wind>0)e.mat.emissive.setRGB(.6*Math.abs(Math.sin(T*30)),0,0);else if(e.frenzy>0)e.mat.emissive.setRGB(.35,0,0);else if(e.stun>0)e.mat.emissive.setRGB(.15,.15,.3);else if(e.inv>0&&e.team===0)e.mat.emissive.setRGB(.1,.1,.15);else e.mat.emissive.setRGB(0,0,0);
  if(e.bar){v2.set(e.pos.x,e.pos.y+2.3*e.sc,e.pos.z).project(camera);e.bar.style.left=(v2.x*.5+.5)*innerWidth+'px';e.bar.style.top=(-v2.y*.5+.5)*innerHeight+'px';e.bar.firstChild.style.width=Math.max(0,e.hp/e.max*100)+'%'}})}
// ================= MENU SCENE =================
let menuChar=null;
function setupMenuScene(){clearEnts();buildArena(Math.min(S.maxW,4),false);menuChar=makeEnt(S.hero,0,{tint:SKINS[S.skin[S.hero]||0].c});menuChar.pos.set(0,0,0);menuChar.face=0}
// ================= UI SCREENS =================
const scr=$('screens');
function showScreen(html){scr.innerHTML=html||'';scr.querySelectorAll('.btn,.tab,.st,.hc').forEach(b=>b.addEventListener('click',()=>Audio.click()))}
const cur=()=>`<div class="cur">🪙 ${S.coins} <b>💎 ${S.gems}</b> 🏆 ${S.trophy}</div>`;
function dot(b){return b?' <span style="color:#ff5a3a">●</span>':''}
function mainMenu(){state='menu';rollQuests();const dl=S.dl.last!==today();const qr=S.day.q.some(q=>!q.c&&q.p>=q.n);const tr=TROPHY[S.trClaim]&&S.trophy>=TROPHY[S.trClaim][0];
 showScreen(`<div class="scr" style="justify-content:flex-start;padding-top:6vh">${cur()}<h1 class="title">ARENA<br><span style="font-size:.6em">OF TITANS</span></h1><div class="sub">FIVE ARENAS · ONE OATH</div>
 <div style="margin-top:auto;margin-bottom:4vh"><button class="btn g" id="bc">⚔ Campaign</button><button class="btn" id="bg">☠ The Gauntlet</button><button class="btn" id="bh">Champions</button>
 <div style="text-align:center"><button class="btn s" id="bd">🎁 Daily${dot(dl)}</button><button class="btn s" id="bq">📜 Quests${dot(qr)}</button><button class="btn s" id="bt">🏆 Trophy Road${dot(tr)}</button><button class="btn s" id="bm">${S.music?'♪ On':'♪ Off'}</button></div></div></div>`);
 $('bc').onclick=()=>{const w=S.maxW;if(!S.seen['w0']){showStory(0,()=>campaign(0))}else campaign(Math.min(w,4))};
 $('bg').onclick=()=>startBattle('gaunt',0,0);$('bh').onclick=()=>heroes(S.hero);$('bd').onclick=daily;$('bq').onclick=quests;$('bt').onclick=trophy;$('bm').onclick=()=>{toggleMusic();mainMenu()};
 if(dl&&!S._shownDaily){S._shownDaily=1;setTimeout(daily,500)}}
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
 let list=HEROES.map(x=>`<div class="hc ${x.id===sel?'on':''} ${S.owned[x.id]?'':'lk'}" data-h="${x.id}">${S.owned[x.id]?'':'🔒'}<b>${x.name}</b></div>`).join('');
 let skins=SKINS.map((s,i)=>{const have=i===0||(S.skins[sel]||[]).includes(i);const on=(S.skin[sel]||0)===i;return `<button class="btn s ${on?'g':''}" data-s="${i}" style="${s.c?'border-color:#'+s.c.toString(16).padStart(6,'0'):''}">${s.n}${have?'':' 💎'+s.g}</button>`}).join('');
 const lockTxt=own?'':h.cost?`<button class="btn g" id="buy">Unlock · 🪙 ${h.cost}</button>`:`<p style="color:#ff9b7a">Defeat ${h.name} as the boss of ${WORLDS[h.boss].n} to unlock.</p>`;
 showScreen(`<div class="scr dim" style="justify-content:flex-end;background:linear-gradient(#0000 30%,#000d 60%)">${cur()}<div class="panel" style="max-height:46vh"><div class="hl">${list}</div>
 <div class="hero"><div class="info"><h2 style="text-align:left;margin:0">${h.name.toUpperCase()}</h2><div style="color:#b7a58a;font-style:italic">${h.title}</div>
 <p style="margin:8px 0">❤ ${Math.round(h.hp*(1+.1*l.v))} &nbsp; ⚔ ${Math.round(h.dmg*(1+.1*l.p))} &nbsp; 👟 ${h.spd}</p><p style="margin:6px 0"><b style="color:#b9a6ff">✦ ${h.sp}</b> — ${h.spd2}</p></div>
 <div class="info">${own?`<div class="row">Power Lv ${l.p}<button class="btn s ${S.coins<cp||l.p>=10?'off':''}" id="up">${l.p>=10?'MAX':'🪙 '+cp}</button></div><div class="row">Vitality Lv ${l.v}<button class="btn s ${S.coins<cv||l.v>=10?'off':''}" id="uv">${l.v>=10?'MAX':'🪙 '+cv}</button></div>
 ${S.hero===sel?'<p style="text-align:center;color:#8ad98a">✔ Selected</p>':'<button class="btn g" id="sel">Select</button>'}`:lockTxt}</div></div>
 ${own?`<div style="text-align:center;margin-top:8px">${skins}</div>`:''}<button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('.hc').forEach(c=>c.onclick=()=>heroes(c.dataset.h));$('bk').onclick=()=>{setMenuHero(S.hero);mainMenu()};
 const B=(id,f)=>$(id)&&($(id).onclick=f);
 B('buy',()=>{if(S.coins>=h.cost){S.coins-=h.cost;S.owned[sel]=1;save();Audio.win();happy();heroes(sel)}});
 B('up',()=>{if(S.coins>=cp&&l.p<10){S.coins-=cp;S.lv[sel]={...l,p:l.p+1};save();Audio.coin();heroes(sel)}});
 B('uv',()=>{if(S.coins>=cv&&l.v<10){S.coins-=cv;S.lv[sel]={...l,v:l.v+1};save();Audio.coin();heroes(sel)}});
 B('sel',()=>{S.hero=sel;save();heroes(sel)});
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
function trophy(){const rows=TROPHY.map((t,i)=>{const got=i<S.trClaim,can=!got&&i===S.trClaim&&S.trophy>=t[0];const rw=t[1]==='coins'?'🪙 '+t[2]:t[1]==='gems'?'💎 '+t[2]:'🎨 Random skin';
  return `<div class="row" style="${got?'opacity:.5':''}"><div>🏆 ${t[0]}</div><div style="flex:1;text-align:center">${rw}</div>${got?'✔':`<button class="btn s ${can?'g':'off'}" data-t="${i}">${can?'Claim':'Locked'}</button>`}</div>`}).join('');
 showScreen(`<div class="scr dim">${cur()}<div class="panel" style="max-width:520px"><h2>TROPHY ROAD</h2><p style="text-align:center;color:#b7a58a">Earn trophies from stars, victories, quests and the Gauntlet.</p>${rows}<button class="btn" id="bk">Back</button></div></div>`);
 scr.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const i=+b.dataset.t,t=TROPHY[i];if(i!==S.trClaim||S.trophy<t[0])return;if(t[1]==='coins')S.coins+=t[2];else if(t[1]==='gems')S.gems+=t[2];else{const h=S.hero;const a=(S.skins[h]=S.skins[h]||[]);const opts=[1,2,3,4].filter(x=>!a.includes(x));if(opts.length)a.push(opts[0]);else S.gems+=40}S.trClaim++;save();Audio.win();happy();trophy()});$('bk').onclick=mainMenu}
function toastModal(t,b){const d=document.createElement('div');d.className='scr dim';d.style.zIndex=9;d.innerHTML=`<div class="panel" style="max-width:400px;text-align:center"><h2>${t}</h2><p>${b}</p><button class="btn g">OK</button></div>`;document.body.appendChild(d);d.querySelector('button').onclick=()=>d.remove()}
// ================= LOOP =================
let last=performance.now(),T=0;
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
 if(hitstop>0){hitstop-=dt;dt*=.1}
 if(state==='play')updateBattle(dt);
 animEnts(dt,T);
 // camera
 if((state==='play'||state==='wait'||state==='end'||state==='pause')&&player){const asp=camera.aspect;const back=asp<1?12:8.5,hgt=asp<1?14:10.5;camLook.lerp(v2.set(player.pos.x*.6,0,player.pos.z*.6),Math.min(1,dt*4));camPos.lerp(v2.set(camLook.x,hgt,camLook.z+back),Math.min(1,dt*4))}
 else{const a=T*.15;camLook.lerp(v2.set(0,1.1,0),.1);camPos.lerp(v2.set(Math.sin(a)*4.5,2.2,Math.cos(a)*4.5+0),.05);if(menuChar)menuChar.face=Math.sin(T*.3)*.4+Math.atan2(camPos.x,camPos.z)}
 camera.position.copy(camPos);if(shake>0){shake-=dt;camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake}camera.lookAt(camLook);
 sun.position.set(camLook.x+8,18,camLook.z+6);sun.target.position.copy(camLook);
 // fx
 for(let i=sparks.length-1;i>=0;i--){const s=sparks[i],u=s.userData;u.l-=dt;if(u.l<=0){s.visible=false;sparks.splice(i,1);sparkPool.push(s);continue}u.vy-=9*dt;s.position.x+=u.vx*dt;s.position.y+=u.vy*dt;s.position.z+=u.vz*dt;const k=u.l/u.L;s.scale.setScalar(u.sz*(.4+k));s.material.opacity=k}
 for(let i=rings.length-1;i>=0;i--){const m=rings[i],u=m.userData;u.l-=dt;const k=1-u.l/u.L;if(!u.sl)m.scale.setScalar(.2+k*u.r);m.material.opacity=(1-k)*.9;if(u.l<=0){fxGroup.remove(m);m.material.dispose();if(!u.sl)m.geometry.dispose();rings.splice(i,1)}}
 for(let i=dmgs.length-1;i>=0;i--){const d=dmgs[i];d._t-=dt;d._p.y+=dt*1.5;v2.copy(d._p).project(camera);d.style.left=(v2.x*.5+.5)*innerWidth+'px';d.style.top=(-v2.y*.5+.5)*innerHeight+'px';d.style.opacity=Math.min(1,d._t*3);if(d._t<=0){d.remove();dmgs.splice(i,1)}}
 if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').style.opacity=0}
 if(ambient){const p=ambient.geometry.attributes.position,k=ambient.userData.k;for(let i=0;i<p.count;i++){let y=p.getY(i);y+=k==='ember'?dt*1.2:k==='wisp'?dt*.3:k==='rain'?-dt*18:-dt*1.5;if(y>14)y=-2;if(y<-2)y=14;p.setY(i,y)}p.needsUpdate=true}
 if(arena)arena.children.forEach(o=>{if(o.userData.flick!==undefined){o.scale.setScalar(1.5+Math.sin(T*13+o.userData.flick)*.15+Math.random()*.1)}else if(o.userData.bob!==undefined){o.position.y+=Math.sin(T+o.userData.bob)*dt*.2;o.rotation.y+=dt*.05}});
 skyMat.uniforms.t.value=T;
 if(flashT>0){flashT-=dt;renderer.toneMappingExposure=1.15+flashT*12}else renderer.toneMappingExposure=1.15;
 renderer.render(scene,camera)}
// ================= BOOT =================
(async()=>{showScreen('<div class="scr"><h1 class="title">ARENA<br><span style="font-size:.6em">OF TITANS</span></h1><div class="sub" id="ld">AWAKENING THE TITANS…</div></div>');
 try{SDK||await Promise.race([sdkReady,new Promise(r=>setTimeout(r,2500))]);SDK&&SDK.game.loadingStart&&SDK.game.loadingStart()}catch(e){}
 await loadModels();setupMenuScene();try{SDK&&SDK.game.loadingStop&&SDK.game.loadingStop()}catch(e){}requestAnimationFrame(frame);mainMenu()})();
addEventListener('visibilitychange',()=>{if(document.hidden){save();if(state==='play')pause()}});
window.__G={get S(){return S},get ents(){return ents},get state(){return state},startBattle,get player(){return player}};
