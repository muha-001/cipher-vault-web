document.getElementById('encryptBtn').addEventListener('click', () => processFile('encrypt'));
document.getElementById('decryptBtn').addEventListener('click', () => processFile('decrypt'));

async function processFile(mode) {
  const fileInput = document.getElementById('fileInput');
  const passwordInput = document.getElementById('password');
  const file = fileInput.files[0];
  const password = passwordInput.value;
  const statusDiv = document.getElementById('status');

  if (!file) {
    showError("يرجى اختيار ملف أولاً.");
    return;
  }

  if (!password) {
    showError("يرجى إدخال كلمة مرور.");
    return;
  }

  if (password.length < 10) {
    if (!confirm("كلمة المرور قصيرة جدًّا (أقل من 10 أحرف). يُوصى باستخدام 12 حرفًا على الأقل.\nهل تريد المتابعة على أي حال؟")) {
      return;
    }
  }

  try {
    showStatus("معالجة الملف...", "success");
    const arrayBuffer = await file.arrayBuffer();
    let processedData;

    if (mode === 'encrypt') {
      processedData = await encryptFile(arrayBuffer, password);
      const blob = new Blob([processedData]);
      downloadFile(file.name + '.encrypted', blob);
    } else {
      if (!file.name.endsWith('.encrypted')) {
        throw new Error("الملف يجب أن ينتهي بامتداد '.encrypted' لفك التشفير.");
      }
      processedData = await decryptFile(arrayBuffer, password);
      const blob = new Blob([processedData]);
      const originalName = file.name.slice(0, -11);
      downloadFile(originalName + '.decrypted', blob);
    }

    showStatus(`تم ${mode === 'encrypt' ? 'تشفير' : 'فك تشفير'} الملف بنجاح!`, "success");
    passwordInput.value = '';
    fileInput.value = '';
  } catch (err) {
    console.error("خطأ في المعالجة:", err);
    showError("فشل العملية: " + (err.message || "حدث خطأ غير متوقع"));
  }
}

async function encryptFile(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encrypted), 28);
  return result;
}

async function decryptFile(encryptedData, password) {
  const buffer = new Uint8Array(encryptedData);
  if (buffer.length < 28) throw new Error("بيانات مشفرة غير صالحة.");

  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const ciphertext = buffer.slice(28);

  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return decrypted;
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
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
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

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

function showError(message) {
  showStatus(message, 'error');
}
