import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,updatePassword,reauthenticateWithCredential,EmailAuthProvider,verifyBeforeUpdateEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,setDoc,updateDoc,deleteDoc,runTransaction} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
import {printDoc} from "./print.js";

const fapp=initializeApp(firebaseConfig),auth=getAuth(fapp),fdb=getFirestore(fapp);
const SH=doc(fdb,"settings","shop"),J=id=>doc(fdb,"jobs",id);
const DS=[["รับเครื่องแล้ว","#7a8394"],["รอตรวจสอบ","#8e6bbf"],["กำลังดำเนินการ","#d4a017"],["กำลังซ่อม","#e0781f"],["รออะไหล่","#d35400"],["ซ่อมเสร็จแล้ว","#1f9d6b"],["พร้อมให้ลูกค้ามารับเครื่อง","#17a34a"],["ลูกค้ามารับเครื่องแล้ว","#1d4aa3"],["ยกเลิกงาน","#c0392b"]].map(a=>({n:a[0],c:a[1]}));
const DEF={name:"SL-Mobile",phone:"020 5655 8855",fb:"SL-mobile",addr:"",email:"",logo:"",statuses:DS,sticker:"50x30"};
let jobs=[],S={...DEF},view="dash",cur=null,q="",fs="",unsubs=[];
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
const sc=n=>(S.statuses.find(s=>s.n===n)||{c:"#7a8394"}).c,bd=n=>`<span class="badge" style="background:${sc(n)}">${esc(n)}</span>`;
function toast(t){const e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",3000)}
async function save(fn){try{await fn();return true}catch(e){toast("ไม่สำเร็จ: "+(e.code||e.message));return false}}

// ---- Auth ----
$("#lf").onsubmit=async e=>{e.preventDefault();$("#lerr").textContent="";try{await signInWithEmailAndPassword(auth,$("#le").value.trim(),$("#lp").value)}catch(x){$("#lerr").textContent="อีเมลหรือรหัสผ่านไม่ถูกต้อง"}};
onAuthStateChanged(auth,u=>{
  unsubs.forEach(f=>f());unsubs=[];
  if(!u){$("#app").style.display="none";$("#login").style.display="flex";return}
  $("#login").style.display="none";$("#app").style.display="flex";
  unsubs.push(onSnapshot(SH,s=>{S={...DEF,...(s.exists()?s.data():{})};draw()},e=>toast("อ่านตั้งค่าไม่ได้: "+e.code)));
  unsubs.push(onSnapshot(collection(fdb,"jobs"),s=>{jobs=s.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=>(b.code||"").localeCompare(a.code||""));draw()},e=>toast("อ่านข้อมูลไม่ได้ (ตรวจ Rules/UID): "+e.code)));
});
function draw(){
  const it=[["dash","📊 ภาพรวม"],["jobs","📱 งานทั้งหมด"],["cust","👥 ลูกค้า"],["set","⚙️ ตั้งค่า"]];
  $("#nav").innerHTML="<h1>"+esc(S.name)+"</h1>"+it.map(i=>`<button class="${view===i[0]?"on":""}" onclick="go('${i[0]}')">${i[1]}</button>`).join("")+`<button onclick="logout()">🚪 ออกจากระบบ</button>`;
  ({dash:vDash,jobs:vDash,cust:vCust,set:vSet,form:vForm,det:vDet})[view]();
}
const go=(v,id)=>{view=v;cur=id||null;draw();scrollTo(0,0)};
const logout=()=>signOut(auth);
function filt(){const t=q.toLowerCase();return jobs.filter(j=>(!fs||j.status===fs)&&(!t||[j.code,j.cname,j.phone,j.brand,j.model,j.imei,fd(j.date),j.status].join(" ").toLowerCase().includes(t)))}
function rows(){const e=$("#tb");if(e)e.innerHTML=filt().map(j=>`<tr class="c" onclick="go('det','${j.id}')"><td>${esc(j.code)}</td><td>${esc(j.cname)}</td><td>${esc(j.phone)}</td><td>${esc((j.brand||"")+" "+(j.model||""))}</td><td>${fd(j.date)}</td><td>${bd(j.status)}</td></tr>`).join("")||'<tr><td colspan="6" style="color:#667085">ไม่พบรายการ</td></tr>'}
function vDash(){
  const n=s=>jobs.filter(j=>s.includes(j.status)).length;
  const cards=[["เครื่องทั้งหมด",jobs.length,""],["กำลังดำเนินการ/ซ่อม",n(["รอตรวจสอบ","กำลังดำเนินการ","กำลังซ่อม"]),""],["รออะไหล่",n(["รออะไหล่"]),"รออะไหล่"],["ซ่อมเสร็จแล้ว",n(["ซ่อมเสร็จแล้ว"]),"ซ่อมเสร็จแล้ว"],["พร้อมให้รับ",n(["พร้อมให้ลูกค้ามารับเครื่อง"]),"พร้อมให้ลูกค้ามารับเครื่อง"],["ส่งคืนแล้ว",n(["ลูกค้ามารับเครื่องแล้ว"]),"ลูกค้ามารับเครื่องแล้ว"]];
  $("#m").innerHTML=`<div class="row" style="margin-bottom:12px"><h2 style="margin:0;flex:1">${view==="dash"?"ภาพรวม":"งานทั้งหมด"}</h2><button class="btn" onclick="go('form')">+ รับเครื่องใหม่</button></div>
<div class="grid" style="margin-bottom:14px">${cards.map(c=>`<div class="stat" onclick="setfs('${c[2]}')"><b>${c[1]}</b><span>${c[0]}</span></div>`).join("")}</div>
<div class="card"><div class="row"><input placeholder="ค้นหา: รหัสงาน ชื่อ เบอร์ รุ่น IMEI วันที่ สถานะ" value="${esc(q)}" oninput="setq(this.value)"><select onchange="setfs(this.value)"><option value="">ทุกสถานะ</option>${S.statuses.map(s=>`<option ${fs===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select></div>
<div class="tw"><table><thead><tr><th>รหัสงาน</th><th>ลูกค้า</th><th>เบอร์โทร</th><th>ยี่ห้อ/รุ่น</th><th>วันที่รับ</th><th>สถานะ</th></tr></thead><tbody id="tb"></tbody></table></div></div>`;rows();
}
const setq=v=>{q=v;rows()},setfs=v=>{fs=v;draw()};
function vForm(){
  const j=cur?jobs.find(x=>x.id===cur):{},v=k=>esc(j[k]||"");
  $("#m").innerHTML=`<h2>${cur?"แก้ไขงาน "+esc(j.code):"รับเครื่องใหม่"}</h2><div class="card"><datalist id="dl">${[...new Map(jobs.map(x=>[x.phone,x])).values()].map(x=>`<option value="${esc(x.phone)}">${esc(x.cname)}</option>`).join("")}</datalist>
<b>ลูกค้า</b><div class="two"><div><label>เบอร์โทร * (พิมพ์เบอร์เดิมเพื่อดึงข้อมูล)</label><input id="f_phone" list="dl" value="${v("phone")}" onchange="fill(this.value)"></div><div><label>ชื่อลูกค้า *</label><input id="f_cname" value="${v("cname")}"></div></div>
<label>ที่อยู่ (ไม่บังคับ)</label><input id="f_addr" value="${v("addr")}"><label>หมายเหตุลูกค้า</label><input id="f_cnote" value="${v("cnote")}">
<hr><b>โทรศัพท์</b><div class="two"><div><label>ยี่ห้อ</label><input id="f_brand" value="${v("brand")}"></div><div><label>รุ่น</label><input id="f_model" value="${v("model")}"></div><div><label>สี</label><input id="f_color" value="${v("color")}"></div><div><label>IMEI / Serial</label><input id="f_imei" value="${v("imei")}"></div></div>
<label>รหัสปลดล็อกหน้าจอ (ไม่พิมพ์ลงสติกเกอร์)</label><input id="f_lock" value="${v("lock")}"><label>อาการเสีย / งานที่ให้ทำ *</label><textarea id="f_issue">${v("issue")}</textarea>
<label>อุปกรณ์ที่นำมาด้วย</label><input id="f_acc" value="${v("acc")}"><label>สภาพเครื่องก่อนรับฝาก</label><input id="f_cond" value="${v("cond")}">
<hr><b>การรับเครื่อง</b><div class="two"><div><label>ผู้รับเครื่อง</label><input id="f_by" value="${v("by")}"></div><div><label>สถานะ</label><select id="f_status">${S.statuses.map(s=>`<option ${(j.status||S.statuses[0].n)===s.n?"selected":""}>${esc(s.n)}</option>`).join("")}</select></div><div><label>ค่าบริการโดยประมาณ</label><input id="f_est" value="${v("est")}"></div><div><label>เงินมัดจำ</label><input id="f_dep" value="${v("dep")}"></div></div>
<label>หมายเหตุเพิ่มเติม</label><textarea id="f_note">${v("note")}</textarea>
<div class="row" style="margin-top:12px"><button class="btn" onclick="saveJob()">บันทึก</button><button class="btn g" onclick="${cur?`go('det','${cur}')`:`go('dash')`}">ยกเลิก</button></div></div>`;
}
const fill=p=>{const o=jobs.find(x=>x.phone===p);if(o&&!$("#f_cname").value){$("#f_cname").value=o.cname||"";$("#f_addr").value=o.addr||""}};
async function nextCode(){const m=jobs.reduce((a,j)=>Math.max(a,parseInt((j.code||"").replace(/\D/g,""))||0),0);
  return runTransaction(fdb,async t=>{const r=doc(fdb,"settings","counter"),s=await t.get(r),n=Math.max(s.exists()?s.data().n:0,m)+1;t.set(r,{n});return"SL-"+String(n).padStart(5,"0")})}
async function saveJob(){
  const o={};["phone","cname","addr","cnote","brand","model","color","imei","lock","issue","acc","cond","by","status","est","dep","note"].forEach(k=>o[k]=$("#f_"+k).value.trim());
  if(!o.phone||!o.cname||!o.issue){toast("กรุณากรอกเบอร์ ชื่อ และอาการเสีย");return}
  const now=new Date().toISOString();
  if(cur){const j=jobs.find(x=>x.id===cur),h=[...(j.hist||[])];if(o.status!==j.status)h.push({s:o.status,t:now});
    const ch=Object.keys(o).filter(k=>(j[k]||"")!==o[k]).filter(k=>k!=="status");
    const log=ch.length?[...(j.log||[]),{t:now,f:ch}]:(j.log||[]);
    if(await save(()=>updateDoc(J(cur),{...o,hist:h,log}))){toast("บันทึกแล้ว");go("det",cur)}}
  else{let code;try{code=await nextCode()}catch(e){toast("สร้างรหัสงานไม่ได้: "+e.code);return}
    const ref=doc(collection(fdb,"jobs"));
    if(await save(()=>setDoc(ref,{...o,code,date:now,hist:[{s:o.status,t:now}],log:[],acct:[]}))){toast("บันทึกแล้ว "+code);go("det",ref.id)}}
}
function vDet(){
  const j=jobs.find(x=>x.id===cur);if(!j){$("#m").innerHTML="กำลังโหลด… <button class='btn g' onclick=\"go('dash')\">กลับ</button>";return}
  const L=(a,b)=>b?`<div><label>${a}</label>${esc(b)}</div>`:"",a0=(j.acct||[])[0]||{};
  $("#m").innerHTML=`<div class="row"><h2 style="margin:0;flex:1">${esc(j.code)} ${bd(j.status)}</h2><button class="btn g" onclick="go('dash')">← กลับ</button><button class="btn g" onclick="go('form','${j.id}')">แก้ไข</button><button class="btn r" onclick="delJob('${j.id}')">ลบ</button></div>
<div class="card"><div class="two">${L("ลูกค้า",j.cname)}${L("เบอร์โทร",j.phone)}${L("ที่อยู่",j.addr)}${L("ยี่ห้อ/รุ่น/สี",[j.brand,j.model,j.color].filter(Boolean).join(" "))}${L("IMEI",j.imei)}${L("รหัสปลดล็อก",j.lock)}${L("อาการ",j.issue)}${L("อุปกรณ์ที่มาด้วย",j.acc)}${L("สภาพเครื่อง",j.cond)}${L("วันที่/เวลารับ",fd(j.date)+" "+ft(j.date))}${L("ผู้รับเครื่อง",j.by)}${L("ค่าบริการโดยประมาณ",j.est)}${L("มัดจำ",j.dep)}${L("หมายเหตุ",j.note)}</div></div>
<div class="card"><b>เปลี่ยนสถานะ</b><div class="row"><select id="ns">${S.statuses.map(s=>`<option ${s.n===j.status?"selected":""}>${esc(s.n)}</option>`).join("")}</select><button class="btn" onclick="chSt('${j.id}')">อัปเดต</button></div>
<div style="margin-top:8px;color:#667085;font-size:13px">${[...(j.hist||[]).map(h=>[h.t,"สถานะ → "+h.s]),...(j.log||[]).map(l=>[l.t,"แก้ไขข้อมูล: "+l.f.join(", ")])].sort((a,b)=>b[0].localeCompare(a[0])).map(h=>`${fd(h[0])} ${ft(h[0])} — ${esc(h[1])}`).join("<br>")}</div></div>
<div class="card"><b>พิมพ์เอกสาร</b><div class="row" style="margin-top:8px"><button class="btn g" onclick="pr('int','${j.id}')">1. ข้อมูลภายในร้าน</button><button class="btn g" onclick="pr('stk','${j.id}')">2. สติกเกอร์ (${esc(S.sticker)})</button><button class="btn g" onclick="pr('rec','${j.id}')">3. ใบรับฝากเครื่อง</button><button class="btn g" onclick="pr('acc','${j.id}')">4. ใบข้อมูลบัญชี</button></div></div>
<div class="card"><b>ข้อมูลบัญชีที่ตั้งค่าให้ลูกค้า (ไม่เก็บรหัสผ่าน)</b><div class="two"><div><label>ประเภท (Apple/Google/Email)</label><input id="a_t" value="${esc(a0.t||"")}"></div><div><label>Username / Email</label><input id="a_u" value="${esc(a0.u||"")}"></div></div><label>รายละเอียด/หมายเหตุ</label><input id="a_n" value="${esc(a0.n||"")}"><div class="row" style="margin-top:8px"><button class="btn" onclick="saveAcct('${j.id}')">บันทึกข้อมูลบัญชี</button></div></div>`;
}
const pr=(k,id)=>printDoc(k,jobs.find(x=>x.id===id),S,toast);
async function chSt(id){const j=jobs.find(x=>x.id===id),s=$("#ns").value;if(s===j.status)return;if(await save(()=>updateDoc(J(id),{status:s,hist:[...(j.hist||[]),{s,t:new Date().toISOString()}]})))toast("เปลี่ยนสถานะแล้ว")}
async function saveAcct(id){if(await save(()=>updateDoc(J(id),{acct:[{t:$("#a_t").value.trim(),u:$("#a_u").value.trim(),n:$("#a_n").value.trim(),d:new Date().toISOString()}]})))toast("บันทึกแล้ว")}
async function delJob(id){if(confirm("ลบงานนี้ถาวร?")&&await save(()=>deleteDoc(J(id))))go("dash")}
function vCust(){
  const m={};jobs.forEach(j=>{(m[j.phone]=m[j.phone]||{n:j.cname,p:j.phone,l:[]}).l.push(j)});
  const t=q.toLowerCase(),L=Object.values(m).filter(c=>!t||(c.n+" "+c.p).toLowerCase().includes(t));
  $("#m").innerHTML=`<h2>ลูกค้า</h2><div class="card"><input placeholder="ค้นหาชื่อ / เบอร์" value="${esc(q)}" oninput="q=this.value;go('cust')">${L.map(c=>`<div style="padding:10px 0;border-bottom:1px solid #dfe3ea"><b>${esc(c.n)}</b> · ${esc(c.p)} <span style="color:#667085">(${c.l.length} งาน)</span><br>${c.l.map(j=>`<a href="#" onclick="go('det','${j.id}');return false">${esc(j.code)} ${esc(j.model||"")}</a> `).join(" ")}</div>`).join("")||"<p>ไม่พบลูกค้า</p>"}</div><p style="color:#667085;font-size:13px">รายชื่อลูกค้ารวบรวมจากงานรับเครื่อง แยกตามเบอร์โทร</p>`;
  const i=$("#m input");i.focus();i.setSelectionRange(i.value.length,i.value.length);
}
function vSet(){
  $("#m").innerHTML=`<h2>ตั้งค่า</h2><div class="card"><b>ข้อมูลร้าน</b><div class="two"><div><label>ชื่อร้าน</label><input id="s_name" value="${esc(S.name)}"></div><div><label>เบอร์โทร</label><input id="s_phone" value="${esc(S.phone)}"></div><div><label>Facebook</label><input id="s_fb" value="${esc(S.fb)}"></div><div><label>Email</label><input id="s_email" value="${esc(S.email)}"></div></div><label>ที่อยู่</label><input id="s_addr" value="${esc(S.addr)}"><label>โลโก้ (ชื่อไฟล์ที่อัปโหลดไว้ใน GitHub เช่น logo.png)</label><input id="s_logo" value="${esc(S.logo)}"><label>ขนาดสติกเกอร์</label><select id="s_sticker"><option ${S.sticker==="50x30"?"selected":""}>50x30</option><option ${S.sticker==="60x40"?"selected":""}>60x40</option></select><div class="row" style="margin-top:10px"><button class="btn" onclick="saveShop()">บันทึก</button></div></div>
<div class="card"><b>สถานะงาน</b>${S.statuses.map((s,i)=>`<div class="row" style="margin-top:6px"><input id="st_n${i}" value="${esc(s.n)}"><input id="st_c${i}" type="color" value="${s.c}" style="max-width:60px;flex:none"><button class="btn g" onclick="mvSt(${i},-1)">↑</button><button class="btn g" onclick="mvSt(${i},1)">↓</button><button class="btn r" onclick="delSt(${i})">ลบ</button></div>`).join("")}<div class="row" style="margin-top:10px"><button class="btn g" onclick="addSt()">+ เพิ่มสถานะ</button><button class="btn" onclick="saveSt()">บันทึกสถานะ</button></div></div>
<div class="card"><b>บัญชีเข้าสู่ระบบ</b><label>รหัสผ่านปัจจุบัน</label><input id="c_old" type="password"><div class="two"><div><label>รหัสผ่านใหม่ (6 ตัวขึ้นไป)</label><input id="c_np" type="password"></div><div><label>อีเมลใหม่ (ระบบจะส่งลิงก์ยืนยัน)</label><input id="c_ne" type="email"></div></div><div class="row" style="margin-top:8px"><button class="btn" onclick="chPw()">เปลี่ยนรหัสผ่าน</button><button class="btn" onclick="chEm()">เปลี่ยนอีเมล</button></div></div>
<div class="card"><b>สำรอง/กู้คืนข้อมูล</b><div class="row" style="margin-top:8px"><button class="btn" onclick="backup()">ดาวน์โหลดไฟล์สำรอง (JSON)</button><input type="file" accept=".json" onchange="restore(this.files[0])"></div><p style="color:#667085;font-size:12px">ไฟล์สำรองมีรหัสปลดล็อกเครื่องลูกค้า เก็บไว้ในที่ปลอดภัย</p></div>`;
}
const rd=()=>S.statuses.map((s,i)=>({n:$("#st_n"+i)?.value.trim()||s.n,c:$("#st_c"+i)?.value||s.c}));
async function saveShop(){const o={};["name","phone","fb","email","addr","logo","sticker"].forEach(k=>o[k]=$("#s_"+k).value.trim());if(await save(()=>setDoc(SH,{...S,...o})))toast("บันทึกแล้ว")}
async function pushSt(a){if(await save(()=>setDoc(SH,{...S,statuses:a})))toast("บันทึกสถานะแล้ว")}
const saveSt=()=>pushSt(rd()),addSt=()=>pushSt([...rd(),{n:"สถานะใหม่",c:"#7a8394"}]);
const delSt=i=>{if(confirm("ลบสถานะนี้?")){const a=rd();a.splice(i,1);pushSt(a)}};
const mvSt=(i,d)=>{const a=rd(),k=i+d;if(k<0||k>=a.length)return;[a[i],a[k]]=[a[k],a[i]];pushSt(a)};
async function reauth(){const u=auth.currentUser,p=$("#c_old").value;if(!p){toast("กรอกรหัสผ่านปัจจุบัน");return null}try{await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,p));return u}catch(e){toast("รหัสผ่านปัจจุบันไม่ถูกต้อง");return null}}
async function chPw(){const n=$("#c_np").value;if(n.length<6){toast("รหัสผ่านใหม่ต้อง 6 ตัวขึ้นไป");return}const u=await reauth();if(u&&await save(()=>updatePassword(u,n)))toast("เปลี่ยนรหัสผ่านแล้ว")}
async function chEm(){const n=$("#c_ne").value.trim();if(!n){toast("กรอกอีเมลใหม่");return}const u=await reauth();if(u&&await save(()=>verifyBeforeUpdateEmail(u,n)))toast("ส่งลิงก์ยืนยันไปที่อีเมลใหม่แล้ว")}
function backup(){const b=new Blob([JSON.stringify({settings:S,jobs},null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="sl-mobile-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
async function restore(f){if(!f||!confirm("กู้คืนจะเขียนทับงานที่มีรหัสเดียวกัน ดำเนินการต่อ?"))return;try{const d=JSON.parse(await f.text());for(const j of d.jobs||[]){const{id,...r}=j;await setDoc(J(id),r)}if(d.settings)await setDoc(SH,d.settings);toast("กู้คืนแล้ว "+(d.jobs||[]).length+" งาน")}catch(e){toast("กู้คืนไม่สำเร็จ: "+(e.code||e.message))}}
Object.assign(window,{go,logout,setq,setfs,fill,saveJob,pr,chSt,saveAcct,delJob,saveShop,saveSt,addSt,delSt,mvSt,chPw,chEm,backup,restore});
