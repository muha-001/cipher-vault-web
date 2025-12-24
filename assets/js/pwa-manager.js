/*!
 * CipherVault 3D Pro - Enhanced PWA Manager
 * Version: 4.4.0 - Fixed for Local Files, r182 Compatibility & Enhanced Security
 *
 * This file manages PWA features including Service Worker registration,
 * install prompts, caching, offline mode, and updates.
 */

class EnhancedPWAManager {
  constructor() {
    // State
    this.deferredPrompt = null;
    this.installed = false;
    this.standalone = false;
    this.updateAvailable = false;
    this.serviceWorker = null;
    this.offlineMode = false;
    this.hiddenStart = null;

    // Components
    this.components = {};

    // Configuration
    this.config = {
      CACHE_NAME: 'ciphervault-pro-v4.4',
      OFFLINE_CACHE: 'ciphervault-offline-v4.4',
      CACHE_VERSION: '4.4.0',
      PRECACHE_FILES: [
        '/',
        '/index.html',
        '/offline.html',
        '/manifest.json',
        '/assets/css/main.css',
        '/assets/css/style.css',
        '/assets/css/dark-mode.css',
        '/assets/css/pwa.css',
        '/assets/js/three.min.js',
        '/assets/js/OrbitControls.js',
        '/assets/js/EffectComposer.js',
        '/assets/js/RenderPass.js',
        '/assets/js/ShaderPass.js',
        '/assets/js/main.js',
        '/assets/js/config.js',
        '/assets/js/translations.js',
        '/assets/js/three-scene.js',
        '/assets/js/crypto-core.js',
        '/assets/js/crypto-military.js',
        '/assets/js/crypto-worker.js',
        '/assets/js/audit-log.js',
        '/assets/js/security-audit.js',
        '/assets/js/pwa-manager.js',
        '/assets/js/ui-manager.js',
        '/assets/js/file-processor.js',
        '/assets/js/recovery-system.js',
        '/assets/js/worker-manager.js',
        '/assets/icons/icon-192x192.png',
        '/assets/icons/icon-512x512.png'
      ],
      DYNAMIC_CACHE_WHITELIST: [
        /\.css$/,
        /\.js$/,
        /\.png$/,
        /\.jpg$/,
        /\.svg$/,
        /\.woff2?$/,
        /\.ttf$/
      ],
      SYNC_TAG: 'ciphervault-sync',
      BACKGROUND_SYNC_ENABLED: true,
      PUSH_NOTIFICATIONS_ENABLED: false,
      OFFLINE_RETRY_LIMIT: 3,
      PROMPT_DELAY_DAYS: 7
    };

    // Initialize with enhanced error handling
    this.init().catch(error => {
      console.error('Critical PWA Manager initialization error:', error);
      this.logEvent('PWA_MANAGER_INIT_CRITICAL', 'ERROR', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Initialize the PWA manager
   */
  async init() {
    console.log('Initializing Enhanced PWA Manager for CipherVault...');
    try {
      // Check install status
      this.checkInstallStatus();

      // Register Service Worker - FIXED FOR LOCAL FILES
      await this.registerServiceWorker();

      // Setup event listeners
      this.setupEventListeners();

      // Check for updates
      await this.checkForUpdates();

      // Setup offline mode
      this.setupOfflineMode();

      // Restore app state
      await this.restoreAppState();

      console.log('Enhanced PWA Manager initialized successfully');

      // Log initialization event
      this.logEvent('PWA_MANAGER_INITIALIZED', 'INFO', {
        version: this.config.CACHE_VERSION,
        installed: this.installed,
        standalone: this.standalone
      });

    } catch (error) {
      console.error('Failed to initialize PWA Manager:', error);
      this.logEvent('PWA_MANAGER_INIT_FAILED', 'ERROR', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Register Service Worker with enhanced error handling
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser.');
      this.logEvent('SERVICE_WORKER_NOT_SUPPORTED', 'WARNING', {
        timestamp: Date.now()
      });
      return;
    }

    try {
      // ⭐ التسجيل من نفس المسار الجذري
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './'
      });

      this.serviceWorker = registration;
      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              console.log('New service worker update available.');
              this.showNotification('Update available. Refresh to apply changes.', 'info');
              this.logEvent('SERVICE_WORKER_UPDATE_AVAILABLE', 'INFO', {
                timestamp: Date.now()
              });
            }
          });
        }
      });

      // Check for updates periodically
      setInterval(async () => {
        try {
          await registration.update();
        } catch (error) {
          console.warn('Service Worker update check failed:', error);
          this.logEvent('UPDATE_CHECK_FAILED', 'WARNING', {
            error: error.message,
            errorType: error.constructor.name,
            errorName: error.name,
            timestamp: Date.now()
          });
        }
      }, 60000); // Check every minute

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.logEvent('SERVICE_WORKER_REGISTRATION_FAILED', 'ERROR', {
        error: error.message,
        errorType: error.constructor.name,
        errorName: error.name,
        timestamp: Date.now()
      });
      // ⭐ لا نوقف التطبيق إذا فشل Service Worker، فقط نسجل الخطأ
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // PWA install event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;

      // Show install prompt after delay
      setTimeout(() => {
        this.showInstallPromptIfNeeded();
      }, 3000);
    });

    // PWA installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.installed = true;
      this.deferredPrompt = null;
      this.logEvent('PWA_INSTALLED_SUCCESS', 'INFO', {
        timestamp: Date.now(),
        displayMode: this.getDisplayMode()
      });
      this.showNotification('CipherVault installed successfully!', 'success');
    });

    // Service Worker controller change
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        this.showNotification('App updated. Reload to use new features.', 'info');
        this.logEvent('SERVICE_WORKER_CONTROLLER_CHANGED', 'INFO', {
          timestamp: Date.now()
        });
      });
    }

    // Online/Offline events
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.logEvent('CONNECTION_RESTORED', 'INFO', {
        timestamp: Date.now()
      });
      this.showNotification('Connection restored.', 'info');
    });

    window.addEventListener('offline', () => {
      this.offlineMode = true;
      this.logEvent('CONNECTION_LOST', 'WARNING', {
        timestamp: Date.now()
      });
      this.showNotification('Offline mode. Some features may be limited.', 'warning');
    });
  }

  /**
   * Check for updates
   */
  async checkForUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        try {
          await registration.update();
          console.log('Service Worker updated check completed');
        } catch (error) {
          console.warn('Service Worker update check failed:', error);
        }
      }
    }
  }

  /**
   * Setup offline mode
   */
  setupOfflineMode() {
    this.offlineMode = !navigator.onLine;
    if (this.offlineMode) {
      this.logEvent('STARTED_OFFLINE', 'WARNING', {
        timestamp: Date.now()
      });
      this.showNotification('Started in offline mode.', 'warning');
    }
  }

  /**
   * Restore app state
   */
  async restoreAppState() {
    // Example: restore cached data
    try {
      const cache = await caches.open(this.config.OFFLINE_CACHE);
      const keys = await cache.keys();
      console.log(`Restored ${keys.length} cached items`);
      this.logEvent('APP_STATE_RESTORED', 'INFO', {
        cachedItems: keys.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to restore app state from cache:', error);
      this.logEvent('APP_STATE_RESTORE_FAILED', 'WARNING', {
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check install status
   */
  checkInstallStatus() {
    // Check if installed via PWA
    this.installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    // Check if standalone (iOS)
    this.standalone = window.navigator.standalone === true;
    console.log('PWA install status:', { installed: this.installed, standalone: this.standalone });
  }

  /**
   * Get display mode
   */
  getDisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.navigator.standalone === true) {
      return 'standalone-ios';
    }
    return 'browser';
  }

  /**
   * Show install prompt if needed
   */
  showInstallPromptIfNeeded() {
    // Check if already installed
    if (this.installed) {
      console.log('App already installed, skipping prompt');
      return false;
    }

    // Check if deferred prompt is available
    if (!this.deferredPrompt) {
      console.log('No deferred prompt available');
      return false;
    }

    // Check if user dismissed prompt recently
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed) {
      const daysSinceDismissal = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < this.config.PROMPT_DELAY_DAYS) {
        console.log(`Prompt dismissed recently (${Math.round(daysSinceDismissal)} days ago), skipping`);
        return false;
      }
    }

    console.log('Showing install prompt...');
    this.showInstallPrompt();
    return true;
  }

  /**
   * Show install prompt
   */
  showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('Cannot show install prompt: installed=', this.installed, 'deferredPrompt=', !!this.deferredPrompt);
      return;
    }

    // Create custom install prompt
    const installPrompt = document.createElement('div');
    installPrompt.id = 'pwaInstallPrompt';
    installPrompt.className = 'pwa-install-prompt';
    installPrompt.innerHTML = `
      <div class="pwa-prompt-content">
        <div class="pwa-prompt-header">
          <div class="pwa-prompt-icon">
            <i class="fas fa-rocket"></i>
          </div>
          <button class="pwa-prompt-close" id="pwaPromptClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="pwa-prompt-body">
          <h3 class="pwa-prompt-title">Install CipherVault Pro</h3>
          <p class="pwa-prompt-description">Install the app for an enhanced encryption experience and faster performance</p>
          <div class="pwa-prompt-features">
            <div class="pwa-feature">
              <i class="fas fa-bolt"></i>
              <span>Instant Loading</span>
            </div>
            <div class="pwa-feature">
              <i class="fas fa-shield-alt"></i>
              <span>Advanced Protection</span>
            </div>
            <div class="pwa-feature">
              <i class="fas fa-desktop"></i>
              <span>Full App Interface</span>
            </div>
            <div class="pwa-feature">
              <i class="fas fa-database"></i>
              <span>Offline Access</span>
            </div>
          </div>
        </div>
        <div class="pwa-prompt-footer">
          <button class="pwa-prompt-button pwa-prompt-install" id="pwaPromptInstall">
            <i class="fas fa-download"></i>
            Install App
          </button>
          <button class="pwa-prompt-button pwa-prompt-dismiss" id="pwaPromptDismiss">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    // Add styles if not present
    if (!document.querySelector('#pwa-prompt-styles')) {
      const styles = document.createElement('style');
      styles.id = 'pwa-prompt-styles';
      styles.textContent = `
        .pwa-install-prompt {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 10000;
          animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Cairo', 'Orbitron', sans-serif;
        }
        .pwa-prompt-content {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.95), rgba(5, 10, 25, 0.98));
          border: 3px solid #00d4ff;
          border-radius: 20px;
          padding: 25px;
          width: 380px;
          max-width: 90vw;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3),
                      0 0 60px rgba(0, 212, 255, 0.15);
        }
        .pwa-prompt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .pwa-prompt-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        .pwa-prompt-close {
          background: transparent;
          border: none;
          color: #8a8aa3;
          font-size: 20px;
          cursor: pointer;
          transition: color 0.3s;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pwa-prompt-close:hover {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
        }
        .pwa-prompt-title {
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          margin-bottom: 10px;
          text-align: center;
        }
        .pwa-prompt-description {
          color: #8a8aa3;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 25px;
          text-align: center;
        }
        .pwa-prompt-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .pwa-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(0, 212, 255, 0.08);
          border-radius: 10px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          transition: all 0.3s;
        }
        .pwa-feature:hover {
          background: rgba(0, 212, 255, 0.15);
          transform: translateY(-2px);
        }
        .pwa-feature i {
          color: #00d4ff;
          font-size: 1.1rem;
        }
        .pwa-feature span {
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pwa-prompt-footer {
          display: flex;
          gap: 12px;
        }
        .pwa-prompt-button {
          flex: 1;
          padding: 14px 20px;
          border-radius: 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          letter-spacing: 0.5px;
        }
        .pwa-prompt-install {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: white;
        }
        .pwa-prompt-install:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }
        .pwa-prompt-dismiss {
          background: transparent;
          color: #8a8aa3;
          border: 2px solid #8a8aa3;
        }
        .pwa-prompt-dismiss:hover {
          color: #ffffff;
          border-color: #ffffff;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(50px) scale(0.9); }
        }
        .pwa-install-prompt.hiding {
          animation: slideOutRight 0.3s ease forwards;
        }
        @media (max-width: 768px) {
          .pwa-install-prompt {
            bottom: 20px;
            right: 20px;
            left: 20px;
            width: auto;
          }
          .pwa-prompt-content {
            width: 100%;
            padding: 20px;
          }
          .pwa-prompt-features {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Add prompt to body
    document.body.appendChild(installPrompt);

    // Add event handlers
    const closeBtn = installPrompt.querySelector('#pwaPromptClose');
    const dismissBtn = installPrompt.querySelector('#pwaPromptDismiss');
    const installBtn = installPrompt.querySelector('#pwaPromptInstall');

    // Close prompt
    closeBtn.addEventListener('click', () => {
      this.hideInstallPrompt(installPrompt);
    });

    // Dismiss prompt
    dismissBtn.addEventListener('click', () => {
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
      this.hideInstallPrompt(installPrompt);
      this.logEvent('PWA_PROMPT_DISMISSED', 'INFO', {
        timestamp: Date.now()
      });
    });

    // Install app
    installBtn.addEventListener('click', async () => {
      if (!this.deferredPrompt) {
        this.showNotification('App is already installed on your device', 'info');
        return;
      }
      try {
        // Show the original browser install prompt
        await this.deferredPrompt.prompt();
        const choiceResult = await this.deferredPrompt.userChoice;
        this.logEvent('PWA_INSTALL_PROMPT_SHOWN', 'INFO', {
          outcome: choiceResult.outcome,
          timestamp: Date.now()
        });
        this.deferredPrompt = null;
        if (choiceResult.outcome === 'accepted') {
          this.showNotification('Installing CipherVault...', 'success');
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
        this.showNotification('App installation failed', 'error');
        this.logEvent('PWA_INSTALL_FAILED', 'ERROR', {
          error: error.message,
          errorName: error.name,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Hide install prompt
   */
  hideInstallPrompt(promptElement) {
    if (promptElement) {
      promptElement.classList.add('hiding');
      setTimeout(() => {
        if (promptElement.parentNode) {
          promptElement.parentNode.removeChild(promptElement);
        }
      }, 300);
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add styles if not present
    if (!document.querySelector('#pwa-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'pwa-notification-styles';
      styles.textContent = `
        .pwa-notification {
          position: fixed;
          bottom: 100px;
          right: 30px;
          z-index: 9998;
          animation: slideInRight 0.3s ease;
          font-family: 'Cairo', sans-serif;
          max-width: 400px;
        }
        .notification-content {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 20px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          border-left: 4px solid;
        }
        .pwa-notification-info .notification-content {
          background: rgba(0, 168, 255, 0.9);
          border-left-color: #00a8ff;
          color: white;
        }
        .pwa-notification-success .notification-content {
          background: rgba(0, 255, 136, 0.9);
          border-left-color: #00ff88;
          color: white;
        }
        .pwa-notification-warning .notification-content {
          background: rgba(255, 170, 0, 0.9);
          border-left-color: #ffaa00;
          color: white;
        }
        .pwa-notification-error .notification-content {
          background: rgba(255, 71, 87, 0.9);
          border-left-color: #ff4757;
          color: white;
        }
        .notification-content i {
          font-size: 20px;
        }
        .notification-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }
        .notification-close {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .notification-close:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(50px); }
        }
        .pwa-notification.hiding {
          animation: slideOutRight 0.3s ease forwards;
        }
        @media (max-width: 768px) {
          .pwa-notification {
            bottom: 80px;
            right: 20px;
            left: 20px;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Close notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });

    // Auto-close after duration
    setTimeout(() => {
      if (notification.parentNode) {
        this.hideNotification(notification);
      }
    }, duration);
  }

  /**
   * Hide notification
   */
  hideNotification(notification) {
    if (notification) {
      notification.classList.add('hiding');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  /**
   * Get appropriate notification icon
   */
  getNotificationIcon(type) {
    const icons = {
      info: 'info-circle',
      success: 'check-circle',
      warning: 'exclamation-triangle',
      error: 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
  }

  /**
   * Log event with security considerations
   */
  logEvent(type, severity, data) {
    // Use AuditLogger if available
    if (window.AuditLogger && typeof window.AuditLogger.log === 'function') {
      try {
        window.AuditLogger.log(type, severity, data, 'pwa-manager');
      } catch (error) {
        console.warn('Failed to log audit event:', error);
      }
    }

    // Log to console with appropriate method
    const severityLower = severity.toLowerCase();
    const consoleMethods = {
      'error': console.error,
      'warning': console.warn,
      'info': console.info,
      'debug': console.debug,
      'log': console.log
    };
    const consoleMethod = consoleMethods[severityLower] || console.log;

    // Ensure consoleMethod is a function
    if (typeof consoleMethod === 'function') {
      try {
        consoleMethod(`PWA Event [${severity}]: ${type}`, data);
      } catch (e) {
        // Fallback to console.log
        console.log(`PWA Event [${severity}]: ${type}`, data);
      }
    } else {
      // Fallback if consoleMethod is not a function
      console.log(`PWA Event [${severity}]: ${type}`, data);
    }
  }

  /**
   * Get PWA status
   */
  getStatus() {
    return {
      installed: this.installed,
      standalone: this.standalone,
      updateAvailable: this.updateAvailable,
      offlineMode: this.offlineMode,
      serviceWorkerRegistered: !!this.serviceWorker,
      notificationPermission: Notification.permission,
      backgroundSyncSupported: 'SyncManager' in window,
      displayMode: this.getDisplayMode(),
      cacheVersion: this.config.CACHE_VERSION
    };
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => {
        if (cacheName.startsWith('ciphervault')) {
          return caches.delete(cacheName);
        }
      }));
      this.logEvent('CACHE_CLEARED', 'INFO', {
        timestamp: Date.now(),
        cacheCount: cacheNames.length
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// ============================================================================
// GLOBAL INITIALIZATION
// ============================================================================

/**
 * Check if PWA features are supported
 */
function isPwaSupported() {
  return 'serviceWorker' in navigator &&
         'caches' in window &&
         'Promise' in window;
}

// Global PWA Manager instance
let PWAManager = null;

if (typeof window !== 'undefined' && isPwaSupported()) {
  try {
    PWAManager = new EnhancedPWAManager();
    // Make manager globally available
    window.PWAManager = PWAManager;

    // Export for modules
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = {
        EnhancedPWAManager,
        PWAManager,
        isPwaSupported
      };
    }

    // Dispatch event when manager is ready
    window.dispatchEvent(new CustomEvent('pwa:ready', {
      detail: { manager: PWAManager }
    }));

  } catch (error) {
    console.error('Failed to initialize PWA Manager:', error);
    // Create fallback manager with limited functionality
    PWAManager = {
      getStatus: () => ({ error: 'PWA Manager initialization failed' }),
      showNotification: (message, type) => {
        console.log(`[PWA Notification - ${type}]: ${message}`);
      },
      logEvent: (type, severity, data) => {
        console.log(`[PWA Event - ${severity}]: ${type}`, data);
      },
      showInstallPromptIfNeeded: () => false
    };
    window.PWAManager = PWAManager;
  }
} else {
  console.warn('PWA features not supported in this browser');
  // Create dummy manager for compatibility
  PWAManager = {
    getStatus: () => ({
      supported: false,
      message: 'PWA features not supported in this browser'
    }),
    showNotification: (message, type) => {
      console.log(`[PWA Notification - ${type}]: ${message}`);
    },
    logEvent: (type, severity, data) => {
      console.log(`[PWA Event - ${severity}]: ${type}`, data);
    },
    showInstallPromptIfNeeded: () => false
  };
  if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnhancedPWAManager,
    PWAManager: PWAManager || { getStatus: () => ({ error: 'PWA not initialized' }) },
    isPwaSupported
  };
}

console.log('🔧 EnhancedPWAManager v4.4.0 loaded - All fixes applied');
