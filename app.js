import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,updatePassword,reauthenticateWithCredential,EmailAuthProvider,verifyBeforeUpdateEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,setDoc,updateDoc,deleteDoc,runTransaction} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
import {printDoc} from "./print.js";

const fapp=initializeApp(firebaseConfig),auth=getAuth(fapp),fdb=getFirestore(fapp);
const SH=doc(fdb,"settings","shop"),J=id=>doc(fdb,"jobs",id);

// ---- ค่าเริ่มต้น (ພາສາລາວ) ----
const T={"รับเครื่องแล้ว":"ລໍຖ້າດຳເນີນການ","รอตรวจสอบ":"ລໍຖ້າດຳເນີນການ","กำลังดำเนินการ":"ກຳລັງດຳເນີນການ","กำลังซ่อม":"ກຳລັງຊ່ອມ","รออะไหล่":"ລໍຖ້າອາໄຫຼ່","ซ่อมเสร็จแล้ว":"ຊ່ອມແລ້ວ","พร้อมให้ลูกค้ามารับเครื่อง":"ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","ลูกค้ามารับเครื่องแล้ว":"ລູກຄ້າມາຮັບແລ້ວ","ยกเลิกงาน":"ຍົກເລີກ"};
const tn=n=>T[n]||n;
const DS=[["ລໍຖ້າດຳເນີນການ","#7a8394"],["ກຳລັງດຳເນີນການ","#d4a017"],["ກຳລັງຊ່ອມ","#e0781f"],["ລໍຖ້າອາໄຫຼ່","#d35400"],["ຊ່ອມແລ້ວ","#1f9d6b"],["ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","#17a34a"],["ລູກຄ້າມາຮັບແລ້ວ","#1d4aa3"],["ຍົກເລີກ","#c0392b"]].map(a=>({n:a[0],c:a[1]}));
const DONE=["ຊ່ອມແລ້ວ","ພ້ອມໃຫ້ລູກຄ້າມາຮັບ","ລູກຄ້າມາຮັບແລ້ວ"];
const COLORS=[["ດຳ","#111111"],["ຂາວ","#ffffff"],["ເງິນ","#c0c4cc"],["ທອງ","#d4af37"],["ຟ້າ","#3b82f6"],["ແດງ","#dc2626"],["ຊົມພູ","#f472b6"]];
const DOM=["@gmail.com","@icloud.com","@outlook.com","@hotmail.com","@yahoo.com"];
const DEF={name:"SL-Mobile",phone:"020 5655 8855",fb:"SL-mobile",addr:"",email:"",logo:"",statuses:DS,sticker:"50x30",
 brands:["iPhone","Samsung","Oppo","Vivo","Xiaomi","Redmi","Huawei","Honor","Realme","OnePlus","Infinix","Tecno","Itel","Google Pixel","Nokia","Motorola","Sony","Asus"],
 issues:["ປ່ຽນໜ້າຈໍ","ກວດເຊັກທັງໝົດ","ກວດເຊັກລຳໂພງ","ປ່ຽນແບັດເຕີຣີ","ຕັ້ງ ID / ອີເມວ","ປ່ຽນຝາຫຼັງ","ປ່ຽນຊ່ອງສາກ","ລົງໂປຣແກຣມ / ອັບເດດ","ກູ້ຂໍ້ມູນ"],
 conds:["ສະພາບດີ","ໜ້າຈໍແຕກ","ຝາຫຼັງແຕກ","ຕົວເຄື່ອງມີຮອຍ / ບຸບ","ເປີດບໍ່ຕິດ","ຕົກນ້ຳ"],
 staff:[]};
function normS(d){const s={...DEF,...d},seen=new Set();s.statuses=(s.statuses||DS).map(x=>({n:tn(x.n),c:x.c})).filter(x=>!seen.has(x.n)&&seen.add(x.n));return s}
const LBL={phone:"ເບີໂທ",cname:"ຊື່",addr:"ທີ່ຢູ່",cnote:"ໝາຍເຫດລູກຄ້າ",brand:"ຍີ່ຫໍ້",model:"ລຸ້ນ",color:"ສີ",lock:"ລະຫັດປົດລັອກ",issues:"ອາການ/ບໍລິການ",conds:"ສະພາບເຄື່ອງ",by:"ຜູ້ຮັບ",note:"ໝາຍເຫດ"};

