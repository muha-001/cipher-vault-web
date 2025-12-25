// bloom-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل Bloom JS Files متوافق مع ES6 Modules
// ⭐ يستخدمه three-scene.js (الملف المُعدّل) للحصول على UnrealBloomPass...

// ⭐ استيراد الكلاسات من ملفاتها الأصلية (التي أرسلتها)
// ⭐ هذه الملفات يجب أن تكون متوفرة في نفس المجلد (assets/js/)
import { UnrealBloomPass } from './UnrealBloomPass.js';

// ⭐ (اختياري) إذا كنت تستخدم LuminosityHighPassShader أيضًا (يُستخدم من قبل UnrealBloomPass):
// import { LuminosityHighPassShader } from './LuminosityHighPassShader.js';

// ⭐ التصدير الموحّد
export {
  UnrealBloomPass
  // LuminosityHighPassShader // (إذا أضفت السطر أعلاه)
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
