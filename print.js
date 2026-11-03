const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("en-GB")},ft=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
function qr(t){try{const x=qrcode(0,"M");x.addData(t);x.make();return x.createSvgTag({cellSize:2,margin:0,scalable:true})}catch(e){return""}}
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
    const[w,h]=S.sticker.split("x").map(Number),big=w>=60,fs=big?9:7,q=big?24:16,pad=1.5;
    run(`<div class="pg" style="width:${w}mm;height:${h}mm;padding:${pad}mm;display:flex;gap:1.5mm;font-size:${fs}px;line-height:1.3"><div style="flex:1;min-width:0;overflow:hidden"><div style="${ln};font-weight:700">${esc(S.name)}</div><div style="${ln};font-weight:700;font-size:${fs+3}px">${esc(j.code)}</div><div style="${ln}">${esc(j.cname)}</div><div style="${ln}">${esc(j.phone)}</div><div style="${ln}">${esc(((j.brand||"")+" "+(j.model||"")).trim())}</div><div style="${ln}">${fd(j.date)}</div></div><div style="width:${q}mm;height:${q}mm;flex:none">${qr(j.code)}</div></div>`,`${w}mm ${h}mm`,"0");
  }else if(kind==="rec"){
    const r=(a,b)=>b?`<div style="display:flex;gap:3mm;padding:1.3mm 0;border-bottom:1px dashed #b7c3dc"><span style="width:25mm;flex:none;color:#1d4aa3;font-weight:700">${a}</span><span style="flex:1;font-weight:700">${esc(b)}</span></div>`:"";
    const box=(t,c,items)=>items.length?`<div style="border:1.5px solid ${c};border-radius:2.5mm;margin-bottom:3mm;overflow:hidden"><div style="background:${c};color:#fff;font-weight:700;padding:1mm 3mm">${t}</div><div style="padding:1.5mm 3mm;font-weight:700;font-size:14px;line-height:1.5">${items.map(esc).join(" &bull; ")}</div></div>`:"";
    run(`<div class="pg" style="width:210mm;height:148mm;display:flex;flex-direction:column;font-size:13px;line-height:1.4">
<div style="background:#1d4aa3;color:#fff;padding:5mm 8mm;display:flex;align-items:center;gap:5mm">${S.logo?`<div style="background:#fff;border-radius:2mm;padding:1mm">${logo(S,12)}</div>`:""}<div style="flex:1"><div style="font-size:24px;font-weight:700">${esc(S.name)}</div><div style="font-size:14px">ໃບຮັບເຄື່ອງ</div></div><div style="text-align:right"><div style="font-size:28px;font-weight:700;letter-spacing:1px">${esc(j.code)}</div><div style="font-size:14px">ວັນທີ ${fd(j.date)} &nbsp; ເວລາ ${ft(j.date)}</div></div></div>
<div style="flex:1;display:flex;gap:7mm;padding:4mm 8mm 0;min-height:0"><div style="flex:1.1">${r("ຊື່ລູກຄ້າ",j.cname)}${r("ເບີໂທ",j.phone)}${r("ເຄື່ອງ",dev)}${r("ຜູ້ຮັບເຄື່ອງ",j.by)}</div>
<div style="flex:1;display:flex;gap:3mm"><div style="flex:1">${box("ການບໍລິການ","#e0781f",list(j.issues,j.issue))}${box("ສະພາບເຄື່ອງ","#1f9d6b",list(j.conds,j.cond))}</div><div style="width:24mm;height:24mm;flex:none">${qr(j.code)}</div></div></div>
<div style="margin:2mm 8mm 0;background:#fff4d1;border:1.5px solid #e0a800;border-radius:2.5mm;padding:2mm 3.5mm;font-size:11.5px;line-height:1.45"><b>❖ ໝາຍເຫດ:</b><br>▪ ກະລຸນາຮັກສາໃບຝາກເຄື່ອງຢ່າງທ່ານໃຫ້ດີ ເວລາຮັບເຄື່ອງໃຫ້ເອົາໃບຝາກເຄື່ອງມາພ້ອມ<br>▪ ການຮັບປະກັນເຄື່ອງມີຜົນ ແມ່ນຈະເລີ່ມນັບຕັ້ງແຕ່ມື້ທີ່ທາງຮ້ານເຮົາໄດ້ແຈ້ງໃຫ້ມາຮັບເຄື່ອງ, ຖ້າຫາກວ່າພາຍໃນ 1-3 ເດືອນ ລູກຄ້າຍັງບໍ່ມາຮັບເຄື່ອງ ທາງຮ້ານຈະບໍ່ສາມາດຮັບປະກັນເຄື່ອງຂອງລູກຄ້າໄດ້</div>
<div style="margin-top:3mm;background:#12306b;color:#fff;padding:2.5mm 8mm;display:flex;justify-content:space-between;font-size:12.5px"><span>ເບີໂທຕິດຕໍ່: ${esc(S.phone)} &nbsp;|&nbsp; Facebook: ${esc(S.fb)}</span><span>ຂໍຂອບໃຈທີ່ມາອຸດໜູນຮ້ານ ${esc(S.name)}</span></div></div>`,"A5 landscape","0");
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
