// background-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل background.js متوافق مع ES6 Modules (نوعًا ما)
// ⭐ يستخدمه three-scene.js أو الملفات الأخرى للإشارة إلى وجود background.js
// ⭐ ملاحظة: background.js هو Service Worker، لا يمكن استيراده كـ ES6 Module بشكل مباشر.
// ⭐ هذا الملف فقط يُشير إلى وجود الملف الأصلي، لا يحتوي على محتواه.

// ⭐ لا يمكن استيراد background.js كـ ES6 Module لأنها Service Worker
// ⭐ لذا لا نستخدم import هنا
// ⭐ بدلاً من ذلك، نُعرف ثابتًا يُشير إلى اسم الملف الأصلي
// ⭐ يمكن استخدام هذا الثابت في تسجيل Service Worker لاحقًا

// ⭐ تعريف ثابت لاسم الملف
export const BACKGROUND_WORKER_URL = './background.js';

// ⭐ (اختياري) إذا كنت ترغب في تصدير وظيفة لتسجيل Service Worker
// ⭐ (يُفضل أن يتم هذا من main.js أو pwa-manager.js)
/*
export async function registerBackgroundWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(BACKGROUND_WORKER_URL);
      console.log('Background worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Failed to register background worker:', error);
      throw error;
    }
  } else {
    console.warn('Service Workers are not supported in this browser.');
    return null;
  }
}
*/

// ⭐ التصدير الموحّد
export {
  // registerBackgroundWorker, // (إذا أضفت الوظيفة أعلاه)
  BACKGROUND_WORKER_URL
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
