const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
function qr(t){try{const x=qrcode(0,"M");x.addData(t);x.make();return x.createSvgTag({cellSize:2,margin:0,scalable:true})}catch(e){return""}}
const logo=(S,h)=>S.logo?`<img src="${esc(new URL(S.logo,location.href).href)}" style="height:${h}mm;max-width:100%;display:block">`:"";
const ln="white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
function run(body,page,margin){
  const f=document.createElement("iframe");
  f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  const w=f.contentWindow,d=w.document;
  d.open();
  d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&family=Noto+Sans+Thai:wght@400;700&display=swap" rel="stylesheet"><style>@page{size:${page};margin:${margin}}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:'Noto Sans Lao','Noto Sans Thai',sans-serif;color:#000}svg{width:100%;height:100%;display:block}.pg{break-after:page;overflow:hidden;word-break:break-word}.pg:last-child{break-after:auto}hr{border:0;border-top:1px solid #000;margin:2mm 0}</style></head><body>${body}</body></html>`);
  d.close();
  setTimeout(()=>{(d.fonts?d.fonts.ready:Promise.resolve()).then(()=>{try{w.focus();w.print()}catch(e){alert("พิมพ์ไม่ได้: "+e.message)}setTimeout(()=>f.remove(),60000)})},1000);
}
export function printDoc(kind,j,S,warn){
  if(kind==="stk"){
    const[w,h]=S.sticker.split("x").map(Number),big=w>=60,fs=big?9:7,q=big?24:16,pad=1.5;
    run(`<div class="pg" style="width:${w}mm;height:${h}mm;padding:${pad}mm;display:flex;gap:1.5mm;font-size:${fs}px;line-height:1.3"><div style="flex:1;min-width:0;overflow:hidden"><div style="${ln};font-weight:700">${esc(S.name)}</div><div style="${ln};font-weight:700;font-size:${fs+3}px">${esc(j.code)}</div><div style="${ln}">${esc(j.cname)}</div><div style="${ln}">${esc(j.phone)}</div><div style="${ln}">${esc(((j.brand||"")+" "+(j.model||"")).trim())}</div><div style="${ln}">${fd(j.date)}</div></div><div style="width:${q}mm;height:${q}mm;flex:none">${qr(j.code)}</div></div>`,`${w}mm ${h}mm`,"0");
  }else if(kind==="rec"){
    run(`<div class="pg" style="width:72mm;margin:0 auto;padding:3mm 0;font-size:12px;line-height:1.45">${logo(S,12)}<div style="text-align:center;font-weight:700;font-size:15px">ໃບຮັບເຄື່ອງຮ້ານ ${esc(S.name)}</div><hr>ຊື່: ${esc(j.cname)}<br>Code: ${esc(j.code)}<br>ວັນທີ: ${fd(j.date)}<hr><b>❖ ໝາຍເຫດ:</b><br>▪ ກະລຸນາຮັກສາໃບຝາກເຄື່ອງຢ່າງທ່ານໃຫ້ດີ ເວລາຮັບເຄື່ອງໃຫ້ເອົາໃບຝາກເຄື່ອງມາພ້ອມ<br>▪ ການຮັບປະກັນເຄື່ອງມີຜົນ ແມ່ນຈະເລີ່ມນັບຕັ້ງແຕ່ມື້ທີ່ທາງຮ້ານເຮົາໄດ້ແຈ້ງໃຫ້ມາຮັບເຄື່ອງ, ຖ້າຫາກວ່າພາຍໃນ 1-3 ເດືອນ ລູກຄ້າຍັງບໍ່ມາຮັບເຄື່ອງ ທາງຮ້ານຈະບໍ່ສາມາດຮັບປະກັນເຄື່ອງຂອງລູກຄ້າໄດ້<hr>ເບີໂທຕິດຕໍ່: ${esc(S.phone)}<br>Facebook: ${esc(S.fb)}<div style="text-align:center;margin-top:2mm">(ຂໍຂອບໃຈທີ່ມາອຸດໜູນຮ້ານ ${esc(S.name)})</div></div>`,"80mm auto","0");
  }else if(kind==="acc"){
    const a=(j.acct||[])[0];if(!a){warn("ยังไม่ได้บันทึกข้อมูลบัญชี");return}
    run(`<div class="pg" style="padding:4mm;font-size:14px;line-height:1.7">${logo(S,14)}<h2 style="margin:0 0 3mm">${esc(S.name)} — ใบส่งมอบข้อมูลบัญชี</h2>รหัสงาน: ${esc(j.code)}<br>ลูกค้า: ${esc(j.cname)} (${esc(j.phone)})<br>ประเภทบัญชี: ${esc(a.t)}<br>Username/Email: ${esc(a.u)}<br>รหัสผ่าน: ______________________ (เขียนด้วยมือ ระบบไม่เก็บ)<br>วันที่ดำเนินการ: ${fd(a.d)}<br>หมายเหตุ: ${esc(a.n)}<br><br><br>ลายเซ็นลูกค้า ____________________ &nbsp; ลายเซ็นร้าน ____________________</div>`,"A4","12mm");
  }else{
    run(`<div class="pg" style="padding:2mm;font-size:13px;line-height:1.6">${logo(S,14)}<h2 style="margin:0 0 3mm">${esc(S.name)} — ข้อมูลภายในร้าน ${esc(j.code)}</h2>ลูกค้า: ${esc(j.cname)} ${esc(j.phone)}<br>เครื่อง: ${esc(j.brand)} ${esc(j.model)} ${esc(j.color)}<br>IMEI: ${esc(j.imei)}<br>รหัสปลดล็อก: ${esc(j.lock)}<br>อาการ: ${esc(j.issue)}<br>อุปกรณ์: ${esc(j.acc)}<br>สภาพเครื่อง: ${esc(j.cond)}<br>รับเมื่อ: ${fd(j.date)} ${ft(j.date)} โดย ${esc(j.by)}<br>ค่าบริการประมาณ: ${esc(j.est)} · มัดจำ: ${esc(j.dep)}<br>สถานะ: ${esc(j.status)}<br>หมายเหตุ: ${esc(j.note)}<hr>ประวัติสถานะ:<br>${(j.hist||[]).map(x=>fd(x.t)+" "+ft(x.t)+" — "+esc(x.s)).join("<br>")}</div>`,"A4","12mm");
  }
}
