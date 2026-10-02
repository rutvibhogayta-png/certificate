
const VIBES=[["classic","Classic Gold","linear-gradient(90deg,#fbf6e9,#b58a25)"],["modern","Modern Clean","linear-gradient(90deg,#fff,#0f766e)"],["royal","Royal Navy","linear-gradient(90deg,#10203f,#e2b857)"],["academic","Academic","linear-gradient(90deg,#f6f7f4,#1f4a36)"]];
const S={vibe:"classic",lalign:"center",logo:"",sigs:[],idx:0};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
// Read uploads in the browser instead of writing them to Vercel's temporary filesystem.
// Data URLs travel with the certificate payload and work for preview and print/export.
const readImg=(f,cb)=>{
 if(!f)return;
 if(!f.type || !f.type.startsWith("image/")){alert("Please select an image file.");return;}
 const reader=new FileReader();
 reader.onload=()=>{if(typeof reader.result==="string")cb(reader.result);else alert("Could not read this image. Please try another file.");};
 reader.onerror=()=>alert("Could not read this image. Please try another file.");
 reader.readAsDataURL(f);
};

$("vibes").innerHTML=VIBES.map(v=>`<button class="vibe" data-v="${v[0]}"><i style="background:${v[2]};border:1px solid var(--line)"></i>${v[1]}</button>`).join("");
$("vibes").onclick=e=>{const b=e.target.closest(".vibe");if(!b)return;S.vibe=b.dataset.v;render()};
$("lalign").onclick=e=>{const b=e.target.closest("button");if(!b)return;S.lalign=b.dataset.v;render()};
$("logo").onchange=e=>readImg(e.target.files[0],d=>{S.logo=d;render()});

function names(){
 const t=$("names").value;
 const parts=$("sep").value==="space"?t.split(/[\s,]+/):t.split(/[,\n;]+/);
 return parts.map(s=>s.trim()).filter(Boolean);
}
function fmtDate(v){if(!v)return"";const d=new Date(v+"T00:00:00");return d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}

function buildSigs(){
 const n=Math.max(0,Math.min(6,parseInt($("scount").value)||0));
 while(S.sigs.length<n)S.sigs.push({name:"",des:"",img:""});
 S.sigs.length=n;
 $("sigs").innerHTML=S.sigs.map((s,i)=>`<div class="sig"><b>Signatory ${i+1}</b>
  <label>Signature image</label><input type="file" accept="image/*" data-i="${i}" data-k="img">
  <div class="row"><div><label>Name</label><input type="text" data-i="${i}" data-k="name" value="${esc(s.name)}"></div>
  <div><label>Designation</label><input type="text" data-i="${i}" data-k="des" value="${esc(s.des)}"></div></div></div>`).join("");
}
$("sigs").addEventListener("input",e=>{const t=e.target,i=t.dataset.i;if(i==null)return;
 if(t.type==="file")readImg(t.files[0],d=>{S.sigs[i].img=d;render()});
 else{S.sigs[i][t.dataset.k]=t.value;render()}});
$("scount").oninput=()=>{buildSigs();render()};

function certHTML(name){
 const sg=S.sigs.map(s=>`<div class="sg">${s.img?`<img src="${s.img}" alt="">`:'<div style="height:54px"></div>'}<div class="ln">${esc(s.name||"Name")}</div><div class="ds">${esc(s.des)}</div></div>`).join("");
 const meta=[fmtDate($("date").value),$("place").value].filter(Boolean).map(esc).join(" · ").replace(/ · /," — ");
 return `<div class="cert" data-v="${S.vibe}" style="--lh:${$("lsize").value}px"><div class="frame"></div><div class="frame2"></div><div class="in">
 <div class="logo" style="justify-content:${S.lalign}">${S.logo?`<img src="${S.logo}" alt="Logo">`:""}</div>
 <div class="org">${esc($("org").value)}</div>
 <div class="title">${esc($("title").value)}</div>
 <div class="pre">${esc($("pre").value)}</div>
 <div class="name">${esc(name)}</div>
 <div class="body">${esc($("body").value)}</div>
 <div class="meta">${meta}</div>
 <div class="sigs">${sg}</div></div></div>`;
}

function fit(){
 const st=$("stage"),c=st.querySelector(".cert");if(!c)return;
 const k=st.clientWidth/1123;c.style.transform=`scale(${k})`;st.style.height=(794*k)+"px";
}
function render(){
 const list=names();const n=list.length||1;
 S.idx=Math.min(S.idx,n-1);
 document.querySelectorAll(".vibe").forEach(b=>b.classList.toggle("on",b.dataset.v===S.vibe));
 document.querySelectorAll("#lalign button").forEach(b=>b.classList.toggle("on",b.dataset.v===S.lalign));
 $("lsv").textContent=$("lsize").value;
 $("ncount").textContent=list.length+" certificate"+(list.length===1?"":"s")+" will be generated";
 $("pos").textContent=(S.idx+1)+" / "+n;
 $("cw").innerHTML=certHTML(list[S.idx]||"Recipient Name");
 fit();
}
$("form").addEventListener("input",e=>{if(e.target.closest("#sigs"))return;render()});
$("prev").onclick=()=>{S.idx=Math.max(0,S.idx-1);render()};
$("next").onclick=()=>{S.idx=Math.min(Math.max(names().length-1,0),S.idx+1);render()};
$("printBtn").onclick=()=>{
 const d={vibe:S.vibe,lalign:S.lalign,lsize:$("lsize").value,org:$("org").value,title:$("title").value,pre:$("pre").value,
  body:$("body").value,date:$("date").value,place:$("place").value,names:names(),logo:S.logo,sigs:S.sigs};
 $("payload").value=JSON.stringify(d);$("printForm").submit();
};
addEventListener("resize",fit);
buildSigs();
S.sigs[0].name="Dr. Anita Desai";S.sigs[0].des="Chairperson";
S.sigs[1].name="Rahul Verma";S.sigs[1].des="Director, Programmes";
buildSigs();
document.fonts&&document.fonts.ready.then(render);
render();
