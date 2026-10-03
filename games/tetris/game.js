(()=>{"use strict";
const c=document.querySelector("#board"),x=c.getContext("2d"),scoreEl=score,linesEl=lines,levelEl=level;
const overlay=document.querySelector("#overlay"),title=document.querySelector("#overlayTitle"),ot=document.querySelector("#overlayText"),start=document.querySelector("#start"),status=document.querySelector("#status");
const C=30,W=10,H=20;
const colors={I:"#55e8ff",J:"#668cff",L:"#ffad5c",O:"#ffe66b",S:"#65e887",T:"#bd79ff",Z:"#ff668b"};
const shapes={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0],[0,0,0]],T:[[0,1,0],[1,1,1],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]]};
const types=Object.keys(shapes);let board,piece,bag=[],next=[],hold=null,canHold=true,score=0,lines=0,level=1,running=false,paused=false,timer=0,last=0,raf;
const clone=m=>m.map(r=>r.slice());
function shuffle(a){for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function refill(){while(next.length<6)next.push(...shuffle(types.slice()))}
function make(t){let m=clone(shapes[t]);return{t,m,x:Math.floor((W-m[0].length)/2),y:-1}}
function reset(){board=Array.from({length:H},()=>Array(W).fill(null));next=[];refill();hold=null;canHold=true;score=lines=0;level=1;piece=make(next.shift());refill();timer=0;update();draw()}
function hit(p,dx=0,dy=0,m=p.m){for(let y=0;y<m.length;y++)for(let xx=0;xx<m[y].length;xx++)if(m[y][xx]){let X=p.x+xx+dx,Y=p.y+y+dy;if(X<0||X>=W||Y>=H||(Y>=0&&board[Y][X]))return true}return false}
function merge(){piece.m.forEach((r,y)=>r.forEach((v,xx)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+xx]=piece.t}))}
function clear(){let n=0;for(let y=H-1;y>=0;y--)if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(W).fill(null));n++;y++}if(n){score+=[0,100,300,500,800][n]*level;lines+=n;level=1+Math.floor(lines/10)}}
function spawn(){piece=make(next.shift());refill();canHold=true;if(hit(piece)){running=false;show("GAME OVER","Score "+score.toLocaleString(),"RESTART");status.textContent="GAME OVER"}}
function lock(){merge();clear();spawn();update()}
function move(d){if(running&&!paused&&!hit(piece,d))piece.x+=d}
function down(){if(!running||paused)return;if(!hit(piece,0,1)){piece.y++;score++;timer=0}else lock();update()}
function hard(){if(!running||paused)return;let n=0;while(!hit(piece,0,1)){piece.y++;n++}score+=n*2;lock();update()}
function rotate(){if(!running||paused)return;let m=piece.m[0].map((_,i)=>piece.m.map(r=>r[i]).reverse());for(let k of [0,-1,1,-2,2])if(!hit(piece,k,0,m)){piece.x+=k;piece.m=m;break}}
function keep(){if(!running||paused||!canHold)return;let t=piece.t;if(hold===null){hold=t;spawn()}else{[hold,t]=[t,hold];piece=make(t)}canHold=false}
function pause(){if(!running)return;paused=!paused;status.textContent=paused?"PAUSED":"PLAYING";paused?show("PAUSED","Take a breath.","RESUME"):hide()}
function show(a,b,d){title.textContent=a;ot.textContent=b;start.textContent=d;overlay.classList.remove("hidden")}
function hide(){overlay.classList.add("hidden")}
function drawCell(X,Y,t,a=1){if(Y<0)return;x.save();x.globalAlpha=a;x.fillStyle=colors[t];x.fillRect(X*C+1,Y*C+1,C-2,C-2);x.fillStyle="#ffffff30";x.fillRect(X*C+3,Y*C+3,C-6,3);x.restore()}
function draw(){x.fillStyle="#060913";x.fillRect(0,0,300,600);x.strokeStyle="#687ca01f";for(let i=0;i<=W;i++){x.beginPath();x.moveTo(i*C+.5,0);x.lineTo(i*C+.5,600);x.stroke()}for(let i=0;i<=H;i++){x.beginPath();x.moveTo(0,i*C+.5);x.lineTo(300,i*C+.5);x.stroke()}board.forEach((r,y)=>r.forEach((t,xx)=>t&&drawCell(xx,y,t)));if(piece){let gy=piece.y;while(!hit({...piece,y:gy},0,1))gy++;piece.m.forEach((r,y)=>r.forEach((v,xx)=>v&&drawCell(piece.x+xx,gy+y,piece.t,.16)));piece.m.forEach((r,y)=>r.forEach((v,xx)=>v&&drawCell(piece.x+xx,piece.y+y,piece.t)))}render()}
function grid(el,t){el.innerHTML="";for(let y=0;y<4;y++)for(let xx=0;xx<4;xx++){let s=document.createElement("span"),m=shapes[t];if(m[y]?.[xx])s.style.background=colors[t];el.appendChild(s)}}
function render(){grid(document.querySelector("#hold"),hold);let n=document.querySelector("#next");n.innerHTML="";next.slice(0,4).forEach(t=>{let d=document.createElement("div");d.className="next-item";let g=document.createElement("div");g.className="next-grid";grid(g,t);d.appendChild(g);n.appendChild(d)})}
function update(){scoreEl.textContent=score.toLocaleString();linesEl.textContent=lines;levelEl.textContent=level}
function loop(now){if(!running)return;let dt=now-last;last=now;if(!paused){timer+=dt;let interval=Math.max(75,800-(level-1)*65);if(timer>=interval){timer=0;if(!hit(piece,0,1))piece.y++;else lock()}draw()}raf=requestAnimationFrame(loop)}
const actions={ArrowLeft:()=>move(-1),a:()=>move(-1),ArrowRight:()=>move(1),d:()=>move(1),ArrowDown:down,s:down,ArrowUp:rotate,x:rotate,w:rotate," ":hard,c:keep,Shift:keep,Escape:pause,p:pause};
addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," ","Shift"].includes(e.key))e.preventDefault();actions[e.key]?.()},{passive:false});
document.querySelectorAll("[data-a]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();({left:()=>move(-1),right:()=>move(1),down,drop:hard,rotate,hold:keep,pause})[b.dataset.a]?.()}));
start.onclick=()=>{if(paused){pause();return}reset();running=true;hide();status.textContent="PLAYING";last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)};
document.querySelector("#pauseTop").onclick=pause;
reset();show("TETRIS","Keyboard or touch controls","START GAME");
})();