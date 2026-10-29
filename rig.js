// Skeletal rig + combat animation clips for the Hunyuan3D heroes.
import * as THREE from 'three';
const BN=['hips','spine','chest','neck','head','uaL','faL','hdL','uaR','faR','hdR','thL','shL','ftL','thR','shR','ftR'];
const PAR=[-1,0,1,2,3,2,5,6,2,8,9,0,11,12,0,14,15];
const cache={};
function pct(a,p){if(!a.length)return 0;a.sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(a.length*p))]}
function joints(pos){const sh=[],hd=[];for(let i=0;i<pos.count;i++){const y=pos.getY(i),x=Math.abs(pos.getX(i));if(y>1.3&&y<1.45)sh.push(x);if(y>.85&&y<1.0)hd.push(x)}
 const sx=Math.min(.3,Math.max(.15,pct(sh,.85)*.72));const hx=Math.min(sx+.28,Math.max(sx,pct(hd,.92)-.06));
 const J={};const s=(n,x,y,z)=>J[n]=new THREE.Vector3(x,y,z);
 s('hips',0,.92,0);s('spine',0,1.1,0);s('chest',0,1.3,0);s('neck',0,1.5,0);s('head',0,1.6,0);s('top',0,1.85,0);
 for(const [k,sg] of [['L',1],['R',-1]]){s('ua'+k,sg*sx,1.42,0);s('fa'+k,sg*(sx+(hx-sx)*.55),1.14,-.02);s('hd'+k,sg*hx,.9,.04);s('hdE'+k,sg*hx,.78,.05);
  s('th'+k,sg*.11,.9,0);s('sh'+k,sg*.12,.5,.02);s('ft'+k,sg*.13,.09,0);s('ftE'+k,sg*.13,.04,.16)}
 return {J,sx}}
