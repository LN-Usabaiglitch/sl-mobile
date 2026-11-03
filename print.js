const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
function qr(t){try{const x=qrcode(0,"L");x.addData(t);x.make();return x.createSvgTag({cellSize:2,margin:0,scalable:true})}catch(e){return""}}
const logo=(S,h)=>S.logo?`<img src="${esc(new URL(S.logo,location.href).href)}" style="height:${h}mm;max-width:100%;display:block">`:"";
const ln="white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
const list=(a,s)=>(a&&a.length?a:[s]).filter(Boolean);
function run(body,page,margin){
  const f=document.createElement("iframe");
  f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  const w=f.contentWindow,d=w.document,ph=new URL("PhetsarathOT.ttf",location.href).href;
  d.open();
  d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&display=swap" rel="stylesheet"><style>@font-face{font-family:'Phetsarath OT';src:local('Phetsarath OT'),local('PhetsarathOT'),url('${ph}') format('truetype')}@page{size:${page};margin:${margin}}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;padding:0}body{font-family:'Phetsarath OT','Noto Sans Lao',sans-serif;color:#000}svg{width:100%;height:100%;display:block}.pg{break-after:page;overflow:hidden;word-break:break-word}.pg:last-child{break-after:auto}hr{border:0;border-top:1px solid #000;margin:2mm 0}</style></head><body>${body}</body></html>`);
  d.close();
  setTimeout(()=>{(d.fonts?d.fonts.ready:Promise.resolve()).then(()=>{try{w.focus();w.print()}catch(e){alert("ພິມບໍ່ໄດ້: "+e.message)}setTimeout(()=>f.remove(),60000)})},1000);
}
export function printDoc(kind,j,S,warn,x={}){
  const dev=[j.brand,j.model,j.color].filter(Boolean).join(" ");
  if(kind==="stk"){
    const sv=list(j.issues,j.issue).join(", "),ls=(a,b)=>`<div style="display:flex;gap:.8mm;font-size:7px;line-height:1.35;min-width:0"><span style="flex:none">${a}</span><span style="flex:1;min-width:0;font-weight:700;${ln}">${b}</span></div>`;
    run(`<div class="pg" style="width:30mm;height:40mm;padding:1.4mm 1.6mm;display:flex;flex-direction:column;line-height:1.3">
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:1mm"><span style="font-size:9px;font-weight:700;min-width:0;${ln}">${esc(j.cname)}</span><span style="font-size:8px;font-weight:700;flex:none">${esc(j.code)}</span></div>
${ls("ເບີ:",esc(j.phone))}${ls("ລຸ້ນ / ສີ:",esc([j.brand,j.model,j.color].filter(Boolean).join(" ")))}${ls("ລະຫັດ:",esc(j.lock))}
<hr style="margin:.8mm 0"><div style="text-align:center;font-size:6.5px">ອາການ</div>
<div style="flex:1;min-height:0;overflow:hidden;font-size:8.5px;font-weight:700;line-height:1.3;padding-top:.4mm">${esc(sv)}</div>
<div style="text-align:center;font-size:8px;font-weight:700;${ln}"><span style="font-size:6px;font-weight:400">ເບີຮ້ານ </span>${esc(S.phone)}</div>
<div style="text-align:center;font-size:6px">${fd(j.date)} ${ft(j.date)}</div></div>`,"30mm 40mm","0");
  }else if(kind==="rec"){
    const dv=[dev,list(j.issues,j.issue).join(", ")].filter(Boolean).join(" · ");
    const f=(a,b,w)=>`<div style="${w};display:flex;gap:1mm;align-items:baseline;min-width:0"><span style="flex:none">${a}</span><span style="flex:1;min-width:0;border-bottom:.25mm dotted #444;font-weight:700;${ln}">${b}</span></div>`;
    run(`<div class="pg" style="width:100mm;height:60mm;border:.3mm solid #999;padding:2.5mm 3.5mm;display:flex;flex-direction:column;font-size:8px;line-height:1.35">
<div style="text-align:center;font-size:12px;font-weight:700;text-decoration:underline;color:#12306b">ໃບຮັບເຄື່ອງຮ້ານ ${esc(S.name)}</div>
<div style="display:flex;gap:2.5mm;margin-top:2mm">${f("ຊື່:",esc(j.cname),"flex:1.3")}${f("Code:",esc(j.code),"flex:1")}${f("ວັນທີ:",fd(j.date)+" "+ft(j.date),"flex:1.35")}</div>
${dv?`<div style="margin-top:1mm;font-size:7px;${ln}">ເຄື່ອງ / ບໍລິການ: <b>${esc(dv)}</b></div>`:""}
<div style="display:flex;gap:2mm;margin-top:1.2mm;flex:1;min-height:0"><div style="flex:1;font-size:6.8px;line-height:1.35"><b><u>❖ ໝາຍເຫດ:</u></b><br>▪ ກະລຸນາຮັກສາໃບຝາກເຄື່ອງຂອງທ່ານໃຫ້ດີ ເວລາຮັບເຄື່ອງໃຫ້ເອົາໃບຝາກເຄື່ອງມາພ້ອມ<br>▪ ການຮັບປະກັນເຄື່ອງສ້ອມ ແມ່ນຈະເລີ່ມນັບຕັ້ງແຕ່ມື້ທີ່ທາງຮ້ານເຮົາໄດ້ແຈ້ງໃຫ້ມາຮັບເອົາເຄື່ອງ, ຖ້າຫາກວ່າພາຍໃນ 1-3 ເດືອນ ລູກຄ້າຍັງບໍ່ມາຮັບເອົາເຄື່ອງ ທາງຮ້ານຈະບໍ່ສາມາດຮັບປະກັນເຄື່ອງຂອງລູກຄ້າໄດ້</div><div style="width:16mm;flex:none;text-align:center;font-size:5.5px;line-height:1.2"><div style="width:14mm;height:14mm;margin:0 auto">${qr(x.url||j.code)}</div>ສະແກນກວດສະຖານະ</div></div>
<div style="font-size:7.5px"><u>ເບີໂທຕິດຕໍ່: ${esc(S.phone)}</u> &nbsp; <u>Facebook: ${esc(S.fb)}</u></div>
<div style="text-align:center;font-weight:700;font-size:7.5px;margin-top:.8mm">(ຂໍຂອບໃຈທຸກທ່ານທີ່ມາອຸດໜູນຮ້ານ ${esc(S.name)})</div></div>`,"A4 portrait","5mm");
  }else if(kind==="acc"){
    const r=(a,b)=>`<div style="display:flex;gap:4mm;padding:2.2mm 0;border-bottom:1px solid #c9d3e6"><span style="width:48mm;flex:none;color:#1d4aa3;font-weight:700">${a}</span><span style="flex:1;font-weight:700;min-height:6mm">${b||"&nbsp;"}</span></div>`;
    const dots="................................................";
    const svc=list(j.issues,j.issue),note=[j.cnote,j.note].filter(Boolean).join(" / ");
    run(`<div class="pg" style="width:186mm;font-size:15px;line-height:1.5"><div style="background:#1d4aa3;color:#fff;padding:5mm 6mm;border-radius:3mm;display:flex;align-items:center;gap:5mm">${S.logo?`<div style="background:#fff;border-radius:2mm;padding:1mm">${logo(S,12)}</div>`:""}<div style="flex:1"><div style="font-size:22px;font-weight:700">${esc(S.name)}</div><div style="font-size:15px">ຂໍ້ມູນລູກຄ້າ / ລະຫັດອີເມວ</div></div><div style="font-size:24px;font-weight:700">${esc(j.code)}</div></div>
<div style="margin-top:4mm">${r("ວັນທີຮັບເຄື່ອງ",fd(j.date)+" "+ft(j.date))}${r("ວັນທີສຳເລັດ",x.done?fd(x.done)+" "+ft(x.done):dots)}${r("ຊື່ລູກຄ້າ",esc(j.cname))}${r("ເບີໂທ",esc(j.phone))}${r("ເຄື່ອງ",esc(dev))}${r("ລະຫັດໜ້າຈໍ",esc(j.lock))}${r("ອີເມວ",esc(x.email))}${r("ລະຫັດຜ່ານ",x.pw?esc(x.pw):dots)}</div>
<div style="margin-top:5mm;border:1.5px solid #e0781f;border-radius:3mm;overflow:hidden"><div style="background:#e0781f;color:#fff;font-weight:700;padding:1.5mm 4mm">ການບໍລິການ</div><div style="padding:3mm 4mm;font-weight:700;font-size:16px;line-height:1.7">${svc.map(s=>"▪ "+esc(s)).join("<br>")||"&nbsp;"}${note?`<div style="font-weight:400;font-size:13px;margin-top:2mm;color:#444">ໝາຍເຫດ: ${esc(note)}</div>`:""}</div></div>
<div style="margin-top:14mm;display:flex;justify-content:space-between;font-size:14px"><span>ລາຍເຊັນລູກຄ້າ ____________________</span><span>ລາຍເຊັນຮ້ານ ____________________</span></div></div>`,"A4","12mm");
  }
}
