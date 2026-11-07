import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,updatePassword,reauthenticateWithCredential,EmailAuthProvider,verifyBeforeUpdateEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,onSnapshot,setDoc,updateDoc,deleteDoc,runTransaction,getDocs} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js?v=20261106d";
import {printDoc,patInner,patSvg,isIOS} from "./print.js?v=20261106d";

const fapp=initializeApp(firebaseConfig),auth=getAuth(fapp),fdb=(()=>{try{return initializeFirestore(fapp,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}catch(e){return getFirestore(fapp)}})();
const SH=doc(fdb,"settings","shop"),J=id=>doc(fdb,"jobs",id);

// ---- ค่าเริ่มต้น (ພາສາລາວ) ----
const T={"รับเครื่องแล้ว":"ລໍຖ້າດຳເນີນການ","รอตรวจสอบ":"ລໍຖ້າດຳເນີນການ","กำลังดำเนินการ":"ກຳລັງດຳເນີນການ","กำลังซ่อม":"ກຳລັງສ້ອມ","รออะไหล่":"ລໍຖ້າອາໄຫຼ່","ซ่อมเสร็จแล้ว":"ສ້ອມແລ້ວ","พร้อมให้ลูกค้ามารับเครื่อง":"ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","ลูกค้ามารับเครื่องแล้ว":"ລູກຄ້າມາຮັບແລ້ວ","ยกเลิกงาน":"ຍົກເລີກ"};
T["ຊ່ອມແລ້ວ"]="ສ້ອມແລ້ວ";T["ກຳລັງຊ່ອມ"]="ກຳລັງສ້ອມ";
const tn=n=>T[n]||n;
const DS=[["ລໍຖ້າດຳເນີນການ","#7a8394"],["ກຳລັງດຳເນີນການ","#d4a017"],["ກຳລັງສ້ອມ","#e0781f"],["ລໍຖ້າອາໄຫຼ່","#d35400"],["ສ້ອມແລ້ວ","#1f9d6b"],["ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","#17a34a"],["ລູກຄ້າມາຮັບແລ້ວ","#1d4aa3"],["ຍົກເລີກ","#c0392b"]].map(a=>({n:a[0],c:a[1],d:a[0]==="ລູກຄ້າມາຮັບແລ້ວ"}));
const DONE=["ສ້ອມແລ້ວ","ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","ລູກຄ້າມາຮັບແລ້ວ"];
const DEFCOLORS=[["ດຳ","#111111"],["ຂາວ","#ffffff"],["ເງິນ","#c0c4cc"],["ທອງ","#d4af37"],["ຟ້າ","#3b82f6"],["ແດງ","#dc2626"],["ຊົມພູ","#f472b6"]].map(a=>({n:a[0],c:a[1]}));
const DOM=["@gmail.com","@icloud.com","@outlook.com","@hotmail.com","@yahoo.com"];
const DEF={name:"SL-Mobile",phone:"020 5655 8855",fb:"SL-mobile",addr:"",email:"",logo:"",statuses:DS,sticker:"50x30",
 brands:["iPhone","Samsung","Oppo","Vivo","Xiaomi","Redmi","Huawei","Honor","Realme","OnePlus","Infinix","Tecno","Itel","Google Pixel","Nokia","Motorola","Sony","Asus"],
 issues:["ປ່ຽນໜ້າຈໍ","ກວດເຊັກທັງໝົດ","ກວດເຊັກລຳໂພງ","ປ່ຽນແບັດເຕີຣີ","ຕັ້ງ ID / ອີເມວ","ປ່ຽນຝາຫຼັງ","ປ່ຽນຊ່ອງສາກ","ລົງໂປຣແກຣມ / ອັບເດດ","ກູ້ຂໍ້ມູນ"],
 conds:["ສະພາບດີ","ໜ້າຈໍແຕກ","ຝາຫຼັງແຕກ","ຕົວເຄື່ອງມີຮອຍ / ບຸບ","ເປີດບໍ່ຕິດ","ຕົກນ້ຳ"],
 staff:[],colors:DEFCOLORS,prefix:"SL",
 foundL:["ປົກກະຕິດີ ຕາມທີ່ລູກຄ້າແຈ້ງ","ສະແກນນິ້ວມືຂາດ","ເມນບອດມີບັນຫາ","ແບັດເຕີຣີເສື່ອມ","ມີນ້ຳເຂົ້າ / ຂຶ້ນສະນິມ","ສາຍແພຂາດ","ຊ່ອງສາກເສຍ","ລຳໂພງ / ໄມ ເສຍ"],
 afterL:["ທົດສອບແລ້ວ ໃຊ້ງານໄດ້ປົກກະຕິ","ປ່ຽນໜ້າຈໍແລ້ວ","ປ່ຽນແບັດເຕີຣີແລ້ວ","ສະແກນນິ້ວມືໃຊ້ໄດ້","ລຳໂພງ / ໄມ ໃຊ້ໄດ້","ທຳຄວາມສະອາດແລ້ວ"]};
function normS(d){const s={...DEF,...d},seen=new Set();s.prefix=/^[A-Za-z]{1,6}$/.test(s.prefix||"")?s.prefix.toUpperCase():"SL";s.colors=(s.colors&&s.colors.length?s.colors:DEFCOLORS);s.statuses=(s.statuses||DS).map(x=>({n:tn(x.n),c:x.c,d:x.d===undefined?tn(x.n)==="ລູກຄ້າມາຮັບແລ້ວ":!!x.d})).filter(x=>!seen.has(x.n)&&seen.add(x.n));return s}
const LBL={code:"ເລກງານ",pattern:"ລວດລາຍ",phone:"ເບີໂທ",cname:"ຊື່",addr:"ທີ່ຢູ່",cnote:"ໝາຍເຫດລູກຄ້າ",brand:"ຍີ່ຫໍ້",model:"ລຸ້ນ",color:"ສີ",lock:"ລະຫັດປົດລັອກ",issues:"ອາການ/ບໍລິການ",conds:"ສະພາບເຄື່ອງ",by:"ຜູ້ຮັບ",note:"ໝາຍເຫດ"};

let rawJobs=[],loaded=false,dirty=false,dsel=new Set(),so="sink",jobs=[],S=normS({}),view="jobs",cur=null,q="",fs="",unsubs=[];
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
const sc=n=>(S.statuses.find(s=>s.n===n)||{c:"#7a8394"}).c,bd=n=>`<span class="badge" style="background:${sc(n)}">${esc(n)}</span>`;
function toast(t){const e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",3000)}
async function save(fn){try{await fn();return true}catch(e){qerr(e,"ບໍ່ສຳເລັດ: ");return false}}
const lsGet=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

// ---- หน้าสถานะสำหรับลูกค้า (QR) ----
const tok=()=>{const a=new Uint8Array(12);crypto.getRandomValues(a);return[...a].map(x=>(x%36).toString(36)).join("")};
async function syncPub(j){
  let t=j.pub;if(!t){t=tok();await updateDoc(J(j.id),{pub:t})}
  const is=(j.issues&&j.issues.length?j.issues:[j.issue]).filter(Boolean);
  await setDoc(doc(fdb,"public",t),{code:j.code,status:j.status,color:sc(j.status),ready:["ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","ສ້ອມແລ້ວ"].includes(j.status),date:j.date,dev:[j.brand,j.model].filter(Boolean).join(" "),issues:is,hist:(j.hist||[]).map(h=>({s:tn(h.s),t:h.t})),conds:(j.conds&&j.conds.length?j.conds:[j.cond]).filter(Boolean),s2:j.step2||null,s3:j.step3||null,shop:S.name,phone:S.phone,fb:S.fb});
  return t;
}
const syncQ=async j=>{try{return await syncPub(j)}catch(e){toast("ອັບເດດໜ້າສະຖານະບໍ່ໄດ້: "+(e.code||e.message));return j.pub||null}};

// ---- เตือนโควตา ----
const DAYLIM=50000,dk=()=>"rd-"+new Date().toISOString().slice(0,10),readsToday=()=>parseInt(lsGet(dk()))||0;
function banner(h,bg){let b=$("#bn");if(!b){b=document.createElement("div");b.id="bn";$("#app").insertBefore(b,$("#m"))}b.style.cssText="background:"+bg+";padding:10px 14px;text-align:center;font-weight:700";b.innerHTML=h}
const consoleUrl="https://console.firebase.google.com/project/"+firebaseConfig.projectId+"/overview";
function quota(){banner(`⚠️ ໂควตาฟรີຂອງ Firebase ເຕັມແລ້ວ — ຕ້ອງອັບເກຣດເປັນແຜນ Blaze ເພື່ອໃຊ້ງານຕໍ່<br><a href="${consoleUrl}" target="_blank">ເປີດ Firebase Console → Usage and billing → Modify plan</a>`,"#ffd6d1")}
function cnt(n){const v=readsToday()+n;lsSet(dk(),String(v));if(v>=DAYLIM*0.7)banner(`⚠️ ການອ່ານຂໍ້ມູນວັນນີ້ໃກ້ເຕັມໂควตາฟรີແລ້ວ (ປະມານ ${v.toLocaleString()} / ${DAYLIM.toLocaleString()}) ຄວນກຽມອັບເກຣດເປັນ Blaze<br><a href="${consoleUrl}" target="_blank">ເປີດ Firebase Console</a>`,"#fff4d1")}
function qerr(e,pre){if(e.code==="resource-exhausted")quota();else toast(pre+(e.code||e.message))}

// ---- Auth ----
$("#lf").onsubmit=async e=>{e.preventDefault();$("#lerr").textContent="";try{await signInWithEmailAndPassword(auth,$("#le").value.trim(),$("#lp").value)}catch(x){$("#lerr").textContent="ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"}};
onAuthStateChanged(auth,u=>{
  const bt=document.getElementById("boot");if(bt)bt.style.display="none";
  unsubs.forEach(f=>f());unsubs=[];
  if(!u){$("#app").style.display="none";$("#login").style.display="flex";return}
  $("#login").style.display="none";$("#app").style.display="flex";
  unsubs.push(onSnapshot(SH,s=>{cnt(1);S=normS(s.exists()?s.data():{});build();refresh()},e=>qerr(e,"ອ່ານການຕັ້ງຄ່າບໍ່ໄດ້: ")));
  unsubs.push(onSnapshot(collection(fdb,"jobs"),s=>{loaded=true;cnt(s.docChanges().length);rawJobs=s.docs.map(d=>({...d.data(),id:d.id}));build();refresh()},e=>qerr(e,"ອ່ານຂໍ້ມູນບໍ່ໄດ້ (ກວດ Rules/UID): ")));
});
function navDraw(){
  const it=[["jobs","📱 ງານທັງໝົດ"],["dash","📊 ພາບລວມ"],["xls","📥 Excel"],["set","⚙️ ຕັ້ງຄ່າ"]],on=(view==="form"||view==="det")?"jobs":view;
  $("#nav").innerHTML="<h1>"+esc(S.name)+"</h1>"+it.map(i=>`<button class="${on===i[0]?"on":""}" onclick="go('${i[0]}')">${i[1]}</button>`).join("")+`<span class="sp"></span><button onclick="logout()">🚪 ອອກ</button>`;
}
function draw(){navDraw();({dash:vDash,jobs:vJobs,form:vForm,det:vDet,set:vSet,xls:vXls})[view]()}
function refresh(){
  navDraw();
  if(view==="form")return;
  if(view==="xls"){xCnt();return}
  if(view==="det"&&dirty)return;
  if(view==="jobs"&&$("#tb")){rows();return}
  const a=document.activeElement;
  if(view==="det"&&a&&$("#m").contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
  draw();
}
const numOf=j=>parseInt((j.code||"").replace(/\D/g,""))||0;
function build(){jobs=rawJobs.map(r=>{const x={...r};x.status=tn(x.status);const n=numOf(r);if(n)x.code=S.prefix+"-"+String(n).padStart(5,"0");return x}).sort((a,b)=>numOf(b)-numOf(a))}
const go=(v,id)=>{dirty=false;view=v;cur=id||null;draw();scrollTo(0,0)};
const logout=()=>signOut(auth);
const stat=s=>{fs=s;q="";go("jobs")};

// ---- งานทั้งหมด (รายชื่อลูกค้า) ----
function filt(){
  const t=q.trim().toLowerCase(),dg=t.replace(/\s/g,"");
  return jobs.filter(j=>{
    if(fs&&j.status!==fs)return false;if(!t)return true;
    if(/^\d+$/.test(dg)){const n=parseInt(dg,10),cn=parseInt((j.code||"").replace(/\D/g,""),10);return(j.phone||"").includes(dg)||(n>0&&cn===n)}
    return[j.code,j.cname,j.phone,j.brand,j.model].join(" ").toLowerCase().includes(t)});
}
const jrow=j=>`<div class="jr" onclick="go('det','${j.id}')"><div class="cd">${esc(j.code)}</div><div class="nm"><b>${esc(j.cname)}</b><small>${esc(j.phone)}${j.brand||j.model?" · "+esc(((j.brand||"")+" "+(j.model||"")).trim()):""}${j.tech?" · 🔧"+esc(j.tech):""}</small></div>${bd(j.status)}</div>`;
function sortJ(L){const sk=new Set(S.statuses.filter(x=>x.d).map(x=>x.n)),cd=(a,b)=>numOf(b)-numOf(a);
  if(so==="old")return[...L].sort((a,b)=>-cd(a,b));if(so==="new")return[...L].sort(cd);
  if(so==="status"){const ix=n=>{const i=S.statuses.findIndex(x=>x.n===n);return i<0?99:i};return[...L].sort((a,b)=>ix(a.status)-ix(b.status)||cd(a,b))}
  return[...L].sort((a,b)=>(sk.has(a.status)-sk.has(b.status))||cd(a,b))}
function rows(){const e=$("#tb");if(!e)return;const L=sortJ(filt());
  e.innerHTML=L.slice(0,200).map(jrow).join("")||`<p style="color:var(--mu)">${loaded?"ບໍ່ພົບລາຍການ":"ກຳລັງໂຫຼດຂໍ້ມູນ…"}</p>`}
function vJobs(){
  $("#m").innerHTML=`<button class="btn big" onclick="go('form')">+ ຮັບເຄື່ອງໃໝ່</button>
<div class="card"><div class="row"><input id="qi" placeholder="ຄົ້ນຫາ: ເບີໂທ / ຊື່ / ລະຫັດ (ເຊັ່ນ 150)" value="${esc(q)}" oninput="setq(this.value)"><select onchange="setfs(this.value)"><option value="">ທຸກສະຖານະ</option>${S.statuses.map(s=>`<option ${fs===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select><select onchange="setso(this.value)">${[["sink","ລຽງ: ງານທີ່ຮັບແລ້ວລົງລຸ່ມ"],["new","ໃໝ່ສຸດກ່ອນ"],["old","ເກົ່າສຸດກ່ອນ"],["status","ຕາມສະຖານະ"]].map(o=>`<option value="${o[0]}" ${so===o[0]?"selected":""}>${o[1]}</option>`).join("")}</select></div><div id="tb" style="margin-top:8px"></div></div>`;rows();
}
const setq=v=>{q=v;rows()},setfs=v=>{fs=v;rows()},setso=v=>{so=v;rows()};

// ---- ภาพรวม ----
function vDash(){
  const c=S.statuses.map(x=>[x.n,x.c,jobs.filter(j=>j.status===x.n).length]),all=dsel.size===S.statuses.length&&dsel.size>0;
  const L=sortJ(all?jobs:jobs.filter(j=>dsel.has(j.status)));
  $("#m").innerHTML=`<button class="btn big" onclick="go('form')">+ ຮັບເຄື່ອງໃໝ່</button><h2>ພາບລວມ</h2>
<div class="grid"><div class="stat${all?" on":""}" style="border-left-color:#12306b" onclick="dall()"><b>${jobs.length}</b><span>ທັງໝົດ</span></div>${c.map(x=>`<div class="stat${dsel.has(x[0])?" on":""}" style="border-left-color:${x[1]}" data-s="${esc(x[0])}" onclick="dtg(this.dataset.s)"><b>${x[2]}</b><span>${esc(x[0])}</span></div>`).join("")}</div>
<div class="card" style="margin-top:12px">${dsel.size?`<b>${L.length} ງານ</b>`+L.slice(0,200).map(jrow).join(""):'<span style="color:var(--mu)">ແຕະບັດສະຖານະ (ເລືອກໄດ້ຫຼາຍອັນ) ເພື່ອເບິ່ງລາຍຊື່ງານ — ແຕະ "ທັງໝົດ" ເພື່ອເບິ່ງທຸກງານ</span>'}</div>`;
}
const dtg=n=>{dsel.has(n)?dsel.delete(n):dsel.add(n);vDash()},dall=()=>{if(dsel.size===S.statuses.length)dsel.clear();else S.statuses.forEach(x=>dsel.add(x.n));vDash()};

// ---- ฟอร์มรับเครื่อง ----
function chips(id,list,sel,multi,col){
  const all=[...list,...sel.filter(v=>!list.includes(v))];
  return`<div class="chips" id="${id}" data-m="${multi?1:0}">${all.map(v=>`<button type="button" class="chip${col?" sw":""}${sel.includes(v)?" on":""}" data-v="${esc(v)}" onclick="tg(this)">${col?`<i style="background:${esc((S.colors.find(c=>c.n===v)||{c:"#ccc"}).c)}"></i>`:""}${esc(v)}</button>`).join("")||'<span style="color:var(--mu);font-size:13px">ຍັງບໍ່ມີ — ກົດ ＋ ເພື່ອເພີ່ມ</span>'}</div>`}
const pl=(k,t)=>`<label>${t} <a class="pl" onclick="qt('${k}')">＋</a></label><div class="inl qr" id="qr_${k}" style="display:none"><input id="qa_${k}" placeholder="ຊື່ໃໝ່..." onkeydown="if(event.key==='Enter'){event.preventDefault();qa('${k}')}"><button type="button" class="btn" onclick="qa('${k}')">ເພີ່ມ</button></div>`;
function tg(b){const p=b.parentElement;if(p.dataset.m==="1")b.classList.toggle("on");else{const was=b.classList.contains("on");p.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));if(!was)b.classList.add("on")}}
const getSel=id=>[...document.querySelectorAll("#"+id+" .chip.on")].map(b=>b.dataset.v);
function opts(list,val,ph){const all=[...list,...(val&&!list.includes(val)?[val]:[])];return`<option value="">${ph}</option>`+all.map(v=>`<option ${v===val?"selected":""}>${esc(v)}</option>`).join("")}
const PC=[17,50,83];let pat=[],picCache={},saving=false;const P={1:{p:[],g:[]},2:{p:[],g:[]},3:{p:[],g:[]}};
function vForm(){
  const j=cur?jobs.find(x=>x.id===cur):{},v=k=>esc(j[k]||"");
  const is=j.issues||(j.issue?[j.issue]:[]),cs=j.conds||(j.cond?[j.cond]:[]),by=cur?(j.by||""):lsGet("lastBy");
  const st=cur?j.status:((S.statuses.find(s=>s.n==="ລໍຖ້າດຳເນີນການ")||S.statuses[0]).n);
  const num=cur?(parseInt((j.code||"").replace(/\D/g,""))||""):(jobs.reduce((a,x)=>Math.max(a,parseInt((x.code||"").replace(/\D/g,""))||0),0)+1);
  pat=[...(j.pattern||[])];P[1]={p:[],g:[]};
  $("#m").innerHTML=`<h2>${cur?"ແກ້ໄຂງານ "+esc(j.code):"ຮັບເຄື່ອງໃໝ່"}</h2><div class="card"><datalist id="dl">${[...new Map(jobs.map(x=>[x.phone,x])).values()].map(x=>`<option value="${esc(x.phone)}">${esc(x.cname)}</option>`).join("")}</datalist>
<label>ເລກງານ (ແກ້ໄຂໄດ້)</label><div class="inl"><span style="align-self:center;font-weight:700">${esc(S.prefix)}-</span><input id="f_code" inputmode="numeric" value="${num}" oninput="this.value=this.value.replace(/\D/g,'')"></div>
<hr><b>ລູກຄ້າ</b><div class="two"><div><label>ເບີໂທ * (ຕົວເລກເທົ່ານັ້ນ)</label><input id="f_phone" list="dl" inputmode="numeric" value="${v("phone")}" oninput="this.value=this.value.replace(/\D/g,'')" onchange="fill(this.value)"></div><div><label>ຊື່ລູກຄ້າ *</label><input id="f_cname" value="${v("cname")}"></div></div>
<label>ທີ່ຢູ່ (ບໍ່ບັງຄັບ)</label><input id="f_addr" value="${v("addr")}"><label>ໝາຍເຫດລູກຄ້າ</label><input id="f_cnote" value="${v("cnote")}">
<hr><b>ໂທລະສັບ</b><div class="two"><div>${pl("brands","ຍີ່ຫໍ້")}<select id="f_brand">${opts(S.brands,j.brand||"","— ເລືອກຍີ່ຫໍ້ —")}</select></div><div><label>ລຸ້ນ</label><input id="f_model" value="${v("model")}"></div></div>
<label>ສີ <a class="pl" onclick="qt('colors')">＋</a></label><div class="inl qr" id="qr_colors" style="display:none"><input type="color" id="qa_cc" value="#808080" style="max-width:60px;padding:2px"><input id="qa_colors" placeholder="ຊື່ສີ ເຊັ່ນ ຂຽວ" onkeydown="if(event.key==='Enter'){event.preventDefault();qac()}"><button type="button" class="btn" onclick="qac()">ເພີ່ມ</button></div>${chips("g_color",S.colors.map(c=>c.n),j.color?[j.color]:[],false,true)}
<label>ລະຫັດປົດລັອກໜ້າຈໍ (ຕົວເລກ / ຕົວອັກສອນ)</label><input id="f_lock" value="${v("lock")}">
<label>ຫຼື ລວດລາຍປົດລັອກ (ແຕ້ມໃສ່ກະດານນີ້)</label><div class="row" style="align-items:flex-end;flex-wrap:nowrap"><svg id="pad" viewBox="0 0 100 100" style="width:170px;height:170px;flex:none;min-width:0;touch-action:none;background:#f3f5f9;border:1px solid var(--bd);border-radius:12px"></svg><button type="button" class="btn g" style="flex:none" onclick="padClear()">ລ້າງ</button></div>
${pl("issues","ອາການເສຍ / ງານທີ່ໃຫ້ເຮັດ * (ເລືອກໄດ້ຫຼາຍອັນ)")}${chips("g_issues",S.issues,is,true)}
${pl("conds","ສະພາບເຄື່ອງກ່ອນຮັບ")}${chips("g_conds",S.conds,cs,true)}
<hr><div class="two"><div>${pl("staff","ຜູ້ຮັບເຄື່ອງ")}<select id="f_by">${opts(S.staff,by,S.staff.length?"— ເລືອກ —":"(ກົດ ＋ ເພື່ອເພີ່ມຊື່)")}</select></div><div><label>ສະຖານະ</label><select id="f_status">${S.statuses.map(s=>`<option ${st===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select></div></div>
<label>ໝາຍເຫດເພີ່ມເຕີມ</label><textarea id="f_note">${v("note")}</textarea>
<hr><b>ຮູບສະພາບເຄື່ອງ (ຂັ້ນຕອນສຸດທ້າຍ)</b><div class="row" style="margin-top:6px"><button type="button" class="btn g" onclick="document.getElementById('cam').click()">📷 ຖ່າຍຮູບ</button><button type="button" class="btn g" onclick="document.getElementById('gal').click()">🖼 ເລືອກຮູບຈາກເຄື່ອງ</button></div>
<input type="file" id="cam" accept="image/*" capture="environment" style="display:none" onchange="addPics(this.files);this.value=''"><input type="file" id="gal" accept="image/*" multiple style="display:none" onchange="addPics(this.files);this.value=''">
<div class="chips" id="pics" style="gap:8px;margin-top:8px"></div>
<div class="row" style="margin-top:14px"><button class="btn" style="padding:13px;font-size:16px" onclick="saveJob()">✅ ຢືນຢັນ ບັນທຶກ</button><button class="btn g" onclick="${cur?`go('det','${cur}')`:`go('jobs')`}">ຍົກເລີກ</button></div></div>`;
  drawPad();setupPad();drawPics();if(cur)loadPics(cur);
}
// ลวดลายปลดล็อก
const drawPad=()=>{const p=$("#pad");if(p)p.innerHTML=patInner(pat,true)};
function setupPad(){const p=$("#pad");let down=false;
  const hit=e=>{const r=p.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;for(let i=1;i<=9;i++)if(Math.hypot(x-PC[(i-1)%3],y-PC[Math.floor((i-1)/3)])<14)return i;return 0};
  const add=i=>{if(!i||pat.includes(i))return;const l=pat[pat.length-1];if(l){const r1=Math.floor((l-1)/3),c1=(l-1)%3,r2=Math.floor((i-1)/3),c2=(i-1)%3;if((r1-r2)%2===0&&(c1-c2)%2===0&&!(r1===r2&&c1===c2)){const m=((r1+r2)/2)*3+(c1+c2)/2+1;if(!pat.includes(m))pat.push(m)}}pat.push(i);drawPad()};
  p.onpointerdown=e=>{e.preventDefault();p.setPointerCapture(e.pointerId);pat=[];down=true;drawPad();add(hit(e))};
  p.onpointermove=e=>{if(down)add(hit(e))};p.onpointerup=p.onpointercancel=()=>{down=false};}
const padClear=()=>{pat=[];drawPad()};
// รูปภาพ
function resize(f){return new Promise((ok,no)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const k=Math.min(1,960/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);let q=.62,d=c.toDataURL("image/jpeg",q);while(d.length>520000&&q>.3){q-=.1;d=c.toDataURL("image/jpeg",q)}ok(d)};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error("img"))};im.src=u})}
async function addPics(fs,st=1){const a=P[st].p;for(const f of fs){if(a.length>=6){toast("ສູງສຸດ 6 ຮູບຕໍ່ຂັ້ນຕອນ");break}try{a.push({d:await resize(f)})}catch(e){toast("ອ່ານຮູບບໍ່ໄດ້")}}drawPics(st)}
function drawPics(st=1){const e=$("#pics"+(st>1?st:""));if(e)e.innerHTML=P[st].p.map((p,i)=>`<div class="ph"><img src="${p.d}"><b onclick="rmPic(${i},${st})">×</b></div>`).join("")}
function rmPic(i,st=1){const p=P[st].p[i];if(p.id)P[st].g.push(p.id);P[st].p.splice(i,1);drawPics(st)}
const phLoad=async id=>{if(!picCache[id]){const s=await getDocs(collection(fdb,"jobs",id,"photos"));picCache[id]=s.docs.map(d=>({id:d.id,d:d.data().d,t:d.data().t||"",s:d.data().s||1})).sort((a,b)=>a.t.localeCompare(b.t));cnt(s.size)}return picCache[id]};
async function loadPics(id){try{const L=await phLoad(id);if(view==="form"&&cur===id){P[1].p=[...L.filter(p=>p.s===1).map(p=>({id:p.id,d:p.d})),...P[1].p.filter(x=>!x.id)];drawPics(1)}}catch(e){}}
async function showPics(id){try{const L=await phLoad(id);if(view!=="det"||cur!==id)return;const a=L.filter(p=>p.s===1);
  if(a.length&&$("#phc")){$("#phc").style.display="block";$("#phl").innerHTML=a.map(p=>`<div class="ph"><img src="${p.d}" onclick="viewPic('${p.id}')"></div>`).join("")}
  for(const n of[2,3]){if(!$("#pics"+n))continue;P[n]={p:L.filter(p=>p.s===n).map(p=>({id:p.id,d:p.d})),g:[]};drawPics(n)}}catch(e){}}
function viewPic(pid){const p=(picCache[cur]||[]).find(x=>x.id===pid);if(!p)return;const d=document.createElement("div");d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:30;display:flex;align-items:center;justify-content:center";d.onclick=()=>d.remove();d.innerHTML=`<img src="${p.d}" style="max-width:96vw;max-height:96vh">`;document.body.appendChild(d)}
async function savePics(id,st=1){const o=P[st];for(const g of o.g)await deleteDoc(doc(fdb,"jobs",id,"photos",g));for(const p of o.p.filter(x=>!x.id))await setDoc(doc(collection(fdb,"jobs",id,"photos")),{d:p.d,t:new Date().toISOString(),s:st});o.g=[];delete picCache[id]}
// ขั้นตอน 2 / 3
const dz=()=>{dirty=true};
function stepCard(j,n){const k=n===2?"foundL":"afterL",t=n===2?"ອັບເດດຫຼັງແກະເຄື່ອງ":"ສະພາບຫຼັງສ້ອມສຳເລັດ",d=j["step"+n]||{items:[],note:""};
  return`<div class="card"><b>ຂັ້ນຕອນ ${n}: ${t}</b> <small style="color:var(--mu)">${d.t?"(ບັນທຶກ "+fd(d.t)+" "+ft(d.t)+")":"(ບໍ່ບັງຄັບ)"}</small>
${pl(k,"ຕິກລາຍການ")}${chips("g_s"+n,S[k],d.items||[],true)}
<label>ໝາຍເຫດ (ລູກຄ້າເຫັນຂໍ້ຄວາມນີ້ໃນໜ້າສະຖານະ)</label><textarea id="sn${n}">${esc(d.note||"")}</textarea>
<label>ຮູບ</label><div class="row"><button type="button" class="btn g" onclick="document.getElementById('cam${n}').click()">📷 ຖ່າຍຮູບ</button><button type="button" class="btn g" onclick="document.getElementById('gal${n}').click()">🖼 ເລືອກຮູບ</button></div>
<input type="file" id="cam${n}" accept="image/*" capture="environment" style="display:none" onchange="addPics(this.files,${n});this.value=''"><input type="file" id="gal${n}" accept="image/*" multiple style="display:none" onchange="addPics(this.files,${n});this.value=''">
<div class="chips" id="pics${n}" style="gap:8px;margin-top:8px"></div>
<button class="btn" style="margin-top:10px" onclick="saveStep('${j.id}',${n})">ບັນທຶກຂັ້ນຕອນ ${n}</button></div>`}
async function saveStep(id,n){const j=jobs.find(x=>x.id===id);if(!j)return;
  const st={items:getSel("g_s"+n),note:$("#sn"+n).value.trim(),t:new Date().toISOString()};
  if(await save(async()=>{await updateDoc(J(id),{["step"+n]:st,log:[...(j.log||[]),{t:st.t,f:["ຂັ້ນຕອນ "+n]}]});await savePics(id,n)})){await syncQ({...j,["step"+n]:st});dirty=false;toast("ບັນທຶກຂັ້ນຕອນ "+n+" ແລ້ວ");if(view==="det"&&cur===id)draw()}}
// เพิ่มรายการในหน้ารับเครื่อง
const QA={foundL:["chip","g_s2"],afterL:["chip","g_s3"],brands:["sel","f_brand"],staff:["sel","f_by"],issues:["chip","g_issues"],conds:["chip","g_conds"]};
function qt(k){const r=$("#qr_"+k);r.style.display=r.style.display==="none"?"flex":"none";if(r.style.display==="flex")$("#qa_"+k).focus()}
async function qa(k){
  const i=$("#qa_"+k),v=i.value.trim();if(!v)return;
  if(!S[k].includes(v)){if(!await save(()=>setDoc(SH,{...S,[k]:[...S[k],v]})))return;if(!S[k].includes(v))S[k]=[...S[k],v]}
  i.value="";const[t,id]=QA[k],el=$("#"+id);
  if(t==="sel"){if(![...el.options].some(o=>o.value===v))el.add(new Option(v,v));el.value=v}
  else{const ex=[...el.querySelectorAll(".chip")].find(b=>b.dataset.v===v);if(ex)ex.classList.add("on");else{const h=el.querySelector("span");if(h)h.remove();el.insertAdjacentHTML("beforeend",`<button type="button" class="chip on" data-v="${esc(v)}" onclick="tg(this)">${esc(v)}</button>`)}}
}
async function qac(){const n=$("#qa_colors").value.trim(),c=$("#qa_cc").value;if(!n)return;
  if(!S.colors.some(x=>x.n===n)){const a=[...S.colors,{n,c}];if(!await save(()=>setDoc(SH,{...S,colors:a})))return;if(!S.colors.some(x=>x.n===n))S.colors=a}
  $("#qa_colors").value="";const el=$("#g_color");el.querySelectorAll(".chip").forEach(b=>b.classList.remove("on"));
  const ex=[...el.querySelectorAll(".chip")].find(b=>b.dataset.v===n);if(ex)ex.classList.add("on");else el.insertAdjacentHTML("beforeend",`<button type="button" class="chip sw on" data-v="${esc(n)}" onclick="tg(this)"><i style="background:${esc(c)}"></i>${esc(n)}</button>`)}
const fill=p=>{const o=jobs.find(x=>x.phone===p);if(o&&!$("#f_cname").value){$("#f_cname").value=o.cname||"";$("#f_addr").value=o.addr||""}};
async function saveJob(){
  if(saving)return;
  const o={};["phone","cname","addr","cnote","brand","model","lock","by","status","note"].forEach(k=>o[k]=$("#f_"+k).value.trim());
  o.phone=o.phone.replace(/\D/g,"");o.color=getSel("g_color")[0]||"";
  o.issues=getSel("g_issues");o.issue=o.issues.join(", ");o.conds=getSel("g_conds");o.cond=o.conds.join(", ");o.pattern=[...pat];
  if(!o.phone||!o.cname||!o.issues.length){toast("ກະລຸນາໃສ່ເບີໂທ, ຊື່ ແລະ ເລືອກອາການເສຍ");return}
  const n=parseInt($("#f_code").value,10);if(!n||n<1){toast("ກະລຸນາໃສ່ເລກງານ");return}
  o.code=S.prefix+"-"+String(n).padStart(5,"0");
  if(jobs.some(x=>numOf(x)===n&&x.id!==cur)){toast("ເລກງານ "+o.code+" ມີແລ້ວ");return}
  if(o.by)lsSet("lastBy",o.by);
  saving=true;
  try{
    const now=new Date().toISOString(),s=x=>Array.isArray(x)?x.join("|"):String(x||"");
    if(cur){const j=jobs.find(x=>x.id===cur),h=[...(j.hist||[])];if(o.status!==j.status)h.push({s:o.status,t:now});
      const ch=Object.keys(o).filter(k=>!["status","issue","cond"].includes(k)).filter(k=>s(j[k])!==s(o[k])).map(k=>LBL[k]||k);
      const log=ch.length?[...(j.log||[]),{t:now,f:ch}]:(j.log||[]);
      if(await save(async()=>{await updateDoc(J(cur),{...o,hist:h,log});await savePics(cur)})){await syncQ({...j,...o,hist:h});toast("ບັນທຶກແລ້ວ");go("det",cur)}}
    else{const ref=doc(collection(fdb,"jobs")),hist=[{s:o.status,t:now}];
      if(await save(async()=>{await setDoc(ref,{...o,date:now,hist,log:[],acct:[]});await savePics(ref.id)})){await syncQ({...o,id:ref.id,date:now,hist});toast("ບັນທຶກແລ້ວ "+o.code);go("det",ref.id);askTech(ref.id)}}
  }finally{saving=false}
}
// มอบหมายช่าง
function closeMd(){const m=$("#md");if(m)m.remove()}
function askTech(id){closeMd();const md=document.createElement("div");md.id="md";md.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:20;display:flex;align-items:center;justify-content:center;padding:14px";
  md.innerHTML=`<div class="card" style="width:min(420px,100%);max-height:90vh;overflow:auto;margin:0"><b style="font-size:18px">ເຄື່ອງນີ້ໃຫ້ໃຜເຮັດ?</b><div class="chips" style="margin-top:10px;gap:8px">${S.staff.map(n=>`<button class="chip sw" data-v="${esc(n)}" onclick="setTech('${id}',this.dataset.v)">🔧 ${esc(n)}</button>`).join("")||'<span style="color:var(--mu)">ຍັງບໍ່ມີຊື່ — ເພີ່ມດ້ານລຸ່ມ</span>'}</div>
<div class="inl" style="margin-top:12px"><input id="mt_n" placeholder="＋ ເພີ່ມຊື່ໃໝ່" onkeydown="if(event.key==='Enter')mtAdd('${id}')"><button class="btn g" onclick="mtAdd('${id}')">ເພີ່ມ</button></div>
<button class="btn g" style="width:100%;margin-top:12px" onclick="closeMd()">ບໍ່ມອບໃຫ້ໃຜ / ປິດ</button></div>`;document.body.appendChild(md)}
async function setTech(id,n){const j=jobs.find(x=>x.id===id);if(!j){closeMd();return}
  if(await save(()=>updateDoc(J(id),{tech:n,log:[...(j.log||[]),{t:new Date().toISOString(),f:[n?"ມອບໃຫ້ "+n:"ຍົກເລີກການມອບໝາຍ"]}]}))){closeMd();toast(n?"ມອບໃຫ້ "+n+" ແລ້ວ":"ຍົກເລີກແລ້ວ")}}
async function mtAdd(id){const i=$("#mt_n"),v=i.value.trim();if(!v)return;if(!S.staff.includes(v)){if(!await save(()=>setDoc(SH,{...S,staff:[...S.staff,v]})))return}setTech(id,v)}
const chTech=id=>setTech(id,$("#tc").value);
// ---- รายละเอียดงาน ----
const doneDate=j=>{const h=[...(j.hist||[])].reverse().find(x=>DONE.includes(tn(x.s)));return h?h.t:""};
function vDet(){
  const j=jobs.find(x=>x.id===cur);if(!j){$("#m").innerHTML="ກຳລັງໂຫຼດ… <button class='btn g' onclick=\"go('jobs')\">ກັບ</button>";return}
  const L=(a,b)=>b?`<div><label>${a}</label>${esc(b)}</div>`:"",a0=(j.acct||[])[0]||{};
  const is=(j.issues&&j.issues.length?j.issues:[j.issue]).filter(Boolean).join(", "),cs=(j.conds&&j.conds.length?j.conds:[j.cond]).filter(Boolean).join(", ");
  const u=a0.u||"",dm=DOM.find(d=>u.toLowerCase().endsWith(d)),un=dm?u.slice(0,-dm.length):u,dsel=dm||(u?"":DOM[0]);
  $("#m").innerHTML=`<div class="row" style="margin-bottom:10px"><button class="btn g" onclick="go('jobs')">← ກັບ</button><button class="btn g" onclick="go('form','${j.id}')">ແກ້ໄຂທັງໝົດ</button><button class="btn r" onclick="delJob('${j.id}')">ລົບ</button></div>
<div class="card hd"><div class="row"><div style="flex:3"><div class="big1">${esc(j.code)}</div><div class="cn">${esc(j.cname)}</div><div>📞 ${esc(j.phone)}</div>${j.tech?`<div>🔧 ຊ່າງ: <b>${esc(j.tech)}</b></div>`:""}</div><div style="flex:none;text-align:right">${bd(j.status)}<br><button class="btn" style="margin-top:8px" onclick="qEdit('${j.id}')">✏️ ແກ້ໄຂ</button></div></div></div>
<div class="card"><div class="two">${L("ຍີ່ຫໍ້ / ລຸ້ນ / ສີ",[j.brand,j.model,j.color].filter(Boolean).join(" "))}${j.lock||(j.pattern&&j.pattern.length)?`<div><label>ລະຫັດປົດລັອກ</label>${esc(j.lock||"")}${j.pattern&&j.pattern.length?`<div>${patSvg(j.pattern,110,true)}</div>`:""}</div>`:""}${L("ອາການ / ບໍລິການ",is)}${L("ສະພາບເຄື່ອງ",cs)}${L("ວັນທີ / ເວລາຮັບ",fd(j.date)+" "+ft(j.date))}${L("ຜູ້ຮັບເຄື່ອງ",j.by)}${L("ທີ່ຢູ່",j.addr)}${L("ໝາຍເຫດລູກຄ້າ",j.cnote)}${L("ໝາຍເຫດ",j.note)}${L("IMEI",j.imei)}</div></div>
<div id="svc" oninput="dz()" onclick="dz()"><div class="card"><b>ບໍລິການ / ອາການ</b> <small style="color:var(--mu)">ເພີ່ມພາຍຫຼັງໄດ້ ຖ້າລູກຄ້າຕັດສິນໃຈເພີ່ມ</small>${pl("issues","ເລືອກບໍລິການ")}${chips("g_issues",S.issues,j.issues||(j.issue?[j.issue]:[]),true)}<button class="btn" style="margin-top:10px" onclick="saveSvc('${j.id}')">ບັນທຶກບໍລິການ</button></div></div>
<div class="card" id="phc" style="display:none"><b>ຮູບກ່ອນຮັບ (ຂັ້ນຕອນ 1)</b><div class="chips" id="phl" style="gap:8px;margin-top:6px"></div></div>
<div class="card"><b>ປ່ຽນສະຖານະ</b><div class="row"><select id="ns">${S.statuses.map(s=>`<option ${s.n===j.status?"selected":""}>${esc(s.n)}</option>`).join("")}</select><button class="btn" onclick="chSt('${j.id}')">ອັບເດດ</button></div>
<label>ຊ່າງຜູ້ເຮັດ</label><div class="row"><select id="tc">${opts(S.staff,j.tech||"","— ບໍ່ມີ —")}</select><button class="btn g" onclick="chTech('${j.id}')">ມອບໝາຍ</button></div>
<div style="margin-top:8px;color:#667085;font-size:13px">${[...(j.hist||[]).map(h=>[h.t,"ສະຖານະ → "+tn(h.s)]),...(j.log||[]).map(l=>[l.t,"ແກ້ໄຂ: "+l.f.join(", ")])].sort((a,b)=>b[0].localeCompare(a[0])).map(h=>`${fd(h[0])} ${ft(h[0])} — ${esc(h[1])}`).join("<br>")}</div></div>
<div id="stp" oninput="dz()" onclick="dz()">${stepCard(j,2)}${stepCard(j,3)}</div>
<div class="card"><b>ສົ່ງສະຖານະໃຫ້ລູກຄ້າ</b><div class="row" style="margin-top:8px"><button class="btn g" onclick="showQr('${j.id}')">📱 ສະແດງ QR</button><button class="btn g" onclick="sendLink('${j.id}','copy')">ສຳເນົາຂໍ້ຄວາມ + ລິ້ງ</button><button class="btn" style="background:#128c4a" onclick="sendLink('${j.id}','wa')">ສົ່ງທາງ WhatsApp</button></div></div>
<div class="card"><b>ພິມເອກະສານ</b><div class="row" style="margin-top:8px"><button class="btn g" onclick="pr('stk','${j.id}')">1. ສະຕິກເກີ (30x40)</button><button class="btn g" onclick="pr('rec','${j.id}')">2. ໃບຮັບເຄື່ອງ</button><button class="btn g" onclick="pr('acc','${j.id}')">3. ຂໍ້ມູນລູກຄ້າ / ລະຫັດອີເມວ</button></div></div>
<div class="card"><b>ຂໍ້ມູນລູກຄ້າ / ລະຫັດອີເມວ (ສຳລັບໃບທີ 3)</b><label>ອີເມວ</label><div class="inl"><input id="a_u" value="${esc(un)}" placeholder="ຊື່ອີເມວ"><select id="a_d">${DOM.map(d=>`<option ${d===dsel?"selected":""}>${d}</option>`).join("")}<option value="" ${dsel===""?"selected":""}>(ພິມເອງທັງໝົດ)</option></select></div>
<label>ລະຫັດຜ່ານ (ບໍ່ບັນທຶກລົງລະບົບ ໃຊ້ສຳລັບພິມເທົ່ານັ້ນ)</label><input id="a_p" autocomplete="off">
<div class="row" style="margin-top:8px"><button class="btn g" onclick="saveAcct('${j.id}')">ບັນທຶກອີເມວ</button><button class="btn" onclick="pr('acc','${j.id}')">ພິມໃບຂໍ້ມູນ</button></div></div>`;P[2]={p:[],g:[]};P[3]={p:[],g:[]};showPics(j.id);
}
const em=()=>{const u=$("#a_u").value.trim(),d=$("#a_d").value;return!u?"":u.includes("@")?u:u+d};
const ppGet=k=>{try{return JSON.parse(lsGet("pp-"+k))||{}}catch(e){return{}}};
let pvx=null;
const PV={stk:[30,40,30,40,3],rec:[110,70,210,297,.85],acc:[210,297,210,297,.45]};
async function pr(k,id){const j=jobs.find(x=>x.id===id),x={done:doneDate(j)};
  if(k==="acc"){x.pw=$("#a_p")?.value||"";x.email=em()}else{const t=await syncQ(j);if(t)x.url=new URL("status.html?t="+t,location.href).href}
  x.opt=ppGet(k);x.preview=pv=>showPv(pv);pvx={k,j,x};printDoc(k,j,S,toast,x)}
function showPv(pv){
  pvx.html=pv.html;pvx.htmlBar=pv.htmlBar;const k=pvx.k,[vw,vh,pw,ph,z]=PV[k],o=pvx.x.opt,px=n=>Math.round(n*3.7795*z);
  let m=$("#pv");
  if(m&&m.dataset.k===k){$("#pvi").srcdoc=pv.html;return}
  closePv();m=document.createElement("div");m.id="pv";m.dataset.k=k;m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:25;display:flex;align-items:center;justify-content:center;padding:10px";
  m.innerHTML=`<div class="card" style="width:min(580px,100%);max-height:96vh;overflow:auto;margin:0"><b>ຕົວຢ່າງກ່ອນພິມ</b> <small style="color:var(--mu)">ຂະໜາດກະດາດ ${esc(pv.page)}</small>
<div style="margin:8px 0;background:#e9edf3;border-radius:8px;overflow:auto;padding:8px"><div style="width:${px(vw)}px;height:${px(vh)}px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px #c9d3e6"><iframe id="pvi" style="border:0;width:${pw}mm;height:${ph}mm;transform:scale(${z});transform-origin:0 0;background:#fff"></iframe></div></div>
<div class="row"><div><label>ຂະໜາດ %</label><input type="number" id="pp_s" value="${o.s||100}" step="5" min="50" max="150" onchange="ppSet()"></div><div><label>ຍ້າຍຂວາ (mm)</label><input type="number" id="pp_x" value="${o.dx||0}" step="1" min="-30" max="30" onchange="ppSet()"></div><div><label>ຍ້າຍລົງ (mm)</label><input type="number" id="pp_y" value="${o.dy||0}" step="1" min="-30" max="30" onchange="ppSet()"></div></div>
<p style="color:var(--mu);font-size:12px;margin:8px 0">ກົດ 🖨 ພິມ → ເລືອກເຄື່ອງພິມ ແລະ ຂະໜາດກະດາດໃນໜ້າຕ່າງພິມ (ຕັ້ງຂະໜາດເລີ່ມຕົ້ນໃຫ້ແລ້ວ). ຖ້າພິມເລື່ອນ ໃຫ້ປັບ ຂະໜາດ / ຍ້າຍ ແລ້ວພິມໃໝ່. ຄ່າທີ່ປັບຈະຖືກຈື່ໄວ້</p>
${k==="stk"?`<div style="margin:6px 0;padding:10px;border:1px solid var(--bd);border-radius:10px"><b>ເຄື່ອງພິມ Bluetooth?</b><div style="color:var(--mu);font-size:12px">ເຄື່ອງພິມ Bluetooth ຈະບໍ່ປາກົດໃນໜ້າຕ່າງພິມຂອງ iPhone. ກົດປຸ່ມລຸ່ມນີ້ ແລ້ວເລືອກແອັບຂອງເຄື່ອງພິມ (ຂະໜາດ 30×40 mm)</div><div class="row" style="margin-top:6px;align-items:center"><img id="stkimg" style="width:90px;flex:none;min-width:0;border:1px solid var(--bd)"><button class="btn" onclick="stkShare()">📤 ສົ່ງໄປແອັບເຄື່ອງພິມ / ບັນທຶກຮູບ</button></div></div>`:""}<div class="row"><button class="btn" style="padding:13px;font-size:16px" onclick="pvPrint()">🖨 ພິມ</button><button class="btn g" onclick="ppReset()">ຣີເຊັດ</button><button class="btn g" onclick="closePv()">ປິດ</button></div></div>`;
  document.body.appendChild(m);$("#pvi").srcdoc=pv.html;
  if(k==="stk"){const j=pvx.j;stkCanvas(j).toBlob(b=>{pvx.blob=b;const im=$("#stkimg");if(im&&b)im.src=URL.createObjectURL(b)},"image/png")}}
// สติกเกอร์เป็นรูป PNG สำหรับเครื่องพิมพ์บลูทูธ (ส่งเข้าแอปของเครื่องพิมพ์)
function stkCanvas(j){
  const W=480,H=640,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d"),pad=18,w=W-2*pad;
  const F=(px,b)=>`${b?"700 ":""}${px}px 'Phetsarath OT','Noto Sans Lao','Lao Sangam MN',sans-serif`;
  const ch=t=>window.Intl&&Intl.Segmenter?[...new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(t)].map(x=>x.segment):[...t];
  const ell=(t,mw)=>{t=String(t||"");if(g.measureText(t).width<=mw)return t;let a=ch(t);while(a.length&&g.measureText(a.join("")+"…").width>mw)a.pop();return a.join("")+"…"};
  g.fillStyle="#fff";g.fillRect(0,0,W,H);g.fillStyle="#000";g.textBaseline="top";
  g.font=F(44,1);g.textAlign="right";g.fillText(j.code||"",W-pad,12);const cw=g.measureText(j.code||"").width;
  g.textAlign="left";g.font=F(46,1);g.fillText(ell(j.cname,w-cw-14),pad,12);
  const line=(a,b,y)=>{g.font=F(30,0);g.fillText(a,pad,y);const lw=g.measureText(a+" ").width;g.font=F(32,1);g.fillText(ell(b,w-lw),pad+lw,y)};
  line("ເບີ:",j.phone,76);line("ລຸ້ນ / ສີ:",[j.brand,j.model,j.color].filter(Boolean).join(" "),116);
  const hasP=j.pattern&&j.pattern.length>0;line("ລະຫັດ:",j.lock||"",156);
  let yh=204;
  if(hasP){const bx=W-pad-104,by=150,k=104/100,pt=i=>[bx+[17,50,83][(i-1)%3]*k,by+[17,50,83][Math.floor((i-1)/3)]*k];
    g.strokeStyle="#000";g.lineWidth=5;g.lineJoin="round";g.lineCap="round";if(j.pattern.length>1){g.beginPath();j.pattern.forEach((i,n)=>{const[x,y]=pt(i);n?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}
    for(let i=1;i<=9;i++){const[x,y]=pt(i),n=j.pattern.indexOf(i);g.beginPath();g.arc(x,y,n===0?11:n>0?7:5,0,7);g.fillStyle=n>=0?"#000":"#888";g.fill()}
    g.fillStyle="#000";yh=262}
  g.fillRect(pad,yh,w,3);g.textAlign="center";g.font=F(28,0);g.fillText("ອາການ",W/2,yh+8);g.textAlign="left";
  const sv=((j.issues&&j.issues.length?j.issues:[j.issue]).filter(Boolean)).join(", ");g.font=F(38,1);
  let y=yh+50,line2="";const lines=[];for(const x of ch(sv)){if(g.measureText(line2+x).width>w){lines.push(line2);line2=x}else line2+=x}if(line2)lines.push(line2);
  for(const l of lines){if(y>H-140){break}g.fillText(l,pad,y);y+=48}
  g.textAlign="center";g.font=F(40,1);g.fillText("ເບີຮ້ານ "+S.phone,W/2,H-108);g.font=F(28,0);g.fillText(fd(j.date)+" "+ft(j.date),W/2,H-52);
  return c}
async function stkShare(){if(!pvx||!pvx.blob){toast("ກຳລັງກຽມຮູບ… ລອງໃໝ່");return}
  const f=new File([pvx.blob],"sticker-"+pvx.j.code+".png",{type:"image/png"});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:pvx.j.code});return}catch(e){if(e&&e.name==="AbortError")return}}
  const a=document.createElement("a");a.href=URL.createObjectURL(pvx.blob);a.download=f.name;a.click();toast("ບັນທຶກຮູບແລ້ວ ເປີດໃນແອັບເຄື່ອງພິມ")}
function ppSet(){if(!pvx)return;const o={s:+$("#pp_s").value||100,dx:+$("#pp_x").value||0,dy:+$("#pp_y").value||0};lsSet("pp-"+pvx.k,JSON.stringify(o));pvx.x.opt=o;printDoc(pvx.k,pvx.j,S,toast,pvx.x)}
function ppReset(){if(!pvx)return;lsSet("pp-"+pvx.k,"{}");pvx.x.opt={};["pp_s","pp_x","pp_y"].forEach((i,n)=>$("#"+i).value=n?0:100);printDoc(pvx.k,pvx.j,S,toast,pvx.x)}
function closePv(){const m=$("#pv");if(m)m.remove()}
function pvPrint(){if(!pvx)return;
  if(isIOS){const w=window.open("","_blank");if(w){w.document.open();w.document.write(pvx.htmlBar);w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch(e){}},900)}else toast("ເປີດແທັບໃໝ່ບໍ່ໄດ້ — ອະນຸຍາດ pop-up")}
  else{const f=$("#pvi").contentWindow;f.focus();f.print()}}
async function showQr(id){const j=jobs.find(x=>x.id===id),t=await syncQ(j);if(!t)return;const url=new URL("status.html?t="+t,location.href).href;let svg="";
  try{const q=qrcode(0,"M");q.addData(url);q.make();svg=q.createSvgTag({cellSize:6,margin:2,scalable:true}).replace("<svg ",'<svg style="width:100%;height:100%" ')}catch(e){}
  const m=document.createElement("div");m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:25;display:flex;align-items:center;justify-content:center;padding:14px";m.onclick=e=>{if(e.target===m)m.remove()};
  m.innerHTML=`<div class="card" style="width:min(340px,100%);text-align:center;margin:0"><b>QR ຕິດຕາມເຄື່ອງຂອງທ່ານ</b><div style="width:250px;height:250px;margin:10px auto;background:#fff">${svg}</div><div style="font-size:11px;word-break:break-all;color:var(--mu)">${esc(url)}</div><div class="row" style="margin-top:10px"><button class="btn g" onclick="navigator.clipboard&&navigator.clipboard.writeText('${url}').then(()=>toast('ສຳເນົາລິ້ງແລ້ວ'))">ສຳເນົາລິ້ງ</button><button class="btn" onclick="this.closest('.card').parentElement.remove()">ປິດ</button></div></div>`;document.body.appendChild(m)}
async function saveSvc(id){const j=jobs.find(x=>x.id===id);if(!j)return;const items=getSel("g_issues");if(!items.length){toast("ເລືອກຢ່າງໜ້ອຍ 1 ບໍລິການ");return}
  const t=new Date().toISOString();
  if(await save(()=>updateDoc(J(id),{issues:items,issue:items.join(", "),log:[...(j.log||[]),{t,f:["ບໍລິການ: "+items.join(", ")]}]}))){await syncQ({...j,issues:items,issue:items.join(", ")});dirty=false;toast("ບັນທຶກບໍລິການແລ້ວ");if(view==="det"&&cur===id)draw()}}
async function sendLink(id,mode){
  const j=jobs.find(x=>x.id===id),t=await syncQ(j);if(!t)return;
  const url=new URL("status.html?t="+t,location.href).href,msg=`ສະບາຍດີ ${j.cname}\nກວດສະຖານະເຄື່ອງຂອງທ່ານ (${j.code}) ໄດ້ທີ່ນີ້:\n${url}\n— ${S.name}`;
  if(mode==="wa"){let n=String(j.phone||"").replace(/\D/g,"").replace(/^0+/,"");if(!n.startsWith("856")){if(n.length===8)n="20"+n;n="856"+n}open("https://wa.me/"+n+"?text="+encodeURIComponent(msg),"_blank")}
  else{try{await navigator.clipboard.writeText(msg);toast("ສຳເນົາແລ້ວ ນຳໄປວາງສົ່ງລູກຄ້າໄດ້ເລີຍ")}catch(e){prompt("ສຳເນົາຂໍ້ຄວາມນີ້:",msg)}}
}
async function chSt(id){const j=jobs.find(x=>x.id===id),s=$("#ns").value;if(s===j.status)return;const hist=[...(j.hist||[]),{s,t:new Date().toISOString()}];if(await save(()=>updateDoc(J(id),{status:s,hist}))){await syncQ({...j,status:s,hist});toast("ປ່ຽນສະຖານະແລ້ວ")}}
async function saveAcct(id){if(await save(()=>updateDoc(J(id),{acct:[{u:em(),d:new Date().toISOString()}]})))toast("ບັນທຶກແລ້ວ")}
async function delJob(id){const j=jobs.find(x=>x.id===id);if(confirm("ລົບງານນີ້ຖາວອນ?")&&await save(async()=>{try{const ps=await getDocs(collection(fdb,"jobs",id,"photos"));for(const d of ps.docs)await deleteDoc(d.ref)}catch(e){}await deleteDoc(J(id));if(j&&j.pub)await deleteDoc(doc(fdb,"public",j.pub))}))go("jobs")}

// ---- ດາວໂຫຼດ Excel ----
function vXls(){
  const d=new Date(),mo=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  $("#m").innerHTML=`<h2>ດາວໂຫຼດຂໍ້ມູນເປັນ Excel</h2><div class="card"><label>ເລືອກເດືອນ</label><input type="month" id="x_m" value="${mo}" oninput="xCnt()">
<p style="color:var(--mu);font-size:13px">ເລືອກແຕ່ເດືອນກໍພໍ — ລະບົບຈະລວມຕັ້ງແຕ່ວັນທີ 1 ຮອດວັນສຸດທ້າຍຂອງເດືອນ (ນັບຕາມວັນທີຮັບເຄື່ອງ)</p>
<details><summary style="cursor:pointer;color:var(--pr2)">ຢາກເລືອກວັນທີເອງ (ບໍ່ບັງຄັບ)</summary><div class="two"><div><label>ຈາກວັນທີ</label><input type="date" id="x_f" oninput="xCnt()"></div><div><label>ຮອດວັນທີ</label><input type="date" id="x_t" oninput="xCnt()"></div></div></details>
<div id="x_n" style="margin:14px 0 10px;font-weight:700"></div><button class="btn big" onclick="xDl()">📥 ດາວໂຫຼດ Excel</button>
<small style="color:var(--mu)">ໄຟລ໌ມີ 3 ແຜ່ນ: ງານທັງໝົດ, ສະຫຼຸບ, ປະຫວັດສະຖານະ. ມີລະຫັດປົດລັອກເຄື່ອງລູກຄ້າ ເກັບໄວ້ບ່ອນປອດໄພ</small></div>`;xCnt();
}
function xRange(){
  const m=$("#x_m").value,f=$("#x_f").value,t=$("#x_t").value;
  const som=d=>new Date(d.getFullYear(),d.getMonth(),1),eom=d=>new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59,999);
  let a=f?new Date(f+"T00:00:00"):null,b=t?new Date(t+"T23:59:59.999"):null;
  if(a||b){if(!a)a=som(b);if(!b)b=eom(a)}else if(m){a=new Date(+m.slice(0,4),+m.slice(5,7)-1,1);b=eom(a)}else return null;
  return[a,b];
}
const xJobs=()=>{const r=xRange();return r?jobs.filter(j=>{const d=new Date(j.date);return d>=r[0]&&d<=r[1]}).sort((a,b)=>(a.date||"").localeCompare(b.date||"")):[]};
const xCnt=()=>{const e=$("#x_n");if(e)e.textContent="ພົບ "+xJobs().length+" ງານ"};
function xDl(){
  if(typeof XLSX==="undefined"){toast("ໂຫຼດເຄື່ອງມື Excel ບໍ່ໄດ້ ກວດອິນເຕີເນັດ");return}
  const L=xJobs(),r=xRange();if(!L.length){toast("ບໍ່ມີຂໍ້ມູນໃນຊ່ວງນີ້");return}
  const dt=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},tm=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
  const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const ls=(a,x)=>(a&&a.length?a:[x]).filter(Boolean);
  const H=["ລະຫັດງານ","ວັນທີຮັບ","ເວລາຮັບ","ຊື່ລູກຄ້າ","ເບີໂທ","ທີ່ຢູ່","ຍີ່ຫໍ້","ລຸ້ນ","ສີ","ລະຫັດປົດລັອກ","ລວດລາຍປົດລັອກ","ອາການ / ບໍລິການ","ສະພາບເຄື່ອງ","ຜູ້ຮັບເຄື່ອງ","ຊ່າງ","ສະຖານະ","ວັນທີສຳເລັດ","ອີເມວລູກຄ້າ","ໝາຍເຫດລູກຄ້າ","ໝາຍເຫດ","ຜົນກວດຫຼັງແກະເຄື່ອງ","ສະພາບຫຼັງສ້ອມສຳເລັດ"];
  const W=[12,12,8,20,14,22,12,16,10,14,14,28,26,14,14,22,12,26,22,22,32,32];
  const row=j=>{const dn=doneDate(j);return[j.code,dt(j.date),tm(j.date),j.cname,j.phone,j.addr,j.brand,j.model,j.color,j.lock,(j.pattern||[]).join("-"),ls(j.issues,j.issue).join(", "),ls(j.conds,j.cond).join(", "),j.by,j.tech,j.status,dn?dt(dn):"",(j.acct&&j.acct[0]&&j.acct[0].u)||"",j.cnote,j.note,[...(j.step2?.items||[]),j.step2?.note||""].filter(Boolean).join(", "),[...(j.step3?.items||[]),j.step3?.note||""].filter(Boolean).join(", ")].map(x=>x??"")};
  const cn=a=>{const m={};a.forEach(k=>{k=k||"—";m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
  const sec=(t,a)=>[[],[t],...a.map(x=>[x[0],x[1]])];
  const sum=[["ສະຫຼຸບຂໍ້ມູນ SL-Mobile"],["ຊ່ວງວັນທີ",dt(r[0])+" ຮອດ "+dt(r[1])],["ຈຳນວນງານທັງໝົດ",L.length],
    ...sec("ແຍກຕາມສະຖານະ",cn(L.map(j=>j.status))),...sec("ແຍກຕາມຊ່າງ",cn(L.map(j=>j.tech||"ບໍ່ໄດ້ມອບໝາຍ"))),
    ...sec("ແຍກຕາມອາການ / ບໍລິການ",cn(L.flatMap(j=>ls(j.issues,j.issue)))),...sec("ແຍກຕາມຍີ່ຫໍ້",cn(L.map(j=>j.brand)))];
  const hist=[["ລະຫັດງານ","ຊື່ລູກຄ້າ","ວັນທີ","ເວລາ","ສະຖານະ"],...L.flatMap(j=>(j.hist||[]).map(h=>[j.code,j.cname,dt(h.t),tm(h.t),tn(h.s)]))];
  const wb=XLSX.utils.book_new(),w1=XLSX.utils.aoa_to_sheet([H,...L.map(row)]),w2=XLSX.utils.aoa_to_sheet(sum),w3=XLSX.utils.aoa_to_sheet(hist);
  w1["!cols"]=W.map(x=>({wch:x}));w1["!autofilter"]={ref:"A1:"+XLSX.utils.encode_col(H.length-1)+(L.length+1)};
  w2["!cols"]=[{wch:30},{wch:22}];w3["!cols"]=[{wch:12},{wch:20},{wch:12},{wch:8},{wch:24}];
  XLSX.utils.book_append_sheet(wb,w1,"ງານທັງໝົດ");XLSX.utils.book_append_sheet(wb,w2,"ສະຫຼຸບ");XLSX.utils.book_append_sheet(wb,w3,"ປະຫວັດສະຖານະ");
  const m=$("#x_m").value,custom=$("#x_f").value||$("#x_t").value;
  XLSX.writeFile(wb,"sl-mobile_"+(custom||!m?ymd(r[0])+"_"+ymd(r[1]):m)+".xlsx");toast("ດາວໂຫຼດແລ້ວ "+L.length+" ງານ");
}

// ---- ຕັ້ງຄ່າ ----
function lst(key,title,col){const lab=v=>typeof v==="string"?v:v.n;
  return`<div class="card"><b>${title}</b><div class="chips">${S[key].map((v,i)=>`<span class="chip x">${col?`<i style="background:${esc(v.c)}"></i>`:""}${esc(lab(v))} <b onclick="topL('${key}',${i})" style="color:#1d4aa3" title="ຍ້າຍຂຶ້ນເທິງສຸດ">⬆</b><b onclick="delL('${key}',${i})">×</b></span>`).join("")||'<span style="color:var(--mu)">ຍັງບໍ່ມີ</span>'}</div><div class="inl" style="margin-top:8px">${col?`<input type="color" id="n_${key}_c" value="#808080" style="max-width:60px;padding:2px">`:""}<input id="n_${key}" placeholder="ເພີ່ມລາຍການໃໝ່..." onkeydown="if(event.key==='Enter')addL('${key}')"><button class="btn" onclick="addL('${key}')">+ ເພີ່ມ</button></div></div>`}
function vSet(){
  $("#m").innerHTML=`<h2>ຕັ້ງຄ່າ</h2><div class="card"><b>ຄຳນຳໜ້າລະຫັດງານ</b><div class="inl" style="margin-top:6px"><input id="s_prefix" value="${esc(S.prefix)}" maxlength="6" oninput="this.value=this.value.replace(/[^A-Za-z]/g,'').toUpperCase();document.getElementById('pf_pv').textContent=(this.value||'..')+'-00001'"><button class="btn" onclick="savePrefix()">ບັນທຶກ</button></div><small style="color:var(--mu)">ຕົວຢ່າງ: <b id="pf_pv">${esc(S.prefix)}-00001</b> — ປ່ຽນແລ້ວ ງານເກົ່າທັງໝົດປ່ຽນຕາມ ເລກລຳດັບຄືເກົ່າ (ປ່ຽນສະເພາະການສະແດງ ບໍ່ແກ້ຂໍ້ມູນເກົ່າ)</small></div><div class="card"><b>ການໃຊ້ໂควตาฟรີ (ປະມານ)</b><div>ອ່ານຂໍ້ມູນວັນນີ້ໃນເຄື່ອງນີ້: <b>${readsToday().toLocaleString()}</b> / ${DAYLIM.toLocaleString()}</div><small style="color:var(--mu)">ນັບສະເພາະເຄື່ອງນີ້ ຕົວເລກຈິງເບິ່ງໄດ້ທີ່ Firebase Console → Firestore → Usage</small></div>${lst("brands","ຍີ່ຫໍ້ໂທລະສັບ")}${lst("issues","ອາການເສຍ / ບໍລິການ")}${lst("conds","ສະພາບເຄື່ອງກ່ອນຮັບ")}${lst("colors","ສີເຄື່ອງ",true)}${lst("foundL","ຜົນກວດຫຼັງແກະເຄື່ອງ (ຂັ້ນຕອນ 2)")}${lst("afterL","ສະພາບຫຼັງສ້ອມສຳເລັດ (ຂັ້ນຕອນ 3)")}${lst("staff","ພະນັກງານ (ຜູ້ຮັບເຄື່ອງ / ຊ່າງ)")}
<div class="card"><b>ສະຖານະງານ</b>${S.statuses.map((s,i)=>`<div class="row" style="margin-top:6px"><input id="st_n${i}" value="${esc(s.n)}"><input id="st_c${i}" type="color" value="${s.c}" style="max-width:60px;flex:none;min-width:0"><label style="display:flex;align-items:center;gap:4px;margin:0;flex:none;min-width:0;color:var(--tx)"><input type="checkbox" id="st_d${i}" ${s.d?"checked":""} style="width:auto"> ລົງລຸ່ມ</label><button class="btn g" onclick="mvSt(${i},-1)">↑</button><button class="btn g" onclick="mvSt(${i},1)">↓</button><button class="btn r" onclick="delSt(${i})">ລົບ</button></div>`).join("")}<div class="row" style="margin-top:10px"><button class="btn g" onclick="addSt()">+ ເພີ່ມສະຖານະ</button><button class="btn" onclick="saveSt()">ບັນທຶກສະຖານະ</button></div></div>
<div class="card"><b>ຂໍ້ມູນຮ້ານ</b><div class="two"><div><label>ຊື່ຮ້ານ</label><input id="s_name" value="${esc(S.name)}"></div><div><label>ເບີໂທ</label><input id="s_phone" value="${esc(S.phone)}"></div><div><label>Facebook</label><input id="s_fb" value="${esc(S.fb)}"></div><div><label>ອີເມວ</label><input id="s_email" value="${esc(S.email)}"></div></div><label>ທີ່ຢູ່</label><input id="s_addr" value="${esc(S.addr)}"><label>ໂລໂກ້ (ຊື່ໄຟລ໌ທີ່ອັບໂຫຼດໄວ້ໃນ GitHub ເຊັ່ນ logo.png)</label><input id="s_logo" value="${esc(S.logo)}"><div class="row" style="margin-top:10px"><button class="btn" onclick="saveShop()">ບັນທຶກ</button></div></div>
<div class="card"><b>ບັນຊີເຂົ້າລະບົບ</b><label>ລະຫັດຜ່ານປັດຈຸບັນ</label><input id="c_old" type="password"><div class="two"><div><label>ລະຫັດຜ່ານໃໝ່ (6 ຕົວຂຶ້ນໄປ)</label><input id="c_np" type="password"></div><div><label>ອີເມວໃໝ່ (ລະບົບຈະສົ່ງລິ້ງຢືນຢັນ)</label><input id="c_ne" type="email"></div></div><div class="row" style="margin-top:8px"><button class="btn" onclick="chPw()">ປ່ຽນລະຫັດຜ່ານ</button><button class="btn" onclick="chEm()">ປ່ຽນອີເມວ</button></div></div>
<div class="card"><b>ສຳຮອງ / ກູ້ຄືນຂໍ້ມູນ</b><div class="row" style="margin-top:8px"><button class="btn" onclick="backup()">ດາວໂຫຼດໄຟລ໌ສຳຮອງ (JSON)</button><input type="file" accept=".json" onchange="restore(this.files[0])"></div><p style="color:#667085;font-size:12px">ໄຟລ໌ສຳຮອງມີລະຫັດປົດລັອກເຄື່ອງລູກຄ້າ ເກັບໄວ້ບ່ອນປອດໄພ</p></div>`;
}
async function pushS(p){if(await save(()=>setDoc(SH,{...S,...p})))toast("ບັນທຶກແລ້ວ")}
async function addL(k){const i=$("#n_"+k),v=i.value.trim();if(!v)return;let it=v;if(k==="colors"){if(S.colors.some(x=>x.n===v))return;it={n:v,c:$("#n_colors_c").value}}else if(S[k].includes(v))return;i.value="";await pushS({[k]:[...S[k],it]});setTimeout(()=>$("#n_"+k)?.focus(),60)}
const delL=(k,i)=>{const x=S[k][i];if(confirm("ລົບ \""+(typeof x==="string"?x:x.n)+"\" ?"))pushS({[k]:S[k].filter((_,y)=>y!==i)})};
const topL=(k,i)=>{const a=[...S[k]],[x]=a.splice(i,1);a.unshift(x);pushS({[k]:a})};
const rd=()=>S.statuses.map((s,i)=>({n:$("#st_n"+i)?.value.trim()||s.n,c:$("#st_c"+i)?.value||s.c,d:$("#st_d"+i)?$("#st_d"+i).checked:!!s.d}));
async function saveShop(){const o={};["name","phone","fb","email","addr","logo"].forEach(k=>o[k]=$("#s_"+k).value.trim());pushS(o)}
const saveSt=()=>pushS({statuses:rd()}),addSt=()=>pushS({statuses:[...rd(),{n:"ສະຖານະໃໝ່",c:"#7a8394",d:false}]});
const delSt=i=>{if(confirm("ລົບສະຖານະນີ້?")){const a=rd();a.splice(i,1);pushS({statuses:a})}};
const mvSt=(i,d)=>{const a=rd(),k=i+d;if(k<0||k>=a.length)return;[a[i],a[k]]=[a[k],a[i]];pushS({statuses:a})};
async function reauth(){const u=auth.currentUser,p=$("#c_old").value;if(!p){toast("ໃສ່ລະຫັດຜ່ານປັດຈຸບັນ");return null}try{await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,p));return u}catch(e){toast("ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ");return null}}
async function chPw(){const n=$("#c_np").value;if(n.length<6){toast("ລະຫັດຜ່ານໃໝ່ຕ້ອງ 6 ຕົວຂຶ້ນໄປ");return}const u=await reauth();if(u&&await save(()=>updatePassword(u,n)))toast("ປ່ຽນລະຫັດຜ່ານແລ້ວ")}
async function chEm(){const n=$("#c_ne").value.trim();if(!n){toast("ໃສ່ອີເມວໃໝ່");return}const u=await reauth();if(u&&await save(()=>verifyBeforeUpdateEmail(u,n)))toast("ສົ່ງລິ້ງຢືນຢັນໄປອີເມວໃໝ່ແລ້ວ")}
function backup(){const b=new Blob([JSON.stringify({settings:S,jobs},null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="sl-mobile-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
async function restore(f){if(!f||!confirm("ການກູ້ຄືນຈະຂຽນທັບງານທີ່ມີລະຫັດດຽວກັນ ດຳເນີນການຕໍ່?"))return;try{const d=JSON.parse(await f.text());for(const j of d.jobs||[]){const{id,...r}=j;await setDoc(J(id),r)}if(d.settings)await setDoc(SH,d.settings);toast("ກູ້ຄືນແລ້ວ "+(d.jobs||[]).length+" ງານ")}catch(e){toast("ກູ້ຄືນບໍ່ສຳເລັດ: "+(e.code||e.message))}}
// ແກ້ໄຂດ່ວນ (ໜ້າຕ່າງປ໊ອບອັບ) + ຄຳນຳໜ້າ
function qEdit(id){const j=jobs.find(x=>x.id===id);if(!j)return;closeMd();const m=document.createElement("div");m.id="md";m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:20;display:flex;align-items:center;justify-content:center;padding:14px";
  m.innerHTML=`<div class="card" style="width:min(420px,100%);max-height:92vh;overflow:auto;margin:0"><b style="font-size:18px">ແກ້ໄຂຂໍ້ມູນລູກຄ້າ</b>
<label>ເລກງານ</label><div class="inl"><span style="align-self:center;font-weight:700">${esc(S.prefix)}-</span><input id="q_code" inputmode="numeric" value="${numOf(j)}" oninput="this.value=this.value.replace(/\\D/g,'')"></div>
<label>ຊື່ລູກຄ້າ</label><input id="q_cname" value="${esc(j.cname)}"><label>ເບີໂທ</label><input id="q_phone" inputmode="numeric" value="${esc(j.phone)}" oninput="this.value=this.value.replace(/\\D/g,'')">
<label>ທີ່ຢູ່</label><input id="q_addr" value="${esc(j.addr||"")}"><label>ໝາຍເຫດລູກຄ້າ</label><input id="q_cnote" value="${esc(j.cnote||"")}">
<div class="row" style="margin-top:12px"><button class="btn" onclick="saveQuick('${j.id}')">ບັນທຶກ</button><button class="btn g" onclick="closeMd()">ຍົກເລີກ</button></div></div>`;document.body.appendChild(m)}
async function saveQuick(id){const j=jobs.find(x=>x.id===id);if(!j)return;
  const n=parseInt($("#q_code").value,10),o={cname:$("#q_cname").value.trim(),phone:$("#q_phone").value.replace(/\D/g,""),addr:$("#q_addr").value.trim(),cnote:$("#q_cnote").value.trim()};
  if(!o.cname||!o.phone){toast("ກະລຸນາໃສ່ຊື່ ແລະ ເບີໂທ");return}if(!n||n<1){toast("ກະລຸນາໃສ່ເລກງານ");return}
  if(jobs.some(x=>numOf(x)===n&&x.id!==id)){toast("ເລກງານນີ້ມີແລ້ວ");return}
  o.code=S.prefix+"-"+String(n).padStart(5,"0");const ch=Object.keys(o).filter(k=>String(j[k]||"")!==String(o[k]||"")).map(k=>LBL[k]||k);
  if(!ch.length){closeMd();return}
  if(await save(()=>updateDoc(J(id),{...o,log:[...(j.log||[]),{t:new Date().toISOString(),f:ch}]}))){closeMd();await syncQ({...j,...o});toast("ບັນທຶກແລ້ວ")}}
function savePrefix(){const v=$("#s_prefix").value.trim().toUpperCase();if(!/^[A-Z]{1,6}$/.test(v)){toast("ໃຊ້ຕົວອັກສອນ A-Z 1-6 ຕົວ");return}if(v===S.prefix)return;if(confirm("ປ່ຽນຄຳນຳໜ້າເປັນ "+v+"-xxxxx ? ງານເກົ່າທັງໝົດຈະປ່ຽນຕາມ ເລກລຳດັບຄືເກົ່າ"))pushS({prefix:v})}
Object.assign(window,{qEdit,saveQuick,savePrefix,stkShare,showQr,saveSvc,ppSet,ppReset,closePv,pvPrint,dz,saveStep,setso,dtg,dall,xCnt,xDl,qt,qa,qac,addPics,rmPic,viewPic,padClear,askTech,setTech,mtAdd,chTech,closeMd,topL,sendLink,go,logout,stat,setq,setfs,fill,tg,saveJob,pr,chSt,saveAcct,delJob,addL,delL,saveShop,saveSt,addSt,delSt,mvSt,chPw,chEm,backup,restore});