function segOf(J,n){const nx={hips:'spine',spine:'chest',chest:'neck',neck:'head',head:'top',uaL:'faL',faL:'hdL',hdL:'hdEL',uaR:'faR',faR:'hdR',hdR:'hdER',thL:'shL',shL:'ftL',ftL:'ftEL',thR:'shR',shR:'ftR',ftR:'ftER'}[n];return [J[n],J[nx]]}
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_p=new THREE.Vector3();
function dseg(p,a,b){_b.subVectors(b,a);const t=Math.max(0,Math.min(1,_a.subVectors(p,a).dot(_b)/_b.lengthSq()));return _p.copy(a).addScaledVector(_b,t).distanceTo(p)}
export function rigGeometry(id,geo){if(cache[id])return cache[id];const g=geo.clone(),pos=g.attributes.position,n=pos.count;const {J,sx}=joints(pos);
 const segs=BN.map(b=>segOf(J,b));const si=new Uint16Array(n*4),sw=new Float32Array(n*4);const p=new THREE.Vector3();const w=new Float32Array(BN.length);
 // per-slice torso/arm boundary from x-gaps
 const NS=20,y0=.8,y1=1.48,bnd={L:new Float32Array(NS),R:new Float32Array(NS)};
 for(const [k,sg] of [['L',1],['R',-1]])for(let s2=0;s2<NS;s2++){const ya=y0+(y1-y0)*s2/NS,yb=ya+(y1-y0)/NS+.02;const xs=[];for(let i=0;i<n;i++){const y=pos.getY(i),x=pos.getX(i)*sg,z=pos.getZ(i);if(y>=ya&&y<yb&&x>0&&Math.abs(z)<.22)xs.push(x)}xs.sort((u,v)=>u-v);
  let best=0,at=sx*.78;for(let j=1;j<xs.length;j++){const gp=xs[j]-xs[j-1];if(xs[j-1]>.08&&xs[j]<sx+.3&&gp>best){best=gp;at=(xs[j]+xs[j-1])/2}}bnd[k][s2]=best>.015?at:sx*.8}
 const bOf=(k,y)=>{if(y>=y1)return sx*.6;const i=Math.max(0,Math.min(NS-1,Math.floor((y-y0)/(y1-y0)*NS)));return bnd[k][i]};
 for(let i=0;i<n;i++){p.fromBufferAttribute(pos,i);const x=p.x,y=p.y,z=p.z;
  for(let b=0;b<BN.length;b++){const nm=BN[b];let d=dseg(p,segs[b][0],segs[b][1]);let m=1;
   if(nm[0]==='u'||nm[0]==='f'&&nm[1]==='a'||nm[0]==='h'&&nm[1]==='d'){const k=nm.endsWith('L')?'L':'R',sg=k==='L'?1:-1;const xx=x*sg;
    if(y<.76||y>1.6||d>.2||z<-.25)m=0;else{const bd=bOf(k,y);const e=(xx-bd)/.025;m=e<=-1?0:e>=1?1:(e+1)/2;if(y>1.36)m=Math.max(m,Math.min(1,(xx-sx*.55)/.08))}}
   if(nm.startsWith('th')||nm.startsWith('sh')||nm.startsWith('ft')){const side=nm.endsWith('L')?1:-1;if(y>1.0)m=0;else if(x*side<-.05)m=0;else if(x*side<.03)d*=1.4}
   w[b]=m>0?m/Math.pow(d*d+4e-4,2):0}
  const idx=[...w.keys()].sort((a,b)=>w[b]-w[a]).slice(0,4);let tot=0;idx.forEach(k=>tot+=w[k]);
  idx.forEach((k,j)=>{si[i*4+j]=k;sw[i*4+j]=tot>0?w[k]/tot:(j?0:1)})}
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));
 // tear fused arm/torso seams below the shoulder: drop triangles spanning arm and non-arm verts
 const armW=new Float32Array(n);for(let i=0;i<n;i++){let a2=0;for(let j=0;j<4;j++){const k=si[i*4+j];if(k>=5&&k<=10)a2+=sw[i*4+j]}armW[i]=a2}
 const idx=g.index?g.index.array:null;if(idx){const keep=[];for(let t=0;t<idx.length;t+=3){const A=idx[t],B=idx[t+1],C=idx[t+2];const ws=[armW[A],armW[B],armW[C]];const mx=Math.max(...ws),mn=Math.min(...ws);const ylo=Math.min(pos.getY(A),pos.getY(B),pos.getY(C));if(mx-mn>.6&&ylo<1.3)continue;keep.push(A,B,C)}g.setIndex(keep)}
 return cache[id]={g,J}}
export function buildSkinned(id,geo,mat){const {g,J}=rigGeometry(id,geo);const bones=BN.map(()=>new THREE.Bone());
 BN.forEach((nm,i)=>{bones[i].name=nm;const pp=PAR[i]<0?new THREE.Vector3():J[BN[PAR[i]]];bones[i].position.subVectors(J[nm],pp);if(PAR[i]>=0)bones[PAR[i]].add(bones[i])});
 const mesh=new THREE.SkinnedMesh(g,mat);mesh.add(bones[0]);mesh.updateMatrixWorld(true);const sk=new THREE.Skeleton(bones);mesh.bind(sk);mesh.frustumCulled=false;
 const B={};bones.forEach(b=>B[b.name]=b);const rest0=bones[0].position.clone();return {mesh,B,rest0}}