let jobs=[],S=normS({}),view="jobs",cur=null,q="",fs="",unsubs=[];
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
const sc=n=>(S.statuses.find(s=>s.n===n)||{c:"#7a8394"}).c,bd=n=>`<span class="badge" style="background:${sc(n)}">${esc(n)}</span>`;
function toast(t){const e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",3000)}
async function save(fn){try{await fn();return true}catch(e){toast("ບໍ່ສຳເລັດ: "+(e.code||e.message));return false}}
const lsGet=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

// ---- Auth ----
$("#lf").onsubmit=async e=>{e.preventDefault();$("#lerr").textContent="";try{await signInWithEmailAndPassword(auth,$("#le").value.trim(),$("#lp").value)}catch(x){$("#lerr").textContent="ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"}};
onAuthStateChanged(auth,u=>{
  unsubs.forEach(f=>f());unsubs=[];
  if(!u){$("#app").style.display="none";$("#login").style.display="flex";return}
  $("#login").style.display="none";$("#app").style.display="flex";
  unsubs.push(onSnapshot(SH,s=>{S=normS(s.exists()?s.data():{});refresh()},e=>toast("ອ່ານການຕັ້ງຄ່າບໍ່ໄດ້: "+e.code)));
  unsubs.push(onSnapshot(collection(fdb,"jobs"),s=>{jobs=s.docs.map(d=>{const x={...d.data(),id:d.id};x.status=tn(x.status);return x}).sort((a,b)=>(b.code||"").localeCompare(a.code||""));refresh()},e=>toast("ອ່ານຂໍ້ມູນບໍ່ໄດ້ (ກວດ Rules/UID): "+e.code)));
});
function navDraw(){
  const it=[["jobs","📱 ງານທັງໝົດ"],["dash","📊 ພາບລວມ"],["set","⚙️ ຕັ້ງຄ່າ"]],on=(view==="form"||view==="det")?"jobs":view;
  $("#nav").innerHTML="<h1>"+esc(S.name)+"</h1>"+it.map(i=>`<button class="${on===i[0]?"on":""}" onclick="go('${i[0]}')">${i[1]}</button>`).join("")+`<span class="sp"></span><button onclick="logout()">🚪 ອອກ</button>`;
}
function draw(){navDraw();({dash:vDash,jobs:vJobs,form:vForm,det:vDet,set:vSet})[view]()}
function refresh(){
  navDraw();
  if(view==="form")return;
  if(view==="jobs"&&$("#tb")){rows();return}
  const a=document.activeElement;
  if(view==="det"&&a&&$("#m").contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
  draw();
}
const go=(v,id)=>{view=v;cur=id||null;draw();scrollTo(0,0)};
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
function rows(){const e=$("#tb");if(!e)return;const L=filt();
  e.innerHTML=L.slice(0,200).map(j=>`<div class="jr" onclick="go('det','${j.id}')"><div class="cd">${esc(j.code)}</div><div class="nm"><b>${esc(j.cname)}</b><small>${esc(j.phone)}${j.brand||j.model?" · "+esc(((j.brand||"")+" "+(j.model||"")).trim()):""}</small></div>${bd(j.status)}</div>`).join("")||'<p style="color:var(--mu)">ບໍ່ພົບລາຍການ</p>'}
function vJobs(){
  $("#m").innerHTML=`<button class="btn big" onclick="go('form')">+ ຮັບເຄື່ອງໃໝ່</button>
<div class="card"><div class="row"><input id="qi" placeholder="ຄົ້ນຫາ: ເບີໂທ / ຊື່ / ລະຫັດ (ເຊັ່ນ 150)" value="${esc(q)}" oninput="setq(this.value)"><select onchange="setfs(this.value)"><option value="">ທຸກສະຖານະ</option>${S.statuses.map(s=>`<option ${fs===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select></div><div id="tb" style="margin-top:8px"></div></div>`;rows();
}
const setq=v=>{q=v;rows()},setfs=v=>{fs=v;rows()};

// ---- ภาพรวม ----
function vDash(){
  const c=S.statuses.map(s=>[s.n,s.c,jobs.filter(j=>j.status===s.n).length]);
  $("#m").innerHTML=`<button class="btn big" onclick="go('form')">+ ຮັບເຄື່ອງໃໝ່</button><h2>ພາບລວມ</h2>
<div class="grid"><div class="stat" style="border-left-color:#12306b" onclick="stat('')"><b>${jobs.length}</b><span>ເຄື່ອງທັງໝົດ</span></div>${c.map(x=>`<div class="stat" style="border-left-color:${x[1]}" data-s="${esc(x[0])}" onclick="stat(this.dataset.s)"><b>${x[2]}</b><span>${esc(x[0])}</span></div>`).join("")}</div>`;
}

// ---- ฟอร์มรับเครื่อง ----
function chips(id,list,sel,multi,col){
  const all=[...list,...sel.filter(v=>!list.includes(v))];
  return`<div class="chips" id="${id}" data-m="${multi?1:0}">${all.map(v=>`<button type="button" class="chip${sel.includes(v)?" on":""}" data-v="${esc(v)}" onclick="tg(this)">${col?`<i style="background:${(COLORS.find(c=>c[0]===v)||[0,"#ccc"])[1]}"></i>`:""}${esc(v)}</button>`).join("")||'<span style="color:var(--mu);font-size:13px">ຍັງບໍ່ມີ — ເພີ່ມໃນການຕັ້ງຄ່າ</span>'}</div>`}
function tg(b){const p=b.parentElement;if(p.dataset.m==="1")b.classList.toggle("on");else{const was=b.classList.contains("on");p.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));if(!was)b.classList.add("on")}}
const getSel=id=>[...document.querySelectorAll("#"+id+" .chip.on")].map(b=>b.dataset.v);
function opts(list,val,ph){const all=[...list,...(val&&!list.includes(val)?[val]:[])];return`<option value="">${ph}</option>`+all.map(v=>`<option ${v===val?"selected":""}>${esc(v)}</option>`).join("")}
function vForm(){
  const j=cur?jobs.find(x=>x.id===cur):{},v=k=>esc(j[k]||"");
  const is=j.issues||(j.issue?[j.issue]:[]),cs=j.conds||(j.cond?[j.cond]:[]),by=cur?(j.by||""):lsGet("lastBy");
  const st=cur?j.status:((S.statuses.find(s=>s.n==="ລໍຖ້າດຳເນີນການ")||S.statuses[0]).n);
  $("#m").innerHTML=`<h2>${cur?"ແກ້ໄຂງານ "+esc(j.code):"ຮັບເຄື່ອງໃໝ່"}</h2><div class="card"><datalist id="dl">${[...new Map(jobs.map(x=>[x.phone,x])).values()].map(x=>`<option value="${esc(x.phone)}">${esc(x.cname)}</option>`).join("")}</datalist>
<b>ລູກຄ້າ</b><div class="two"><div><label>ເບີໂທ * (ຕົວເລກເທົ່ານັ້ນ)</label><input id="f_phone" list="dl" inputmode="numeric" value="${v("phone")}" oninput="this.value=this.value.replace(/\\D/g,'')" onchange="fill(this.value)"></div><div><label>ຊື່ລູກຄ້າ *</label><input id="f_cname" value="${v("cname")}"></div></div>
<label>ທີ່ຢູ່ (ບໍ່ບັງຄັບ)</label><input id="f_addr" value="${v("addr")}"><label>ໝາຍເຫດລູກຄ້າ</label><input id="f_cnote" value="${v("cnote")}">
<hr><b>ໂທລະສັບ</b><div class="two"><div><label>ຍີ່ຫໍ້</label><select id="f_brand">${opts(S.brands,j.brand||"","— ເລືອກຍີ່ຫໍ້ —")}</select></div><div><label>ລຸ້ນ</label><input id="f_model" value="${v("model")}"></div></div>
<label>ສີ</label>${chips("g_color",COLORS.map(c=>c[0]),j.color?[j.color]:[],false,true)}
<label>ລະຫັດປົດລັອກໜ້າຈໍ</label><input id="f_lock" value="${v("lock")}">
<label>ອາການເສຍ / ງານທີ່ໃຫ້ເຮັດ * (ເລືອກໄດ້ຫຼາຍອັນ)</label>${chips("g_issues",S.issues,is,true)}
<label>ສະພາບເຄື່ອງກ່ອນຮັບ</label>${chips("g_conds",S.conds,cs,true)}
<hr><div class="two"><div><label>ຜູ້ຮັບເຄື່ອງ</label><select id="f_by">${opts(S.staff,by,S.staff.length?"— ເລືອກ —":"(ເພີ່ມພະນັກງານໃນຕັ້ງຄ່າ)")}</select></div><div><label>ສະຖານະ</label><select id="f_status">${S.statuses.map(s=>`<option ${st===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select></div></div>
<label>ໝາຍເຫດເພີ່ມເຕີມ</label><textarea id="f_note">${v("note")}</textarea>
<div class="row" style="margin-top:12px"><button class="btn" onclick="saveJob()">ບັນທຶກ</button><button class="btn g" onclick="${cur?`go('det','${cur}')`:`go('jobs')`}">ຍົກເລີກ</button></div></div>`;
}
const fill=p=>{const o=jobs.find(x=>x.phone===p);if(o&&!$("#f_cname").value){$("#f_cname").value=o.cname||"";$("#f_addr").value=o.addr||""}};
async function nextCode(){const m=jobs.reduce((a,j)=>Math.max(a,parseInt((j.code||"").replace(/\D/g,""))||0),0);
  return runTransaction(fdb,async t=>{const r=doc(fdb,"settings","counter"),s=await t.get(r),n=Math.max(s.exists()?s.data().n:0,m)+1;t.set(r,{n});return"SL-"+String(n).padStart(5,"0")})}
async function saveJob(){
  const o={};["phone","cname","addr","cnote","brand","model","lock","by","status","note"].forEach(k=>o[k]=$("#f_"+k).value.trim());
  o.phone=o.phone.replace(/\D/g,"");o.color=getSel("g_color")[0]||"";
  o.issues=getSel("g_issues");o.issue=o.issues.join(", ");o.conds=getSel("g_conds");o.cond=o.conds.join(", ");
  if(!o.phone||!o.cname||!o.issues.length){toast("ກະລຸນາໃສ່ເບີໂທ, ຊື່ ແລະ ເລືອກອາການເສຍ");return}
  if(o.by)lsSet("lastBy",o.by);
  const now=new Date().toISOString(),s=x=>Array.isArray(x)?x.join("|"):String(x||"");
  if(cur){const j=jobs.find(x=>x.id===cur),h=[...(j.hist||[])];if(o.status!==j.status)h.push({s:o.status,t:now});
    const ch=Object.keys(o).filter(k=>!["status","issue","cond"].includes(k)).filter(k=>s(j[k])!==s(o[k])).map(k=>LBL[k]||k);
    const log=ch.length?[...(j.log||[]),{t:now,f:ch}]:(j.log||[]);
    if(await save(()=>updateDoc(J(cur),{...o,hist:h,log}))){toast("ບັນທຶກແລ້ວ");go("det",cur)}}
  else{let code;try{code=await nextCode()}catch(e){toast("ສ້າງລະຫັດງານບໍ່ໄດ້: "+e.code);return}
    const ref=doc(collection(fdb,"jobs"));
    if(await save(()=>setDoc(ref,{...o,code,date:now,hist:[{s:o.status,t:now}],log:[],acct:[]}))){toast("ບັນທຶກແລ້ວ "+code);go("det",ref.id)}}
}

// ---- รายละเอียดงาน ----
const doneDate=j=>{const h=[...(j.hist||[])].reverse().find(x=>DONE.includes(tn(x.s)));return h?h.t:""};
function vDet(){
  const j=jobs.find(x=>x.id===cur);if(!j){$("#m").innerHTML="ກຳລັງໂຫຼດ… <button class='btn g' onclick=\"go('jobs')\">ກັບ</button>";return}
  const L=(a,b)=>b?`<div><label>${a}</label>${esc(b)}</div>`:"",a0=(j.acct||[])[0]||{};
  const is=(j.issues&&j.issues.length?j.issues:[j.issue]).filter(Boolean).join(", "),cs=(j.conds&&j.conds.length?j.conds:[j.cond]).filter(Boolean).join(", ");
  const u=a0.u||"",dm=DOM.find(d=>u.toLowerCase().endsWith(d)),un=dm?u.slice(0,-dm.length):u,dsel=dm||(u?"":DOM[0]);
  $("#m").innerHTML=`<div class="row" style="margin-bottom:10px"><button class="btn g" onclick="go('jobs')">← ກັບ</button><button class="btn g" onclick="go('form','${j.id}')">ແກ້ໄຂ</button><button class="btn r" onclick="delJob('${j.id}')">ລົບ</button></div>
<div class="card hd"><div class="row"><div style="flex:3"><div class="big1">${esc(j.code)}</div><div class="cn">${esc(j.cname)}</div><div>📞 ${esc(j.phone)}</div></div><div style="flex:none">${bd(j.status)}</div></div></div>
<div class="card"><div class="two">${L("ຍີ່ຫໍ້ / ລຸ້ນ / ສີ",[j.brand,j.model,j.color].filter(Boolean).join(" "))}${L("ລະຫັດປົດລັອກ",j.lock)}${L("ອາການ / ບໍລິການ",is)}${L("ສະພາບເຄື່ອງ",cs)}${L("ວັນທີ / ເວລາຮັບ",fd(j.date)+" "+ft(j.date))}${L("ຜູ້ຮັບເຄື່ອງ",j.by)}${L("ທີ່ຢູ່",j.addr)}${L("ໝາຍເຫດລູກຄ້າ",j.cnote)}${L("ໝາຍເຫດ",j.note)}${L("IMEI",j.imei)}</div></div>
<div class="card"><b>ປ່ຽນສະຖານະ</b><div class="row"><select id="ns">${S.statuses.map(s=>`<option ${s.n===j.status?"selected":""}>${esc(s.n)}</option>`).join("")}</select><button class="btn" onclick="chSt('${j.id}')">ອັບເດດ</button></div>
<div style="margin-top:8px;color:#667085;font-size:13px">${[...(j.hist||[]).map(h=>[h.t,"ສະຖານະ → "+tn(h.s)]),...(j.log||[]).map(l=>[l.t,"ແກ້ໄຂ: "+l.f.join(", ")])].sort((a,b)=>b[0].localeCompare(a[0])).map(h=>`${fd(h[0])} ${ft(h[0])} — ${esc(h[1])}`).join("<br>")}</div></div>
<div class="card"><b>ພິມເອກະສານ</b><div class="row" style="margin-top:8px"><button class="btn g" onclick="pr('stk','${j.id}')">1. ສະຕິກເກີ (${esc(S.sticker)})</button><button class="btn g" onclick="pr('rec','${j.id}')">2. ໃບຮັບເຄື່ອງ</button><button class="btn g" onclick="pr('acc','${j.id}')">3. ຂໍ້ມູນລູກຄ້າ / ລະຫັດອີເມວ</button></div></div>
<div class="card"><b>ຂໍ້ມູນລູກຄ້າ / ລະຫັດອີເມວ (ສຳລັບໃບທີ 3)</b><label>ອີເມວ</label><div class="inl"><input id="a_u" value="${esc(un)}" placeholder="ຊື່ອີເມວ"><select id="a_d">${DOM.map(d=>`<option ${d===dsel?"selected":""}>${d}</option>`).join("")}<option value="" ${dsel===""?"selected":""}>(ພິມເອງທັງໝົດ)</option></select></div>
<label>ລະຫັດຜ່ານ (ບໍ່ບັນທຶກລົງລະບົບ ໃຊ້ສຳລັບພິມເທົ່ານັ້ນ)</label><input id="a_p" autocomplete="off">
<div class="row" style="margin-top:8px"><button class="btn g" onclick="saveAcct('${j.id}')">ບັນທຶກອີເມວ</button><button class="btn" onclick="pr('acc','${j.id}')">ພິມໃບຂໍ້ມູນ</button></div></div>`;
}
const em=()=>{const u=$("#a_u").value.trim(),d=$("#a_d").value;return!u?"":u.includes("@")?u:u+d};
function pr(k,id){const j=jobs.find(x=>x.id===id),x={done:doneDate(j)};if(k==="acc"){x.pw=$("#a_p")?.value||"";x.email=em()}printDoc(k,j,S,toast,x)}
async function chSt(id){const j=jobs.find(x=>x.id===id),s=$("#ns").value;if(s===j.status)return;if(await save(()=>updateDoc(J(id),{status:s,hist:[...(j.hist||[]),{s,t:new Date().toISOString()}]})))toast("ປ່ຽນສະຖານະແລ້ວ")}
async function saveAcct(id){if(await save(()=>updateDoc(J(id),{acct:[{u:em(),d:new Date().toISOString()}]})))toast("ບັນທຶກແລ້ວ")}
async function delJob(id){if(confirm("ລົບງານນີ້ຖາວອນ?")&&await save(()=>deleteDoc(J(id))))go("jobs")}

// ---- ตั้งค่า ----
function lst(key,title){return`<div class="card"><b>${title}</b><div class="chips">${S[key].map((v,i)=>`<span class="chip x">${esc(v)} <b onclick="delL('${key}',${i})">×</b></span>`).join("")||'<span style="color:var(--mu)">ຍັງບໍ່ມີ</span>'}</div><div class="inl" style="margin-top:8px"><input id="n_${key}" placeholder="ເພີ່ມລາຍການໃໝ່..." onkeydown="if(event.key==='Enter')addL('${key}')"><button class="btn" onclick="addL('${key}')">+ ເພີ່ມ</button></div></div>`}
function vSet(){
  $("#m").innerHTML=`<h2>ຕັ້ງຄ່າ</h2>${lst("brands","ຍີ່ຫໍ້ໂທລະສັບ")}${lst("issues","ອາການເສຍ / ບໍລິການ")}${lst("conds","ສະພາບເຄື່ອງກ່ອນຮັບ")}${lst("staff","ພະນັກງານຮັບເຄື່ອງ")}
<div class="card"><b>ສະຖານະງານ</b>${S.statuses.map((s,i)=>`<div class="row" style="margin-top:6px"><input id="st_n${i}" value="${esc(s.n)}"><input id="st_c${i}" type="color" value="${s.c}" style="max-width:60px;flex:none;min-width:0"><button class="btn g" onclick="mvSt(${i},-1)">↑</button><button class="btn g" onclick="mvSt(${i},1)">↓</button><button class="btn r" onclick="delSt(${i})">ລົບ</button></div>`).join("")}<div class="row" style="margin-top:10px"><button class="btn g" onclick="addSt()">+ ເພີ່ມສະຖານະ</button><button class="btn" onclick="saveSt()">ບັນທຶກສະຖານະ</button></div></div>
<div class="card"><b>ຂໍ້ມູນຮ້ານ</b><div class="two"><div><label>ຊື່ຮ້ານ</label><input id="s_name" value="${esc(S.name)}"></div><div><label>ເບີໂທ</label><input id="s_phone" value="${esc(S.phone)}"></div><div><label>Facebook</label><input id="s_fb" value="${esc(S.fb)}"></div><div><label>ອີເມວ</label><input id="s_email" value="${esc(S.email)}"></div></div><label>ທີ່ຢູ່</label><input id="s_addr" value="${esc(S.addr)}"><label>ໂລໂກ້ (ຊື່ໄຟລ໌ທີ່ອັບໂຫຼດໄວ້ໃນ GitHub ເຊັ່ນ logo.png)</label><input id="s_logo" value="${esc(S.logo)}"><label>ຂະໜາດສະຕິກເກີ</label><select id="s_sticker"><option ${S.sticker==="50x30"?"selected":""}>50x30</option><option ${S.sticker==="60x40"?"selected":""}>60x40</option></select><div class="row" style="margin-top:10px"><button class="btn" onclick="saveShop()">ບັນທຶກ</button></div></div>
<div class="card"><b>ບັນຊີເຂົ້າລະບົບ</b><label>ລະຫັດຜ່ານປັດຈຸບັນ</label><input id="c_old" type="password"><div class="two"><div><label>ລະຫັດຜ່ານໃໝ່ (6 ຕົວຂຶ້ນໄປ)</label><input id="c_np" type="password"></div><div><label>ອີເມວໃໝ່ (ລະບົບຈະສົ່ງລິ້ງຢືນຢັນ)</label><input id="c_ne" type="email"></div></div><div class="row" style="margin-top:8px"><button class="btn" onclick="chPw()">ປ່ຽນລະຫັດຜ່ານ</button><button class="btn" onclick="chEm()">ປ່ຽນອີເມວ</button></div></div>
<div class="card"><b>ສຳຮອງ / ກູ້ຄືນຂໍ້ມູນ</b><div class="row" style="margin-top:8px"><button class="btn" onclick="backup()">ດາວໂຫຼດໄຟລ໌ສຳຮອງ (JSON)</button><input type="file" accept=".json" onchange="restore(this.files[0])"></div><p style="color:#667085;font-size:12px">ໄຟລ໌ສຳຮອງມີລະຫັດປົດລັອກເຄື່ອງລູກຄ້າ ເກັບໄວ້ບ່ອນປອດໄພ</p></div>`;
}
async function pushS(p){if(await save(()=>setDoc(SH,{...S,...p})))toast("ບັນທຶກແລ້ວ")}
async function addL(k){const i=$("#n_"+k),v=i.value.trim();if(!v||S[k].includes(v))return;i.value="";await pushS({[k]:[...S[k],v]});setTimeout(()=>$("#n_"+k)?.focus(),60)}
const delL=(k,i)=>{if(confirm("ລົບ \""+S[k][i]+"\" ?"))pushS({[k]:S[k].filter((_,x)=>x!==i)})};
const rd=()=>S.statuses.map((s,i)=>({n:$("#st_n"+i)?.value.trim()||s.n,c:$("#st_c"+i)?.value||s.c}));
async function saveShop(){const o={};["name","phone","fb","email","addr","logo","sticker"].forEach(k=>o[k]=$("#s_"+k).value.trim());pushS(o)}
const saveSt=()=>pushS({statuses:rd()}),addSt=()=>pushS({statuses:[...rd(),{n:"ສະຖານະໃໝ່",c:"#7a8394"}]});
const delSt=i=>{if(confirm("ລົບສະຖານະນີ້?")){const a=rd();a.splice(i,1);pushS({statuses:a})}};
const mvSt=(i,d)=>{const a=rd(),k=i+d;if(k<0||k>=a.length)return;[a[i],a[k]]=[a[k],a[i]];pushS({statuses:a})};
async function reauth(){const u=auth.currentUser,p=$("#c_old").value;if(!p){toast("ໃສ່ລະຫັດຜ່ານປັດຈຸບັນ");return null}try{await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,p));return u}catch(e){toast("ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ");return null}}
async function chPw(){const n=$("#c_np").value;if(n.length<6){toast("ລະຫັດຜ່ານໃໝ່ຕ້ອງ 6 ຕົວຂຶ້ນໄປ");return}const u=await reauth();if(u&&await save(()=>updatePassword(u,n)))toast("ປ່ຽນລະຫັດຜ່ານແລ້ວ")}
async function chEm(){const n=$("#c_ne").value.trim();if(!n){toast("ໃສ່ອີເມວໃໝ່");return}const u=await reauth();if(u&&await save(()=>verifyBeforeUpdateEmail(u,n)))toast("ສົ່ງລິ້ງຢືນຢັນໄປອີເມວໃໝ່ແລ້ວ")}
function backup(){const b=new Blob([JSON.stringify({settings:S,jobs},null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="sl-mobile-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
async function restore(f){if(!f||!confirm("ການກູ້ຄືນຈະຂຽນທັບງານທີ່ມີລະຫັດດຽວກັນ ດຳເນີນການຕໍ່?"))return;try{const d=JSON.parse(await f.text());for(const j of d.jobs||[]){const{id,...r}=j;await setDoc(J(id),r)}if(d.settings)await setDoc(SH,d.settings);toast("ກູ້ຄືນແລ້ວ "+(d.jobs||[]).length+" ງານ")}catch(e){toast("ກູ້ຄືນບໍ່ສຳເລັດ: "+(e.code||e.message))}}
Object.assign(window,{go,logout,stat,setq,setfs,fill,tg,saveJob,pr,chSt,saveAcct,delJob,addL,delL,saveShop,saveSt,addSt,delSt,mvSt,chPw,chEm,backup,restore});
