// postprocessing-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل PostProcessing JS Files متوافق مع ES6 Modules
// ⭐ يستخدمه three-scene.js (الملف المُعدّل) للحصول على EffectComposer, RenderPass, ShaderPass...

// ⭐ استيراد الكلاسات من ملفاتها الأصلية (التي أرسلتها)
// ⭐ هذه الملفات يجب أن تكون متوفرة في نفس المجلد (assets/js/)
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { ShaderPass } from './ShaderPass.js';

// ⭐ (اختياري) إذا كنت تستخدم UnrealBloomPass أيضًا:
// import { UnrealBloomPass } from './UnrealBloomPass.js';

// ⭐ التصدير الموحّد
export {
  EffectComposer,
  RenderPass,
  ShaderPass
  // UnrealBloomPass // (إذا أضفت السطر أعلاه)
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
