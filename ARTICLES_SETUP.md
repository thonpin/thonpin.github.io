# ติดตั้งระบบบทความ — GitHub Pages + Firebase

หน้าแคตตาล็อก: https://thonpin.github.io/articles/catalog.html
หน้ารวมบทความ: https://thonpin.github.io/articles/list.html
หน้าเขียนบทความ: https://thonpin.github.io/articles/editor.html

## โครงสร้างและสิทธิ์

GitHub Pages เป็น Static Hosting จึงใช้ Firebase Authentication (Google Login) และ Cloud Firestore สำหรับฐานข้อมูลบทความและการตรวจสิทธิ์จริง

- ผู้ชมทั่วไป: อ่านบทความสถานะ published โดยไม่ต้องเข้าสู่ระบบ
- ผู้ใช้ล็อกอินทั่วไป: ยังไม่มีสิทธิ์โพสต์
- Publisher: บันทึกฉบับร่าง แก้ไขและเผยแพร่บทความได้
- การตรวจสิทธิ์ Publisher บังคับใน firestore.rules ฝั่ง Firebase ไม่ใช่แค่ซ่อนฟอร์ม
- ระบบไม่เก็บ Google OAuth Secret หรือ Firebase Service Account ใน Public Repository

## ขั้นตอนเปิดใช้จริง (จำเป็น)

1. ไปที่ https://console.firebase.google.com/ สร้าง Firebase Project และลงทะเบียน Web App
2. เปิด Authentication > Sign-in method > Google
3. เพิ่ม thonpin.github.io ใน Firebase Authentication > Authorized domains (ใส่เฉพาะโดเมน)
4. สร้าง Cloud Firestore Database และเลือก Region ตามข้อกำหนดด้านข้อมูล
5. ✅ Firebase Web App Config สำหรับ `github-thonpin` ได้เพิ่มลงใน `assets/js/articles-config.js` แล้ว โดยไม่ต้องใส่ซ้ำ:
   - apiKey
   - authDomain
   - projectId
   - appId
6. เผยแพร่ Firestore Security Rules จากไฟล์ firestore.rules ในหน้า Firestore Database > Rules
7. สร้าง Composite Index ตาม firestore.indexes.json: articles / status Ascending + publishedAt Descending

หรือ Deploy ผ่าน Firebase CLI จาก Root Repository (ต้องเลือก Project ก่อน):
    npm install -g firebase-tools
    firebase login
    firebase use --add
    firebase deploy --only firestore

ไฟล์ firebase.json ระบุเฉพาะ Firestore Rules และ Indexes ไม่เกี่ยวข้องกับ GitHub Pages Hosting

**คำเตือน:** การ Commit ไฟล์ Rules บน GitHub ไม่เท่ากับการ Deploy Rules ไป Firebase ผู้ดูแลต้อง Publish/Deploy ด้วยตนเอง อย่าเปิด allow read, write: if true

## เพิ่มบัญชีผู้เขียน Publisher

1. เปิดหน้า https://thonpin.github.io/articles/editor.html
2. Sign in ด้วย Google ของเจ้าของบทความ
3. ไป Firebase Console > Authentication > Users แล้วคัดลอก UID ของผู้ใช้รายนั้น
4. ใน Firestore สร้าง Collection article_publishers และ Document ID เท่ากับ UID ข้างต้น
5. เพิ่มฟิลด์ enabled (Boolean) = true
6. โหลดหน้า Editor ใหม่ ผู้เขียนจะเห็นฟอร์มสร้างโพสต์

บทบาท Publisher เขียน/ลบผ่านหน้าเว็บไม่ได้ (Security Rules ปฏิเสธ) ต้องสร้างโดยผู้ดูแลผ่าน Firebase Console หรือ Admin SDK ในสภาพแวดล้อมปลอดภัยเท่านั้น

## วิธีลงบทความ

1. กรอกชื่อบทความ คำอธิบาย หมวดหมู่
2. วางลิงก์ Google Docs หรือ Google Slides หรือไฟล์ PDF จาก Google Drive รวมถึงโค้ด iframe ที่มี src เป็น URL ของ Google เท่านั้น
3. กดดูตัวอย่าง Embed เพื่อทดสอบการแสดงผล
4. เลือกบันทึกฉบับร่าง (draft) หรือเผยแพร่สาธารณะ (published)
5. เมื่อเผยแพร่ ระบบแสดงใน Catalog / List / Post และหน้าแรกจะเลือกบทความที่เผยแพร่ล่าสุด 1 รายการโดยอัตโนมัติ

