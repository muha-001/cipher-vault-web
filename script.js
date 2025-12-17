// CipherVault Web — النسخة الآمنة النهائية
// مُصمم ليعمل 100% بدون أخطاء في التشفير/فك التشفير

const translations = {
  ar: {
    "security-note": "🔒 جميع عمليات التشفير تتم في متصفحك — ملفاتك لا تُرسل إلى أي مكان.",
    "header-desc": "واجهة آمنة لتشفير وفك تشفير ملفاتك باستخدام معايير عسكرية (AES-256-GCM)",
    "encrypt-title": "🔐 تشفير ملف",
    "decrypt-title": "🔓 فك تشفير ملف",
    "choose-file": "اختر ملفًا للتشفير",
    "choose-encrypted-file": "اختر ملفًا مشفرًا (.encrypted)",
    "password-label": "كلمة المرور (12 حرفًا على الأقل)",
    "encrypt-btn": "تشفير الملف",
    "decrypt-btn": "فك التشفير",
    "switch-encrypt": "التشفير",
    "switch-decrypt": "فك التشفير",
    "footer-text": "مشروع مفتوح المصدر تحت ترخيص MIT",
    "weak-password": "كلمة المرور قصيرة جدًّا. يُوصى باستخدام 12 حرفًا على الأقل.\nهل تريد المتابعة؟",
    "no-file": "يرجى اختيار ملف أولاً.",
    "no-password": "يرجى إدخال كلمة مرور.",
    "not-encrypted": "الملف غير صالح — يجب أن يكون ملفًا مشفرًا بواسطة CipherVault.",
    "file-corrupted": "الملف المشفر تالف أو غير صالح.",
    "wrong-password": "كلمة المرور غير صحيحة.",
    "processing": "معالجة الملف...",
    "encrypt-success": "تم تشفير الملف بنجاح!",
    "decrypt-success": "تم فك تشفير الملف بنجاح!"
  },
  en: {
    "security-note": "🔒 All encryption happens in your browser — your files never leave your device.",
    "header-desc": "Secure military-grade file encryption and decryption (AES-256-GCM)",
    "encrypt-title": "🔐 Encrypt File",
    "decrypt-title": "🔓 Decrypt File",
    "choose-file": "Choose a file to encrypt",
    "choose-encrypted-file": "Choose an encrypted file (.encrypted)",
    "password-label": "Password (at least 12 characters)",
    "encrypt-btn": "Encrypt File",
    "decrypt-btn": "Decrypt",
    "switch-encrypt": "Encrypt",
    "switch-decrypt": "Decrypt",
    "footer-text": "Open-source project under MIT License",
    "weak-password": "Password is too short. Use at least 12 characters.\nProceed anyway?",
    "no-file": "Please select a file first.",
    "no-password": "Please enter a password.",
    "not-encrypted": "Invalid file — must be encrypted by CipherVault.",
    "file-corrupted": "Encrypted file is corrupted or invalid.",
    "wrong-password": "Incorrect password.",
    "processing": "Processing file...",
    "encrypt-success": "File encrypted successfully!",
    "decrypt-success": "File decrypted successfully!"
  }
};

let currentLang = 'ar';
const htmlRoot = document.getElementById('htmlRoot');

function setLanguage(lang) {
  currentLang = lang;
  htmlRoot.setAttribute('lang', lang);
  htmlRoot.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key] || key;
  });
  document.getElementById('lang-ar').classList.toggle('active', lang === 'ar');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}

document.getElementById('lang-ar')?.addEventListener('click', () => setLanguage('ar'));
document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
  document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
  if (sectionId === 'encrypt-section') {
    document.getElementById('switch-to-encrypt')?.classList.add('active');
  } else {
    document.getElementById('switch-to-decrypt')?.classList.add('active');
  }
}

document.getElementById('switch-to-encrypt')?.addEventListener('click', () => showSection('encrypt-section'));
document.getElementById('switch-to-decrypt')?.addEventListener('click', () => showSection('decrypt-section'));

// === التشفير الآمن ===
async function encryptFile(originalData, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, originalData);
  
  const result = new Uint8Array(16 + 12 + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encrypted), 28);
  return result;
}

// === فك التشفير الآمن ===
async function decryptFile(encryptedBuffer, password) {
  const buffer = new Uint8Array(encryptedBuffer);
  if (buffer.length < 28) throw new Error("file-corrupted");
  
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const ciphertext = buffer.slice(28);
  
  const key = await deriveKey(password, salt);
  try {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return decrypted;
  } catch (e) {
    throw new Error("wrong-password");
  }
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// === واجهة المستخدم ===
function showError(element, key) {
  const msg = translations[currentLang][key] || key;
  element.textContent = msg;
  element.className = 'status error';
}

function showSuccess(element, key) {
  const msg = translations[currentLang][key] || key;
  element.textContent = msg;
  element.className = 'status success';
}

function downloadFile(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function handleEncrypt() {
  const fileInput = document.getElementById('fileInputEncrypt');
  const passwordInput = document.getElementById('passwordEncrypt');
  const status = document.getElementById('encrypt-status');
  
  const file = fileInput.files[0];
  const password = passwordInput.value;
  
  if (!file) return showError(status, "no-file");
  if (!password) return showError(status, "no-password");
  if (password.length < 12) {
    if (!confirm(translations[currentLang]["weak-password"])) return;
  }
  
  try {
    showSuccess(status, "processing");
    const arrayBuffer = await file.arrayBuffer();
    const encryptedData = await encryptFile(arrayBuffer, password);
    
    // ✅ اسم عشوائي لحماية السرية
    const randomName = `vault_${Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0')).join('')}.encrypted`;
    
    downloadFile(randomName, new Blob([encryptedData]));
    showSuccess(status, "encrypt-success");
    passwordInput.value = '';
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    showError(status, "unexpected-error");
  }
}

async function handleDecrypt() {
  const fileInput = document.getElementById('fileInputDecrypt');
  const passwordInput = document.getElementById('passwordDecrypt');
  const status = document.getElementById('decrypt-status');
  
  const file = fileInput.files[0];
  const password = passwordInput.value;
  
  if (!file) return showError(status, "no-file");
  if (!password) return showError(status, "no-password");
  
  try {
    showSuccess(status, "processing");
    const arrayBuffer = await file.arrayBuffer();
    const decryptedData = await decryptFile(arrayBuffer, password);
    
    // ✅ اسم افتراضي آمن
    downloadFile("ciphervault_decrypted", new Blob([decryptedData]));
    showSuccess(status, "decrypt-success");
    passwordInput.value = '';
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    showError(status, err.message || "unexpected-error");
  }
}

// ربط الأزرار
document.getElementById('encryptBtn')?.addEventListener('click', handleEncrypt);
document.getElementById('decryptBtn')?.addEventListener('click', handleDecrypt);

// تأثير 3D
document.addEventListener('mousemove', (e) => {
  const cube = document.querySelector('.cube');
  if (!cube) return;
  const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
  cube.style.transform = `translate(-50%, -50%) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  document.body.classList.add('mouse-active');
});

// تهيئة اللغة
setLanguage('ar');
