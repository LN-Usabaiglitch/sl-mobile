# SL-Mobile Management System (GitHub Pages + Firebase)

## 1) สร้าง Firebase
1. console.firebase.google.com → Add project
2. Build → Authentication → Get started → เปิด **Email/Password** → แท็บ Users → Add user (อีเมล+รหัสผ่านเจ้าของร้าน) → คัดลอก **User UID**
3. Build → Firestore Database → Create database (Production mode)
4. แท็บ Rules → วางเนื้อหาจาก `firestore.rules` แทน `PUT_OWNER_UID` ด้วย UID ข้อ 2 → Publish
5. Project settings → Your apps → Web (</>) → คัดลอก config ไปวางใน `firebase-config.js`
6. Authentication → Settings → Authorized domains → Add `ชื่อผู้ใช้.github.io`

## 2) อัปขึ้น GitHub
1. สร้าง repo → Upload files (ไฟล์ทั้งหมดอยู่ที่ root: index.html, style.css, app.js, print.js, firebase-config.js, firestore.rules, README.md และ logo.png ถ้ามี)
2. Settings → Pages → Deploy from branch → main / root
3. เปิด https://ชื่อผู้ใช้.github.io/ชื่อ-repo/ แล้วล็อกอิน

หมายเหตุ: ต้องเปิดผ่านลิงก์ GitHub Pages (https) ไม่ใช่ดับเบิลคลิกไฟล์ เพราะใช้ ES modules