รูปแบบ URL ตัวอย่างที่รองรับ:
- https://docs.google.com/document/d/FILE_ID/edit
- https://docs.google.com/presentation/d/FILE_ID/edit
- https://drive.google.com/file/d/FILE_ID/view
- https://drive.google.com/open?id=FILE_ID
- Published-to-web Docs / Slides และโค้ด iframe จาก Google

ระบบตรวจชื่อโดเมนและสร้าง URL Embed ใหม่ ไม่แสดง Raw HTML ที่วางมาจากผู้เขียน และไม่รองรับโดเมนภายนอกอื่น

## สิทธิ์การอ่านไฟล์ Google

การวางลิงก์แบบดูอย่างเดียวไม่ได้เปิดสิทธิ์ไฟล์อัตโนมัติ ก่อนเผยแพร่โปรดตั้ง Share > General access > Anyone with the link > Viewer หากนโยบายองค์กรอนุญาต สำหรับ Google Docs/Slides ที่ไม่แสดงใน iframe อาจต้องใช้ File > Share > Publish to web ด้วย

หากไฟล์จำกัดเฉพาะสมาชิกองค์กร ผู้เยี่ยมชมทั่วไปอาจเห็นหน้าขอสิทธิ์แทน Embed หน้าบทความจึงมีลิงก์ไปต้นฉบับเพื่อเปิดดูหรือขอสิทธิ์ได้

## โครงสร้างฐานข้อมูล

Collection articles: title, summary, category, sourceUrl, sourceType, status, authorUid, authorName, createdAt, updatedAt, publishedAt

Category: software / security / ai-education / research / other
SourceType: docs / slides / pdf
Status: draft / published

Collection article_publishers: Document ID = Firebase Authentication UID; field enabled = true

ไฟล์ firestore.rules ตรวจประเภทข้อมูล ความยาว URL ที่อนุญาต สิทธิ์ Publisher และความคงที่ของข้อมูลผู้เขียน

## Acceptance Test ก่อนใช้งานจริง

- [ ] ผู้ใช้ทั่วไปเปิด Catalog/List/Published Post ได้โดยไม่ล็อกอิน
- [ ] ผู้ใช้ทั่วไปเปิด Draft Post ไม่ได้
- [ ] ผู้ล็อกอินที่ไม่มีสิทธิ์ Publisher โพสต์ไม่ได้ แม้แก้ JavaScript ในเบราว์เซอร์
- [ ] Publisher บันทึก Draft และเผยแพร่บทความได้
- [ ] หน้าแรกแสดงบทความล่าสุดที่ Published
- [ ] Link Docs / Slides / PDF ที่มีสิทธิ์ Viewer ฝังและเปิดต้นฉบับได้
- [ ] ลิงก์ปลอมโดเมนภายนอกถูกปฏิเสธ
- [ ] ทดสอบมือถือ 320/390px, Keyboard, Screen Reader และ CSP Console
- [ ] ตรวจ Firestore Rules และ Composite Index ว่าถูก Deploy จริง

## ข้อจำกัด

Firebase Web Config ได้ตั้งค่าแล้ว แต่ต้องเปิด Google Authentication, สร้างฐานข้อมูล, เผยแพร่ Firestore Rules/Indexes และอนุมัติบัญชี Publisher ก่อน ระบบจึงจะเขียนบทความได้จริง ในระหว่างที่ยังไม่ได้ตั้งค่า หน้า Public แสดงข้อความแจ้งว่ายังไม่เปิดบริการบทความ และหน้า Editor ไม่เปิดให้โพสต์

เนื้อหาจาก Firestore ถูกโหลดด้วย JavaScript หากต้องการ SEO สำหรับเนื้อหาบทความเต็มรูปแบบ อาจพัฒนา Static Generation เพิ่มในอนาคต การวัด Core Web Vitals และทดสอบ Browser จริงยังต้องทำเพิ่มเติม
