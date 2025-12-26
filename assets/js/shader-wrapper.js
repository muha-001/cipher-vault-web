// shader-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل Shader JS Files متوافق مع ES6 Modules
// ⭐ يستخدمه three-scene.js (الملف المُعدّل) للحصول على CopyShader, FXAAShader...

// ⛔ لا يمكن استيراد CopyShader.js, FXAAShader.js مباشرة لأنها تعتمد على window.THREE
// ⭐ لذا نستخدم window.THREE لجلبها

// ⭐ التصدير الموحّد
export {
  window.CopyShader,
  window.FXAAShader
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
