import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const sceneHost=document.getElementById('scene');
const scoreEl=document.getElementById('score');
const bestEl=document.getElementById('best');
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('start');
const message=document.getElementById('message');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x79c9f0);
scene.fog=new THREE.Fog(0x79c9f0,22,75);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,120);
camera.position.set(0,5.8,10);camera.lookAt(0,0,-8);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
sceneHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff5ff,0x41617e,2));
const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(-5,12,7);sun.castShadow=true;scene.add(sun);

const plane=new THREE.Group();scene.add(plane);
const white=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.45,metalness:.05,side:THREE.DoubleSide});
const blue=new THREE.MeshStandardMaterial({color:0x168bd0,roughness:.4,side:THREE.DoubleSide});
function wing(points,material){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.castShadow=true;plane.add(m);return m;}
wing([[0,0,0],[-.85,0,.9],[0,.05,.32],[.85,0,.9]],white);
wing([[0,.01,0],[-.85,0,.9],[0,-.06,1.35]],blue);
wing([[0,.01,0],[.85,0,.9],[0,-.06,1.35]],white);
const nose=new THREE.Mesh(new THREE.ConeGeometry(.12,.65,4),white);nose.rotation.x=Math.PI/2;nose.position.z=-.32;plane.add(nose);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x398b79,roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,-5,-35);scene.add(floor);
const clouds=[];
const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
for(let i=0;i<18;i++){
 const group=new THREE.Group();
 for(let j=0;j<4;j++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.7+Math.random()*.5,10,8),cloudMat);puff.position.set((j-1.5)*.65,Math.random()*.35,Math.random()*.3);group.add(puff);}
 group.position.set((Math.random()-.5)*24,3+Math.random()*8,-Math.random()*75);scene.add(group);clouds.push(group);
}
const rings=[],obstacles=[];
const ringGeo=new THREE.TorusGeometry(1.05,.12,10,32);
const ringMat=new THREE.MeshStandardMaterial({color:0xffd34e,metalness:.45,roughness:.25,emissive:0x5b3600});
const obstacleMat=new THREE.MeshStandardMaterial({color:0xff6c78,roughness:.5});
function addRing(z){const r=new THREE.Mesh(ringGeo,ringMat);r.position.set((Math.random()-.5)*5,0,z);r.rotation.y=Math.PI/2;r.userData.passed=false;scene.add(r);rings.push(r);}
function addObstacle(z){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.8,1),obstacleMat);o.position.set((Math.random()-.5)*6,0,z);scene.add(o);obstacles.push(o);}
for(let i=0;i<7;i++){addRing(-18-i*13);if(i%2===1)addObstacle(-25-i*13);}

let running=false,score=0,best=Number(localStorage.getItem('paperplaneBest')||0),targetX=0,last=0,speed=13;
bestEl.textContent=best;
function reset(){score=0;speed=13;targetX=0;plane.position.set(0,0,0);scoreEl.textContent='0';rings.forEach((r,i)=>{r.position.z=-18-i*13;r.position.x=(Math.random()-.5)*5;r.userData.passed=false;});obstacles.forEach((o,i)=>{o.position.z=-38-i*26;o.position.x=(Math.random()-.5)*6;});}
function endGame(){running=false;message.textContent=`انتهت الجولة! نتيجتك: ${score}`;startBtn.textContent='العب مرة أخرى';overlay.classList.remove('hidden');}
startBtn.addEventListener('click',()=>{reset();running=true;last=performance.now();overlay.classList.add('hidden');});
function moveInput(x){const rect=renderer.domElement.getBoundingClientRect();targetX=((x-rect.left)/rect.width-.5)*9;targetX=Math.max(-4.2,Math.min(4.2,targetX));}
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);moveInput(e.clientX);});
renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')moveInput(e.clientX);});
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;
 if(running){
  plane.position.x+=(targetX-plane.position.x)*Math.min(1,dt*5);
  plane.rotation.z=(plane.position.x-targetX)*-.09;
  plane.rotation.x=Math.sin(now*.002)*.035;
  const travel=speed*dt;
  for(const r of rings){r.position.z+=travel;if(r.position.z>2){r.position.z-=91;r.position.x=(Math.random()-.5)*5;r.userData.passed=false;}
   if(!r.userData.passed&&r.position.z>-.5&&r.position.z<1.1){if(Math.abs(plane.position.x-r.position.x)<1.25){score+=10;scoreEl.textContent=score;r.userData.passed=true;}else if(r.position.z>.7){r.userData.passed=true;}}
  }
  for(const o of obstacles){o.position.z+=travel;if(o.position.z>3){o.position.z-=100;o.position.x=(Math.random()-.5)*6;}
   if(Math.abs(o.position.z)<.9&&Math.abs(plane.position.x-o.position.x)<1.15){endGame();break;}
  }
  speed=Math.min(22,speed+dt*.12);
 }
 clouds.forEach(c=>{c.position.z+=running?dt*speed*.35:dt*.5;if(c.position.z>15)c.position.z=-75;});
 camera.position.x+=(plane.position.x*.18-camera.position.x)*.04;camera.lookAt(plane.position.x*.2,0,-8);
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
