import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const host=document.getElementById('scene');
const scoreEl=document.getElementById('score');
const bestEl=document.getElementById('best');
const overlay=document.getElementById('overlay');
const titleEl=document.getElementById('title');
const messageEl=document.getElementById('message');
const startBtn=document.getElementById('start');
const speedNote=document.getElementById('speedNote');
const lobbyBest=document.getElementById('lobbyBest');
const fullscreenBtn=document.getElementById('fullscreen');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x70c9ee);
scene.fog=new THREE.Fog(0x8bd5ef,34,105);
const camera=new THREE.PerspectiveCamera(62,1,0.1,120);
camera.position.set(0,3.3,9.5);
camera.lookAt(0,3.1,-5);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
renderer.shadowMap.autoUpdate=true;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8faff,0x42617b,2.25));
const sun=new THREE.DirectionalLight(0xfff4d7,2.6);
sun.position.set(-7,13,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.bias=-0.00025;scene.add(sun);

const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(2.1,24,20),new THREE.MeshBasicMaterial({color:0xfff1c4}));
sunDisc.position.set(-17,15,-58);scene.add(sunDisc);

const mats={
 paper:new THREE.MeshStandardMaterial({color:0xf4fbff,roughness:.43,metalness:.04,side:THREE.DoubleSide}),
 wing:new THREE.MeshStandardMaterial({color:0x8edfff,roughness:.38,metalness:.08,side:THREE.DoubleSide}),
 fold:new THREE.MeshStandardMaterial({color:0x4ba8d4,roughness:.48,side:THREE.DoubleSide}),
 teal:new THREE.MeshStandardMaterial({color:0x11a98f,roughness:.4,metalness:.12}),
 tealDark:new THREE.MeshStandardMaterial({color:0x087467,roughness:.48,metalness:.1}),
 cap:new THREE.MeshStandardMaterial({color:0x9cf1d9,roughness:.35,metalness:.08}),
 cloud:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96}),
 mountain1:new THREE.MeshStandardMaterial({color:0x83c9d2,roughness:1}),
 mountain2:new THREE.MeshStandardMaterial({color:0x4b9fb9,roughness:1}),
 mountain3:new THREE.MeshStandardMaterial({color:0x276e92,roughness:1})
};

function makePlane(){
 const g=new THREE.Group();
 function tri(points,mat){
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
  geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
 }
 const nose=[0,.16,-1.65],tail=[0,0,1.15],left=[-1.28,0,.72],right=[1.28,0,.72],ridge=[0,.26,.55];
 tri([nose,left,ridge],mats.paper);tri([nose,ridge,right],mats.wing);tri([left,tail,ridge],mats.fold);
 tri([ridge,tail,right],mats.paper);tri([nose,left,tail],mats.wing);tri([nose,tail,right],mats.fold);
 const seam=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.17,-1.63),new THREE.Vector3(0,.27,.55),new THREE.Vector3(0,0,1.15)]),new THREE.LineBasicMaterial({color:0x397a9b,transparent:true,opacity:.7}));
 g.add(seam);g.scale.setScalar(.78);return g;
}
const plane=makePlane();plane.position.set(0,3.25,0);scene.add(plane);

function addCloud(x,y,z,s=1){
 const group=new THREE.Group();
 [[0,0,0,1.05],[.72,.1,0,.78],[-.68,.02,.05,.72],[.15,.42,0,.78],[-.28,.28,.02,.62],[.48,.27,.02,.57]].forEach(([a,b,c,r])=>{
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),mats.cloud);m.position.set(a,b,c);m.scale.y=.68;m.castShadow=false;group.add(m);
 });
 group.position.set(x,y,z);group.scale.setScalar(s);scene.add(group);return group;
}
const clouds=[];
for(let i=0;i<22;i++)clouds.push(addCloud((Math.random()-.5)*32,1+Math.random()*10,-8-Math.random()*65,.45+Math.random()*1.1));

function addMountain(x,z,scale,mat){
 const m=new THREE.Mesh(new THREE.ConeGeometry(5,8,5),mat);
 m.position.set(x,1.4,z);m.scale.set(scale,scale,scale);m.rotation.y=Math.random()*1.5;m.receiveShadow=true;scene.add(m);
}
for(let i=0;i<18;i++){const matsArr=[mats.mountain1,mats.mountain2,mats.mountain3];addMountain((Math.random()-.5)*48,-28-Math.random()*55,.7+Math.random()*1.4,matsArr[i%3]);}

