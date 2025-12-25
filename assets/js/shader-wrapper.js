// shader-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل Shader JS Files متوافق مع ES6 Modules
// ⭐ يستخدمه three-scene.js (الملف المُعدّل) للحصول على CopyShader, FXAAShader...

// ⭐ استيراد الكلاسات من ملفاتها الأصلية (التي أرسلتها)
// ⭐ هذه الملفات يجب أن تكون متوفرة في نفس المجلد (assets/js/)
import { CopyShader } from './CopyShader.js';
import { FXAAShader } from './FXAAShader.js';

// ⭐ (اختياري) إذا كنت تستخدم LuminosityHighPassShader أيضًا (يُستخدم من قبل UnrealBloomPass):
// import { LuminosityHighPassShader } from './LuminosityHighPassShader.js';

// ⭐ التصدير الموحّد
export {
  CopyShader,
  FXAAShader
  // LuminosityHighPassShader // (إذا أضفت السطر أعلاه)
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