// ---------- clips: keyframes of euler deltas (character space) ----------
// pose: {bone:[x,y,z]} plus hp:[dx,dy,dz] hips offset, hr:[x,y,z] hips rotation
const P=(o)=>o;
const GUARD={uaL:[-.5,0,.25],faL:[-1.9,0,0],uaR:[-.4,0,-.25],faR:[-1.7,0,0],thL:[-.3,0,.12],shL:[.45,0,0],ftL:[-.15,0,0],thR:[.15,0,-.12],shR:[.35,0,0],ftR:[-.2,0,0],spine:[.12,.25,0],chest:[.05,.1,0],head:[-.1,-.3,0],hp:[0,-.06,0],hr:[0,-.25,0]};
const WGUARD={...GUARD,uaR:[-.7,0,-.3],faR:[-.9,0,0],hdR:[-.3,0,0]};
const mix=(a,b)=>({...a,...b});
export const CLIPS={
 idle:{loop:1,L:1.6,k:[[0,GUARD],[.8,mix(GUARD,{hp:[0,-.09,0],chest:[.1,.1,0],uaL:[-.55,0,.28]})],[1.6,GUARD]]},
 widle:{loop:1,L:1.6,k:[[0,WGUARD],[.8,mix(WGUARD,{hp:[0,-.09,0],chest:[.1,.1,0]})],[1.6,WGUARD]]},
 run:{loop:1,L:.62,k:[
  [0,{thL:[-.9,0,0],shL:[.3,0,0],thR:[.6,0,0],shR:[1.2,0,0],uaL:[.6,0,.15],faL:[-1.3,0,0],uaR:[-.7,0,-.15],faR:[-1.4,0,0],spine:[.3,-.12,0],hp:[0,-.02,0],hr:[0,.1,0]}],
  [.155,{thL:[-.2,0,0],shL:[.4,0,0],thR:[-.1,0,0],shR:[1.6,0,0],uaL:[0,0,.15],faL:[-1.3,0,0],uaR:[0,0,-.15],faR:[-1.4,0,0],spine:[.3,0,0],hp:[0,.06,0]}],
  [.31,{thR:[-.9,0,0],shR:[.3,0,0],thL:[.6,0,0],shL:[1.2,0,0],uaR:[.6,0,-.15],faR:[-1.3,0,0],uaL:[-.7,0,.15],faL:[-1.4,0,0],spine:[.3,.12,0],hp:[0,-.02,0],hr:[0,-.1,0]}],
  [.465,{thR:[-.2,0,0],shR:[.4,0,0],thL:[-.1,0,0],shL:[1.6,0,0],uaR:[0,0,-.15],faR:[-1.3,0,0],uaL:[0,0,.15],faL:[-1.4,0,0],spine:[.3,0,0],hp:[0,.06,0]}],
  [.62,null]]},
 // right jab  (contact .07)
 punch1:{L:.38,hit:.07,k:[[0,mix(GUARD,{uaR:[-.3,0,-.3],faR:[-2.1,0,0]})],[.07,mix(GUARD,{uaR:[-1.55,.0,-.05],faR:[-.05,0,0],spine:[.15,.55,0],chest:[.05,.25,0],head:[-.1,-.6,0],hr:[0,.2,0],hp:[0,-.08,.08]})],[.17,mix(GUARD,{uaR:[-1.5,0,-.05],faR:[-.15,0,0],spine:[.15,.5,0],hr:[0,.15,0]})],[.38,GUARD]]},
 // left cross
 punch2:{L:.4,hit:.08,k:[[0,mix(GUARD,{uaL:[-.3,0,.3],faL:[-2.2,0,0],spine:[.1,.5,0]})],[.08,mix(GUARD,{uaL:[-1.6,0,.05],faL:[-.05,0,0],spine:[.2,-.7,0],chest:[.05,-.3,0],head:[-.1,.4,0],hr:[0,-.35,0],hp:[0,-.1,.1],thR:[.35,0,-.1],shR:[.5,0,0]})],[.2,mix(GUARD,{uaL:[-1.5,0,.05],faL:[-.2,0,0],spine:[.2,-.6,0],hr:[0,-.3,0]})],[.4,GUARD]]},
 // right uppercut
 punch3:{L:.5,hit:.1,k:[[0,mix(GUARD,{uaR:[.2,0,-.3],faR:[-1.4,0,0],spine:[.35,-.3,0],hp:[0,-.18,0]})],[.1,mix(GUARD,{uaR:[-2.3,0,-.1],faR:[-1.2,0,0],spine:[-.25,.6,0],chest:[-.1,.2,0],head:[-.3,-.3,0],hp:[0,.04,.1],hr:[0,.3,0],thL:[-.1,0,.1],shL:[.1,0,0]})],[.26,mix(GUARD,{uaR:[-2.2,0,-.1],faR:[-1.1,0,0],spine:[-.2,.5,0]})],[.5,GUARD]]},
 // roundhouse / front kick (right)
 kick:{L:.6,hit:.16,k:[[0,GUARD],[.08,mix(GUARD,{thR:[-1.4,0,-.1],shR:[2.0,0,0],spine:[-.25,.3,0],hp:[0,.0,-.05]})],[.16,mix(GUARD,{thR:[-1.6,-.2,-.35],shR:[.1,0,0],ftR:[.5,0,0],spine:[-.45,.5,.15],chest:[-.1,.2,0],thL:[.05,0,.1],shL:[.15,0,0],hp:[0,.04,.08],hr:[0,.5,.0],uaR:[.2,0,-.6],uaL:[-.8,0,.4]})],[.3,mix(GUARD,{thR:[-1.4,0,-.3],shR:[.5,0,0],spine:[-.35,.4,0],hr:[0,.4,0]})],[.42,mix(GUARD,{thR:[-.8,0,0],shR:[1.6,0,0]})],[.6,GUARD]]},
 // weapon: diagonal slash R->L
 slash1:{L:.42,hit:.09,k:[[0,mix(WGUARD,{uaR:[-2.4,0,-.9],faR:[-.8,0,0],hdR:[.2,0,0],spine:[.1,-.6,0],chest:[0,-.3,0],hr:[0,-.3,0]})],[.09,mix(WGUARD,{uaR:[-1.3,1.0,-.2],faR:[-.2,0,0],hdR:[.3,0,0],spine:[.3,.7,0],chest:[.1,.3,0],hr:[0,.35,0],hp:[0,-.1,.12],thR:[.3,0,-.1],shR:[.6,0,0]})],[.2,mix(WGUARD,{uaR:[-.6,1.3,.2],faR:[-.3,0,0],spine:[.3,.8,0],hr:[0,.35,0]})],[.42,WGUARD]]},
 // backhand L->R
 slash2:{L:.42,hit:.09,k:[[0,mix(WGUARD,{uaR:[-1.1,1.2,.3],faR:[-.9,0,0],spine:[.2,.7,0],hr:[0,.3,0]})],[.09,mix(WGUARD,{uaR:[-1.5,-.5,-1.1],faR:[-.15,0,0],spine:[.25,-.7,0],chest:[.05,-.3,0],hr:[0,-.4,0],hp:[0,-.08,.1],thL:[-.6,0,.1],shL:[.8,0,0]})],[.2,mix(WGUARD,{uaR:[-1.2,-.5,-1.3],faR:[-.2,0,0],spine:[.2,-.6,0],hr:[0,-.35,0]})],[.42,WGUARD]]},
 // overhead cleave
 slash3:{L:.56,hit:.14,k:[[0,WGUARD],[.08,mix(WGUARD,{uaR:[-3.0,0,-.2],faR:[-.6,0,0],uaL:[-2.8,0,.2],faL:[-.6,0,0],spine:[-.35,0,0],chest:[-.15,0,0],hp:[0,.03,-.05]})],[.14,mix(WGUARD,{uaR:[-1.2,0,-.05],faR:[-.1,0,0],hdR:[.5,0,0],uaL:[-1.1,0,.05],faL:[-.2,0,0],spine:[.6,0,0],chest:[.2,0,0],hp:[0,-.25,.2],thL:[-.9,0,.1],shL:[1.1,0,0],ftL:[-.2,0,0],thR:[.5,0,-.1],shR:[.7,0,0]})],[.34,mix(WGUARD,{uaR:[-1.0,0,-.05],faR:[-.1,0,0],uaL:[-1.0,0,.05],spine:[.55,0,0],hp:[0,-.22,.2],thL:[-.8,0,.1],shL:[1,0,0]})],[.56,WGUARD]]},
 // heavy two-hand spin / power strike
 heavy:{L:.7,hit:.2,k:[[0,mix(GUARD,{uaR:[-.4,-1.0,-1.2],faR:[-.6,0,0],uaL:[-.6,-.6,.6],faL:[-1.6,0,0],spine:[.2,-1.1,0],chest:[0,-.4,0],hr:[0,-.6,0],hp:[0,-.16,0],thL:[-.6,0,.2],shL:[1.1,0,0],thR:[.1,0,-.2],shR:[.9,0,0]})],[.2,mix(GUARD,{uaR:[-1.5,1.3,-.1],faR:[-.05,0,0],uaL:[-1.1,1.0,.3],faL:[-.6,0,0],spine:[.35,1.0,0],chest:[.1,.4,0],hr:[0,.7,0],hp:[0,-.2,.25],thR:[-.7,0,-.1],shR:[1.0,0,0],thL:[.4,0,.1],shL:[.7,0,0]})],[.42,mix(GUARD,{uaR:[-1.2,1.4,.1],faR:[-.1,0,0],spine:[.3,1.0,0],hr:[0,.6,0],hp:[0,-.18,.2]})],[.7,GUARD]]},
 block:{loop:1,L:1,k:[[0,mix(GUARD,{uaL:[-1.3,.5,.1],faL:[-1.7,0,0],uaR:[-1.2,-.5,-.1],faR:[-1.8,0,0],spine:[.25,0,0],head:[.2,0,0],hp:[0,-.14,0],hr:[0,0,0],thL:[-.5,0,.15],shL:[.8,0,0],thR:[.3,0,-.15],shR:[.6,0,0]})],[1,null]]},
 wblock:{loop:1,L:1,k:[[0,mix(GUARD,{uaR:[-1.4,.9,-.1],faR:[-1.2,0,0],hdR:[0,0,1.2],uaL:[-1.2,.6,.1],faL:[-1.6,0,0],spine:[.25,0,0],hp:[0,-.14,0],hr:[0,0,0],thL:[-.5,0,.15],shL:[.8,0,0],thR:[.3,0,-.15],shR:[.6,0,0]})],[1,null]]},
 // forward roll: tuck + hips rotate
 roll:{L:.42,k:[[0,{hr:[0,0,0],hp:[0,-.3,0],spine:[.6,0,0],chest:[.4,0,0],head:[.5,0,0],uaL:[-1,0,.3],faL:[-1.5,0,0],uaR:[-1,0,-.3],faR:[-1.5,0,0],thL:[-1.6,0,0],shL:[2.2,0,0],thR:[-1.6,0,0],shR:[2.2,0,0]}],[.21,{hr:[3.14,0,0],hp:[0,-.25,0],spine:[.7,0,0],chest:[.5,0,0],head:[.6,0,0],uaL:[-1.2,0,.3],faL:[-1.6,0,0],uaR:[-1.2,0,-.3],faR:[-1.6,0,0],thL:[-2.0,0,0],shL:[2.4,0,0],thR:[-2.0,0,0],shR:[2.4,0,0]}],[.36,{hr:[6.28,0,0],hp:[0,-.3,0],spine:[.4,0,0],thL:[-1.2,0,0],shL:[1.8,0,0],thR:[-.6,0,0],shR:[1.2,0,0],uaL:[-.6,0,.3],faL:[-1.2,0,0],uaR:[-.6,0,-.3],faR:[-1.2,0,0]}],[.42,mix(GUARD,{hr:[6.28,-.25,0]})]]},
 hit:{L:.34,k:[[0,GUARD],[.06,mix(GUARD,{spine:[-.45,-.3,.15],chest:[-.25,0,0],head:[-.5,.3,0],hp:[0,-.05,-.12],uaL:[-.2,0,.6],uaR:[-.1,0,-.6],faL:[-.8,0,0],faR:[-.8,0,0]})],[.34,GUARD]]},
 death:{L:1.1,clamp:1,k:[[0,GUARD],[.12,mix(GUARD,{spine:[-.5,.2,0],head:[-.6,0,0],hp:[0,-.1,-.2],uaL:[.3,0,.9],uaR:[.3,0,-.9]})],[.5,{hr:[-1.45,0,0],hp:[0,-.72,-.55],spine:[-.2,0,0],head:[-.3,.4,0],uaL:[-.2,0,1.3],faL:[-.3,0,0],uaR:[-.1,0,-1.4],faR:[-.4,0,0],thL:[-.3,0,.1],shL:[.3,0,0],thR:[-.1,0,-.15],shR:[.2,0,0]}],[1.1,{hr:[-1.52,0,0],hp:[0,-.78,-.6],spine:[-.1,0,0],head:[-.2,.6,0],uaL:[-.1,0,1.4],uaR:[-.1,0,-1.5],thL:[-.2,0,.1],thR:[0,0,-.15]}]]},
 victory:{L:1.4,clamp:1,k:[[0,GUARD],[.35,{uaR:[-3.0,0,-.2],faR:[-.2,0,0],uaL:[0,0,.25],faL:[-.4,0,0],spine:[-.15,0,0],chest:[-.1,0,0],head:[-.3,0,0],hp:[0,.02,0]}],[1.4,{uaR:[-2.9,0,-.25],faR:[-.3,0,0],uaL:[0,0,.2],faL:[-.3,0,0],spine:[-.12,0,0],head:[-.25,0,0]}]]},
 cast:{L:.6,hit:.18,k:[[0,GUARD],[.12,mix(GUARD,{uaR:[-2.2,0,-.5],faR:[-.8,0,0],uaL:[-2.2,0,.5],faL:[-.8,0,0],spine:[-.3,0,0],hp:[0,.02,-.05]})],[.2,mix(GUARD,{uaR:[-1.5,.3,-.15],faR:[0,0,0],uaL:[-1.5,-.3,.15],faL:[0,0,0],spine:[.3,0,0],hp:[0,-.14,.12],thL:[-.6,0,.1],shL:[.8,0,0],thR:[.4,0,-.1],shR:[.5,0,0]})],[.38,mix(GUARD,{uaR:[-1.4,.3,-.15],faR:[-.1,0,0],uaL:[-1.4,-.3,.15],faL:[-.1,0,0],spine:[.25,0,0],hp:[0,-.12,.1]})],[.6,GUARD]]},
 shoot:{L:.42,hit:.12,k:[[0,mix(GUARD,{uaL:[-1.5,.2,.1],faL:[-.1,0,0],uaR:[-1.5,-.3,-.1],faR:[-.3,0,0],spine:[.05,-.7,0],hr:[0,-.6,0]})],[.1,mix(GUARD,{uaL:[-1.55,.3,.1],faL:[0,0,0],uaR:[-1.5,-1.0,-.4],faR:[-2.2,0,0],spine:[.05,-.9,0],hr:[0,-.8,0]})],[.14,mix(GUARD,{uaL:[-1.55,.3,.1],faL:[0,0,0],uaR:[-1.3,-1.3,-.9],faR:[-.6,0,0],spine:[0,-.9,0],hr:[0,-.8,0]})],[.42,GUARD]]},
};
// windup poses (enemies hold this during telegraph): first key of clip exaggerated
export const WIND={punch1:mix(GUARD,{uaR:[.5,0,-.4],faR:[-2.2,0,0],spine:[.2,-.6,0],hr:[0,-.4,0],hp:[0,-.14,-.06]}),punch2:mix(GUARD,{uaL:[.5,0,.4],faL:[-2.2,0,0],spine:[.2,.7,0],hr:[0,.4,0],hp:[0,-.14,-.06]}),kick:mix(GUARD,{thR:[-.9,0,0],shR:[2.0,0,0],spine:[-.2,.3,0],hp:[0,-.04,-.08]}),heavy:mix(GUARD,{uaR:[-3.0,0,-.3],faR:[-.7,0,0],uaL:[-2.9,0,.3],faL:[-.7,0,0],spine:[-.45,0,0],chest:[-.2,0,0],hp:[0,.04,-.12],thL:[-.4,0,.1],shL:[.5,0,0]}),cast:mix(GUARD,{uaR:[-2.6,0,-.6],faR:[-.6,0,0],uaL:[-2.6,0,.6],faL:[-.6,0,0],spine:[-.35,0,0],head:[-.4,0,0]}),slash1:CLIPS.slash1.k[0][1]};
WIND.punch3=WIND.punch1;
const ALLB=[...BN];
const qa=new THREE.Quaternion(),qb=new THREE.Quaternion(),eu=new THREE.Euler(0,0,0,'YXZ');
function sample(clip,t){const k=clip.k;if(clip.loop)t=t%clip.L;else t=Math.min(t,clip.L);let i=0;while(i<k.length-2&&k[i+1][0]<=t)i++;const a=k[i],b=k[i+1]||k[i];const pa=a[1],pb=b[1]||k[0][1];const span=b[0]-a[0];let f=span>0?(t-a[0])/span:1;f=Math.max(0,Math.min(1,f));f=f*f*(3-2*f);return [pa,pb,f]}
function val(p,n){return (p&&p[n])||Z}const Z=[0,0,0];
// Animator per entity
export class Anim{constructor(rig){this.r=rig;this.cur=null;this.t=0;this.prev=null;this.pt=0;this.fade=0;this.fadeL=.1;this.static=null;this.ts=1}
 play(name,{fade=.08,from=0,ts=1}={}){const c=CLIPS[name];if(!c)return;if(this.cur===name&&c.loop&&!this.static){this.ts=ts;return}this.prev=this.snapshot();this.fade=this.fadeL=fade;this.cur=name;this.t=from;this.static=null;this.ts=ts}
 hold(pose,fade=.12){if(this.static===pose)return;this.prev=this.snapshot();this.fade=this.fadeL=fade;this.static=pose;this.cur='__hold'}
 snapshot(){const s={};const B=this.r.B;for(const n of ALLB)s[n]=B[n].quaternion.clone();s.hp=B.hips.position.clone();return s}
 get done(){const c=CLIPS[this.cur];return !c||(!c.loop&&this.t>=c.L)}
 update(dt){this.t+=dt*this.ts;if(this.fade>0)this.fade-=dt;const B=this.r.B,r0=this.r.rest0;let pa,pb,f;
  if(this.static){pa=pb=this.static;f=0}else{const c=CLIPS[this.cur];if(!c)return;[pa,pb,f]=sample(c,this.t)}
  const w=this.fade>0&&this.prev?1-this.fade/this.fadeL:1;
  for(const n of ALLB){const key=n==='hips'?'hr':n;const A=val(pa,key),Bv=val(pb,key);eu.set(A[0]+(Bv[0]-A[0])*f,A[1]+(Bv[1]-A[1])*f,A[2]+(Bv[2]-A[2])*f);qa.setFromEuler(eu);if(w<1)qa.copy(this.prev[n]).slerp(qb.copy(qa),w);B[n].quaternion.copy(qa)}
  const A=val(pa,'hp'),Bv=val(pb,'hp');const hx=r0.x+A[0]+(Bv[0]-A[0])*f,hy=r0.y+A[1]+(Bv[1]-A[1])*f,hz=r0.z+A[2]+(Bv[2]-A[2])*f;
  if(w<1)B.hips.position.set(hx,hy,hz).lerp(this.prev.hp,1-w);else B.hips.position.set(hx,hy,hz)}}