const obstacles=[];
function makeGate(gapY,z){
 const group=new THREE.Group(),gap=2.5,total=8.4;
 const topH=Math.max(.7,total-(gapY+gap/2)),bottomH=Math.max(.7,gapY-gap/2);
 function pillar(y,h){
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.15,h,1.05),mats.teal);body.position.set(0,y,0);body.castShadow=true;body.receiveShadow=true;group.add(body);
  const side=new THREE.Mesh(new THREE.BoxGeometry(.18,h,1.07),mats.tealDark);side.position.set(.57,y,.015);group.add(side);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(1.38,.25,1.28),mats.cap);cap.position.set(0,y+(h/2),0);cap.castShadow=true;group.add(cap);
  const trim=new THREE.Mesh(new THREE.BoxGeometry(1.18,.055,1.30),new THREE.MeshStandardMaterial({color:0xd4fff0,roughness:.3,metalness:.22}));trim.position.set(0,y+(h/2)-.14,.015);group.add(trim);
 }
 pillar(gapY+gap/2+topH/2,topH);pillar(bottomH/2,bottomH);
 group.position.set(0,0,z);scene.add(group);obstacles.push({group,gapY,scored:false});
}
let best=Number(localStorage.getItem('paperPlane3DBest')||0);
bestEl.textContent=best;lobbyBest.textContent=best;
let y=3.25,vy=0,score=0,playing=false,started=false,spawnClock=0,worldSpeed=15,elapsed=0,last=0;
const gravity=-19,flapPower=7.2,clock=new THREE.Clock();
function reset(){
 obstacles.forEach(o=>scene.remove(o.group));obstacles.length=0;y=3.25;vy=0;score=0;spawnClock=0;worldSpeed=15;elapsed=0;
 plane.position.set(0,y,0);plane.rotation.set(0,0,0);scoreEl.textContent='0';playing=true;started=true;overlay.classList.add('hidden');speedNote.textContent='المس الشاشة للطيران';makeGate(3.2,-30);
}
function flap(){if(!playing){if(!started)reset();return;}vy=flapPower;}
function endGame(){
 if(!playing)return;playing=false;
 if(score>best){best=score;localStorage.setItem('paperPlane3DBest',String(best));bestEl.textContent=best;lobbyBest.textContent=best;}
 titleEl.textContent='انتهت الرحلة!';messageEl.textContent=`جمعت ${score} نقطة. أفضل نتيجة عندك ${best}. حاول مرة أخرى!`;
 startBtn.textContent='العب من جديد ↻';overlay.classList.remove('hidden');
}
function update(dt){
 elapsed+=dt;clouds.forEach(c=>{c.position.z+=dt*(3+c.scale.x*1.4);if(c.position.z>14){c.position.z=-65-Math.random()*20;c.position.x=(Math.random()-.5)*32;c.position.y=1+Math.random()*10;}});
 if(!playing)return;vy+=gravity*dt;y+=vy*dt;plane.position.y=y;
 plane.rotation.z=THREE.MathUtils.lerp(plane.rotation.z,THREE.MathUtils.clamp(-vy*.045,-.45,.45),.12);
 plane.rotation.x=THREE.MathUtils.lerp(plane.rotation.x,Math.sin(elapsed*7)*.035,.08);
 spawnClock+=dt;worldSpeed=Math.min(23,15+score*.22);
 if(spawnClock>2.15){spawnClock=0;makeGate(2.15+Math.random()*2.1,-48);}
 for(let i=obstacles.length-1;i>=0;i--){
  const o=obstacles[i];o.group.position.z+=worldSpeed*dt;
  if(!o.scored&&o.group.position.z>1.5){o.scored=true;score++;scoreEl.textContent=score;}
  if(Math.abs(o.group.position.z)<1.15&&(y<o.gapY-1.25||y>o.gapY+1.25))endGame();
  if(o.group.position.z>14){scene.remove(o.group);obstacles.splice(i,1);}
 }
 if(y<.55||y>7.9)endGame();
}
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<430?70:64;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(host);resize();
startBtn.addEventListener('click',reset);
fullscreenBtn.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch(err){speedNote.textContent='ملء الشاشة غير مدعوم في هذا المتصفح';}});
document.addEventListener('fullscreenchange',()=>{fullscreenBtn.textContent=document.fullscreenElement?'⤢':'⛶';resize();});
renderer.domElement.addEventListener('pointerdown',e=>{e.preventDefault();flap();});
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();flap();}});
function animate(t){requestAnimationFrame(animate);const dt=Math.min(.04,(t-last)/1000||.016);last=t;update(dt);camera.position.y=3.3+(y-3.25)*.12;camera.position.x=THREE.MathUtils.lerp(camera.position.x,plane.position.x*.08,.04);camera.lookAt(0,3.1,-5);renderer.render(scene,camera);}
requestAnimationFrame(animate);
