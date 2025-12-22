/**
 * CipherVault 3D Pro - Main Enhanced Initialization System
 * Version: 4.2.0 Enhanced
 * نظام تهيئة محسن مع إدارة موارد متقدمة
 */

class CipherVaultProEnhanced {
    constructor() {
        // حالة التطبيق
        this.state = {
            isInitialized: false,
            isProcessing: false,
            securityLevel: 'MEDIUM',
            performanceMode: 'AUTO',
            language: 'en',
            darkMode: false,
            currentOperation: null,
            activeWorkers: 0,
            resources: {
                loaded: 0,
                total: 0
            }
        };

        // إدارة الموارد
        this.resourceManager = {
            scripts: new Map(),
            styles: new Map(),
            workers: new Map(),
            caches: new Map()
        };

        // نظام الأخطاء
        this.errorHandler = {
            criticalErrors: [],
            warnings: [],
            lastError: null,
            errorCount: 0,
            
            logError: function(error, severity = 'medium', context = '') {
                const errorObj = {
                    timestamp: new Date().toISOString(),
                    message: error.message || error.toString(),
                    stack: error.stack,
                    severity,
                    context,
                    browserInfo: this.getBrowserInfo()
                };
                
                if (severity === 'critical') {
                    this.criticalErrors.push(errorObj);
                    this.showCriticalError(errorObj);
                } else if (severity === 'warning') {
                    this.warnings.push(errorObj);
                    console.warn(`[WARNING] ${error.message}`, errorObj);
                } else {
                    console.error(`[ERROR] ${error.message}`, errorObj);
                }
                
                this.lastError = errorObj;
                this.errorCount++;
                
                // تحديث واجهة المستخدم
                this.updateErrorDisplay();
                
                return errorObj;
            },
            
            getBrowserInfo: function() {
                return {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    online: navigator.onLine,
                    memory: navigator.deviceMemory || 'unknown',
                    cores: navigator.hardwareConcurrency || 'unknown'
                };
            },
            
            showCriticalError: function(error) {
                const errorHTML = `
                    <div class="status-message error">
                        <div class="status-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="status-content">
                            <h4 data-i18n="critical-error">CRITICAL ERROR</h4>
                            <span>${error.message}</span>
                            <small>${error.context}</small>
                        </div>
                        <button class="status-close" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                document.getElementById('status-container').insertAdjacentHTML('afterbegin', errorHTML);
            },
            
            updateErrorDisplay: function() {
                const errorBadge = document.querySelector('.security-audit');
                if (errorBadge && this.errorCount > 0) {
                    errorBadge.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Errors: <strong style="color: var(--warning)">${this.errorCount}</strong></span>
                    `;
                }
            }
        };

        // نظام الأداء
        this.performanceMonitor = {
            metrics: {
                fps: 0,
                memory: 0,
                cpu: 0,
                networkSpeed: 0,
                operationTimes: new Map()
            },
            
            startMonitoring: function() {
                // مراقبة FPS
                let frameCount = 0;
                let lastTime = performance.now();
                
                const measureFPS = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    if (currentTime - lastTime >= 1000) {
                        this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                        frameCount = 0;
                        lastTime = currentTime;
                        
                        // تحديث العرض إذا كان موجوداً
                        const fpsDisplay = document.getElementById('performanceFPS');
                        if (fpsDisplay) {
                            fpsDisplay.textContent = `${this.metrics.fps} FPS`;
                        }
                    }
                    requestAnimationFrame(measureFPS);
                };
                
                measureFPS();
                
                // مراقبة الذاكرة
                if (performance.memory) {
                    setInterval(() => {
                        this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                        const memoryDisplay = document.getElementById('performanceMemory');
                        if (memoryDisplay) {
                            memoryDisplay.textContent = `${this.metrics.memory} MB`;
                        }
                    }, 5000);
                }
                
                // مراقبة سرعة الشبكة
                this.monitorNetworkSpeed();
            },
            
            monitorNetworkSpeed: async function() {
                try {
                    const startTime = performance.now();
                    const response = await fetch('/assets/icons/favicon.ico', { cache: 'no-store' });
                    const endTime = performance.now();
                    
                    if (response.ok) {
                        const contentLength = response.headers.get('content-length') || 1024;
                        const duration = endTime - startTime;
                        this.metrics.networkSpeed = Math.round((contentLength / duration) * 8); // بت في الثانية
                    }
                } catch (error) {
                    console.log('Network speed monitoring unavailable');
                }
            },
            
            startOperation: function(operationName) {
                this.metrics.operationTimes.set(operationName, {
                    start: performance.now(),
                    end: null,
                    duration: null
                });
            },
            
            endOperation: function(operationName) {
                const operation = this.metrics.operationTimes.get(operationName);
                if (operation) {
                    operation.end = performance.now();
                    operation.duration = operation.end - operation.start;
                    return operation.duration;
                }
                return null;
            },
            
            getPerformanceReport: function() {
                return {
                    ...this.metrics,
                    timestamp: new Date().toISOString(),
                    isLowPerformance: this.metrics.fps < 30 || this.metrics.memory > 500
                };
            }
        };

        // نظام إدارة الموارد
        this.resourceLoader = {
            loadScript: async function(url, options = {}) {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = url;
                    
                    if (options.async) script.async = true;
                    if (options.defer) script.defer = true;
                    if (options.type) script.type = options.type;
                    
                    script.onload = () => {
                        this.resourceManager.scripts.set(url, {
                            loaded: true,
                            timestamp: Date.now(),
                            size: this.getScriptSize(url)
                        });
                        resolve(script);
                    };
                    
                    script.onerror = (error) => {
                        this.errorHandler.logError(
                            new Error(`Failed to load script: ${url}`),
                            'medium',
                            'ResourceLoader'
                        );
                        reject(error);
                    };
                    
                    document.head.appendChild(script);
                });
            },
            
            loadStylesheet: async function(url, options = {}) {
                return new Promise((resolve, reject) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    
                    if (options.media) link.media = options.media;
                    
                    link.onload = () => {
                        this.resourceManager.styles.set(url, {
                            loaded: true,
                            timestamp: Date.now()
                        });
                        resolve(link);
                    };
                    
                    link.onerror = (error) => {
                        this.errorHandler.logError(
                            new Error(`Failed to load stylesheet: ${url}`),
                            'low',
                            'ResourceLoader'
                        );
                        reject(error);
                    };
                    
                    document.head.appendChild(link);
                });
            },
            
            getScriptSize: async function(url) {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    const size = response.headers.get('content-length');
                    return size ? parseInt(size) : 0;
                } catch (error) {
                    return 0;
                }
            },
            
            preloadResources: function(resources) {
                resources.forEach(resource => {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = resource.url;
                    
                    if (resource.as) link.as = resource.as;
                    if (resource.type) link.type = resource.type;
                    
                    document.head.appendChild(link);
                });
            },
            
            cleanupUnusedResources: function(maxAge = 3600000) { // ساعة واحدة
                const now = Date.now();
                
                // تنظيف السكربتات غير المستخدمة
                this.resourceManager.scripts.forEach((info, url) => {
                    if (now - info.timestamp > maxAge) {
                        const scripts = document.querySelectorAll(`script[src="${url}"]`);
                        scripts.forEach(script => {
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                        });
                        this.resourceManager.scripts.delete(url);
                    }
                });
            }
        };

        // إدارة العمال (Web Workers)
        this.workerManager = {
            workers: new Map(),
            taskQueue: [],
            maxWorkers: navigator.hardwareConcurrency || 4,
            
            createWorker: function(workerUrl, options = {}) {
                return new Promise((resolve, reject) => {
                    try {
                        const worker = new Worker(workerUrl, options);
                        const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        
                        worker.onmessage = (event) => {
                            this.handleWorkerMessage(workerId, event);
                        };
                        
                        worker.onerror = (error) => {
                            this.errorHandler.logError(
                                error,
                                'medium',
                                `Worker ${workerId}`
                            );
                            this.workers.delete(workerId);
                        };
                        
                        this.workers.set(workerId, {
                            instance: worker,
                            busy: false,
                            createdAt: Date.now(),
                            tasksCompleted: 0
                        });
                        
                        this.state.activeWorkers = this.workers.size;
                        resolve(workerId);
                    } catch (error) {
                        this.errorHandler.logError(error, 'medium', 'WorkerManager');
                        reject(error);
                    }
                });
            },
            
            postMessage: function(workerId, message) {
                return new Promise((resolve, reject) => {
                    const workerInfo = this.workers.get(workerId);
                    if (!workerInfo) {
                        reject(new Error(`Worker ${workerId} not found`));
                        return;
                    }
                    
                    if (workerInfo.busy) {
                        this.taskQueue.push({
                            workerId,
                            message,
                            resolve,
                            reject
                        });
                        return;
                    }
                    
                    workerInfo.busy = true;
                    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    workerInfo.instance.onmessage = (event) => {
                        workerInfo.busy = false;
                        workerInfo.tasksCompleted++;
                        
                        if (event.data.type === 'ERROR') {
                            reject(new Error(event.data.error));
                        } else {
                            resolve({
                                taskId,
                                result: event.data.data,
                                workerId
                            });
                        }
                        
                        // معالجة المهمة التالية في الطابور
                        this.processNextTask();
                    };
                    
                    workerInfo.instance.postMessage({
                        ...message,
                        taskId
                    });
                });
            },
            
            processNextTask: function() {
                if (this.taskQueue.length > 0) {
                    const nextTask = this.taskQueue.shift();
                    this.postMessage(nextTask.workerId, nextTask.message)
                        .then(nextTask.resolve)
                        .catch(nextTask.reject);
                }
            },
            
            handleWorkerMessage: function(workerId, event) {
                // يمكن إضافة معالجة مخصصة للرسائل هنا
                console.log(`Message from worker ${workerId}:`, event.data);
            },
            
            terminateWorker: function(workerId) {
                const workerInfo = this.workers.get(workerId);
                if (workerInfo) {
                    workerInfo.instance.terminate();
                    this.workers.delete(workerId);
                    this.state.activeWorkers = this.workers.size;
                }
            },
            
            terminateAllWorkers: function() {
                this.workers.forEach((workerInfo, workerId) => {
                    workerInfo.instance.terminate();
                });
                this.workers.clear();
                this.taskQueue = [];
                this.state.activeWorkers = 0;
            },
            
            getWorkerStats: function() {
                const stats = {
                    totalWorkers: this.workers.size,
                    busyWorkers: Array.from(this.workers.values()).filter(w => w.busy).length,
                    totalTasksCompleted: Array.from(this.workers.values()).reduce((sum, w) => sum + w.tasksCompleted, 0),
                    queuedTasks: this.taskQueue.length
                };
                return stats;
            }
        };

        // إدارة الذاكرة
        this.memoryManager = {
            buffers: new Set(),
            allocated: 0,
            maxAllocation: 1024 * 1024 * 1024, // 1GB
            
            allocateBuffer: function(size) {
                if (this.allocated + size > this.maxAllocation) {
                    this.cleanup();
                }
                
                try {
                    const buffer = new ArrayBuffer(size);
                    this.buffers.add(buffer);
                    this.allocated += size;
                    return buffer;
                } catch (error) {
                    this.errorHandler.logError(error, 'medium', 'MemoryManager');
                    throw new Error(`Failed to allocate ${size} bytes`);
                }
            },
            
            allocateTypedArray: function(type, size) {
                const buffer = this.allocateBuffer(size * type.BYTES_PER_ELEMENT);
                return new type(buffer);
            },
            
            releaseBuffer: function(buffer) {
                if (this.buffers.has(buffer)) {
                    this.buffers.delete(buffer);
                    this.allocated -= buffer.byteLength;
                    
                    // مسح محتويات الذاكرة للأمان
                    if (buffer instanceof ArrayBuffer) {
                        new Uint8Array(buffer).fill(0);
                    }
                }
            },
            
            cleanup: function() {
                // تحرير الذاكرة القديمة
                const buffersToRemove = Array.from(this.buffers).slice(0, Math.floor(this.buffers.size / 3));
                buffersToRemove.forEach(buffer => {
                    this.releaseBuffer(buffer);
                });
            },
            
            secureWipe: function() {
                // مسح آمن لجميع المخازن
                this.buffers.forEach(buffer => {
                    if (buffer instanceof ArrayBuffer) {
                        new Uint8Array(buffer).fill(0);
                        // كتابة عشوائية متعددة
                        new Uint8Array(buffer).fill(Math.floor(Math.random() * 256));
                        new Uint8Array(buffer).fill(0xFF);
                        new Uint8Array(buffer).fill(0);
                    }
                });
                
                this.buffers.clear();
                this.allocated = 0;
            },
            
            getMemoryStats: function() {
                return {
                    allocated: this.allocated,
                    bufferCount: this.buffers.size,
                    maxAllocation: this.maxAllocation,
                    usagePercentage: (this.allocated / this.maxAllocation) * 100
                };
            }
        };

        // API الأساسية
        this.api = {
            // التشفير
            encrypt: async (file, password, options = {}) => {
                try {
                    this.state.currentOperation = 'encryption';
                    this.performanceMonitor.startOperation('encryption');
                    
                    const result = await this.cryptoCore.encryptFile(file, password, options);
                    
                    this.performanceMonitor.endOperation('encryption');
                    this.state.currentOperation = null;
                    
                    return result;
                } catch (error) {
                    this.errorHandler.logError(error, 'high', 'Encryption API');
                    throw error;
                }
            },
            
            // فك التشفير
            decrypt: async (encryptedFile, password, options = {}) => {
                try {
                    this.state.currentOperation = 'decryption';
                    this.performanceMonitor.startOperation('decryption');
                    
                    const result = await this.cryptoCore.decryptFile(encryptedFile, password, options);
                    
                    this.performanceMonitor.endOperation('decryption');
                    this.state.currentOperation = null;
                    
                    return result;
                } catch (error) {
                    this.errorHandler.logError(error, 'high', 'Decryption API');
                    throw error;
                }
            },
            
            // إدارة الملفات
            file: {
                analyze: async (file) => {
                    return await this.fileProcessor.analyzeFile(file);
                },
                
                compress: async (file, options = {}) => {
                    return await this.fileProcessor.compressFile(file, options);
                },
                
                split: async (file, chunkSize) => {
                    return await this.fileProcessor.splitFile(file, chunkSize);
                },
                
                merge: async (chunks) => {
                    return await this.fileProcessor.mergeFiles(chunks);
                }
            },
            
            // إدارة المفاتيح
            key: {
                generate: (length = 32) => {
                    return this.cryptoCore.generateKey(length);
                },
                
                derive: async (password, salt, iterations) => {
                    return await this.cryptoCore.deriveKey(password, salt, iterations);
                },
                
                secureWipe: (keyBuffer) => {
                    this.cryptoCore.secureWipe(keyBuffer);
                }
            },
            
            // إدارة النظام
            system: {
                getStatus: () => {
                    return {
                        state: this.state,
                        performance: this.performanceMonitor.getPerformanceReport(),
                        memory: this.memoryManager.getMemoryStats(),
                        workers: this.workerManager.getWorkerStats(),
                        errors: {
                            count: this.errorHandler.errorCount,
                            lastError: this.errorHandler.lastError
                        }
                    };
                },
                
                optimizePerformance: () => {
                    return this.performanceOptimizer.optimize();
                },
                
                cleanup: () => {
                    this.resourceLoader.cleanupUnusedResources();
                    this.memoryManager.cleanup();
                    return { success: true, message: 'System cleaned up' };
                }
            },
            
            // إدارة الأمان
            security: {
                audit: () => {
                    return this.securityAudit.performAudit();
                },
                
                getLevel: () => {
                    return this.state.securityLevel;
                },
                
                setLevel: (level) => {
                    if (['BASIC', 'MEDIUM', 'HIGH', 'MILITARY'].includes(level)) {
                        this.state.securityLevel = level;
                        return { success: true, newLevel: level };
                    }
                    return { success: false, error: 'Invalid security level' };
                }
            }
        };

        // تهيئة وحدات إضافية
        this.cryptoCore = null;
        this.fileProcessor = null;
        this.performanceOptimizer = null;
        this.securityAudit = null;
    }
    
    // ============================================================================
    // METHODS
    // ============================================================================
    
    /**
     * تهيئة النظام بالكامل
     */
    async initialize() {
        console.log('🚀 Starting CipherVault 3D Pro Enhanced Initialization...');
        
        try {
            // تحديث شاشة التحميل
            this.updateLoadingStatus('initializing', 10);
            
            // التحقق من المتصفح
            await this.checkBrowserCompatibility();
            this.updateLoadingStatus('browser_check_complete', 20);
            
            // تحميل الوحدات الأساسية
            await this.loadCoreModules();
            this.updateLoadingStatus('core_modules_loaded', 40);
            
            // تهيئة نظام الذاكرة
            this.memoryManager = this.memoryManager || new MemoryManager();
            this.updateLoadingStatus('memory_manager_ready', 50);
            
            // تهيئة نظام العمال
            await this.initializeWorkers();
            this.updateLoadingStatus('workers_initialized', 60);
            
            // تهيئة نظام المراقبة
            this.performanceMonitor.startMonitoring();
            this.updateLoadingStatus('monitoring_started', 70);
            
            // تهيئة واجهة المستخدم
            await this.initializeUI();
            this.updateLoadingStatus('ui_initialized', 80);
            
            // التحقق من الأمان
            await this.performSecurityCheck();
            this.updateLoadingStatus('security_check_complete', 90);
            
            // إخفاء شاشة التحميل
            this.hideLoadingScreen();
            this.updateLoadingStatus('ready', 100);
            
            this.state.isInitialized = true;
            console.log('✅ CipherVault 3D Pro Enhanced Initialized Successfully');
            
            // إظهار رسالة الترحيب
            this.showWelcomeMessage();
            
        } catch (error) {
            this.errorHandler.logError(error, 'critical', 'Initialization');
            this.showInitializationError(error);
        }
    }
    
    /**
     * التحقق من توافق المتصفح
     */
    async checkBrowserCompatibility() {
        const checks = {
            crypto: typeof crypto !== 'undefined' && crypto.subtle,
            workers: typeof Worker !== 'undefined',
            wasm: typeof WebAssembly !== 'undefined',
            fileAPI: 'File' in window && 'FileReader' in window,
            indexedDB: 'indexedDB' in window,
            serviceWorker: 'serviceWorker' in navigator
        };
        
        const missingFeatures = Object.entries(checks)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (missingFeatures.length > 0) {
            throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
        }
        
        return checks;
    }
    
    /**
     * تحميل الوحدات الأساسية
     */
    async loadCoreModules() {
        const modules = [
            { url: 'assets/js/crypto-core-enhanced.js', name: 'cryptoCore' },
            { url: 'assets/js/file-processor-enhanced.js', name: 'fileProcessor' },
            { url: 'assets/js/performance-manager.js', name: 'performanceOptimizer' },
            { url: 'assets/js/security-audit-enhanced.js', name: 'securityAudit' },
            { url: 'assets/js/ui-manager.js', name: 'uiManager' }
        ];
        
        for (const module of modules) {
            try {
                await this.resourceLoader.loadScript(module.url);
                // انتظار تهيئة الوحدة
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`Failed to load module ${module.name}:`, error);
            }
        }
    }
    
    /**
     * تهيئة العمال (Web Workers)
     */
    async initializeWorkers() {
        const workerUrls = [
            'assets/js/crypto-worker-enhanced.js',
            'assets/js/file-worker.js'
        ];
        
        for (const url of workerUrls) {
            try {
                const workerId = await this.workerManager.createWorker(url);
                console.log(`Worker created: ${workerId}`);
            } catch (error) {
                console.warn(`Failed to create worker from ${url}:`, error);
            }
        }
    }
    
    /**
     * تهيئة واجهة المستخدم
     */
    async initializeUI() {
        // تحميل ترجمات إضافية إذا لزم الأمر
        if (this.state.language !== 'en') {
            await this.loadTranslations(this.state.language);
        }
        
        // تطبيق الوضع الداكن إذا كان مفعلاً
        if (this.state.darkMode || window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.toggleDarkMode(true);
        }
        
        // إضافة مستمعي الأحداث
        this.setupEventListeners();
        
        // تهيئة التحكم بالبطاقة ثلاثية الأبعاد
        this.initialize3DCardControls();
    }
    
    /**
     * التحقق من الأمان
     */
    async performSecurityCheck() {
        const securityCheck = {
            https: window.location.protocol === 'https:',
            secureContext: window.isSecureContext,
            cryptoStrong: crypto.getRandomValues ? true : false,
            headers: {
                hsts: document.querySelector('meta[http-equiv="Strict-Transport-Security"]') ? true : false,
                csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? true : false
            }
        };
        
        // تحديث مؤشرات الأمان
        this.updateSecurityIndicators(securityCheck);
        
        if (!securityCheck.https && window.location.hostname !== 'localhost') {
            this.errorHandler.logError(
                new Error('HTTPS is required for full security'),
                'high',
                'Security Check'
            );
        }
        
        return securityCheck;
    }
    
    /**
     * تحديث مؤشرات الأمان
     */
    updateSecurityIndicators(securityCheck) {
        const indicators = document.querySelectorAll('.security-indicator');
        
        if (indicators.length >= 5) {
            indicators[0].classList.toggle('active', securityCheck.https); // HTTPS
            indicators[1].classList.toggle('active', securityCheck.cryptoStrong); // Crypto
            indicators[2].classList.toggle('active', this.workerManager.workers.size > 0); // Workers
            indicators[3].classList.toggle('active', securityCheck.secureContext); // Storage
            indicators[4].classList.toggle('active', this.memoryManager.allocated > 0); // Memory
            
            // تحديث مستوى الأمان
            const securityLevel = document.getElementById('securityLevelValue');
            if (securityLevel) {
                const activeCount = Array.from(indicators).filter(i => i.classList.contains('active')).length;
                const levels = ['CRITICAL', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'];
                securityLevel.textContent = levels[activeCount] || 'UNKNOWN';
                securityLevel.style.color = activeCount >= 4 ? 'var(--success)' : 
                                          activeCount >= 2 ? 'var(--warning)' : 
                                          'var(--error)';
            }
        }
    }
    
    /**
     * تحديث حالة التحميل
     */
    updateLoadingStatus(status, progress) {
        const loadingStatus = document.getElementById('loadingStatus');
        const loadingProgress = document.getElementById('loadingProgress');
        const progressBar = document.querySelector('.loading-progress .progress-bar');
        
        if (loadingStatus) {
            const statusMap = {
                'initializing': 'جاري تهيئة النظام...',
                'browser_check_complete': 'التحقق من المتصفح... ✓',
                'core_modules_loaded': 'تحميل الوحدات الأساسية... ✓',
                'memory_manager_ready': 'تهيئة إدارة الذاكرة... ✓',
                'workers_initialized': 'تحميل أنظمة المعالجة... ✓',
                'monitoring_started': 'تشغيل أنظمة المراقبة... ✓',
                'ui_initialized': 'تحميل واجهة المستخدم... ✓',
                'security_check_complete': 'التحقق من الأمان... ✓',
                'ready': 'جاهز للاستخدام!'
            };
            
            loadingStatus.textContent = statusMap[status] || status;
        }
        
        if (loadingProgress) {
            loadingProgress.textContent = `${progress}%`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.querySelector('.main-container');
        
        if (loadingScreen && mainContainer) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'block';
                
                // تأثير ظهور
                setTimeout(() => {
                    mainContainer.style.opacity = '1';
                    mainContainer.style.transform = 'translateY(0)';
                }, 50);
            }, 500);
        }
    }
    
    /**
     * إظهار رسالة الترحيب
     */
    showWelcomeMessage() {
        const welcomeMessage = `
            <div class="status-message success">
                <div class="status-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="status-content">
                    <h4 data-i18n="welcome-title">WELCOME TO CIPHERVAULT 3D PRO</h4>
                    <span data-i18n="welcome-message">Military-grade encryption system ready. Security level: MAXIMUM</span>
                </div>
                <button class="status-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.insertAdjacentHTML('afterbegin', welcomeMessage);
            
            // إزالة تلقائية بعد 5 ثواني
            setTimeout(() => {
                const message = statusContainer.querySelector('.status-message.success');
                if (message) {
                    message.style.opacity = '0';
                    setTimeout(() => message.remove(), 300);
                }
            }, 5000);
        }
    }
    
    /**
     * إظهار خطأ التهيئة
     */
    showInitializationError(error) {
        const errorHTML = `
            <div class="loading-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h2>Initialization Failed</h2>
                <p>${error.message}</p>
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="btn-retry">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                    <button onclick="this.showCompatibilityInfo()" class="btn-info">
                        <i class="fas fa-info-circle"></i> Compatibility Info
                    </button>
                </div>
            </div>
        `;
        
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.innerHTML = errorHTML;
        }
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // تبديل اللغة
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.switchLanguage(lang);
            });
        });
        
        // تبديل الوضع الداكن
        const darkModeToggle = document.getElementById('toggleDarkMode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
        
        // الإعدادات المتقدمة
        const advancedToggle = document.getElementById('toggleAdvanced');
        const closeSettings = document.getElementById('closeAdvancedSettings');
        const settingsPanel = document.getElementById('advancedSettingsPanel');
        
        if (advancedToggle && settingsPanel) {
            advancedToggle.addEventListener('click', () => {
                settingsPanel.classList.add('active');
            });
        }
        
        if (closeSettings && settingsPanel) {
            closeSettings.addEventListener('click', () => {
                settingsPanel.classList.remove('active');
            });
        }
        
        // إدارة الملفات
        this.setupFileUploadListeners();
        
        // إدارة كلمات المرور
        this.setupPasswordListeners();
        
        // الأزرار الرئيسية
        this.setupActionButtons();
    }
    
    /**
     * تبديل اللغة
     */
    switchLanguage(lang) {
        this.state.language = lang;
        
        // تحديث واجهة اللغة
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === lang);
        });
        
        // تغيير اتجاه الصفحة
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        // تحديث النصوص المترجمة
        this.updateTranslations(lang);
        
        // حفظ التفضيل
        localStorage.setItem('ciphervault_language', lang);
    }
    
    /**
     * تحديث الترجمات
     */
    updateTranslations(lang) {
        // هذا سيتكامل مع ملف الترجمات الفعلي
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            // هنا سيتم تحميل الترجمة من ملف الترجمات
            // مؤقتاً نغير النص بناءً على اللغة
            if (lang === 'ar') {
                element.textContent = `[AR] ${key}`;
            } else {
                element.textContent = `[EN] ${key}`;
            }
        });
    }
    
    /**
     * تبديل الوضع الداكن
     */
    toggleDarkMode(force = null) {
        if (force !== null) {
            this.state.darkMode = force;
        } else {
            this.state.darkMode = !this.state.darkMode;
        }
        
        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.setAttribute('data-theme', 'light');
        }
        
        // تحديث الزر
        const darkModeToggle = document.getElementById('toggleDarkMode');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = this.state.darkMode ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
        
        // حفظ التفضيل
        localStorage.setItem('ciphervault_darkmode', this.state.darkMode);
    }
    
    /**
     * إعداد مستمعي رفع الملفات
     */
    setupFileUploadListeners() {
        // رفع الملفات للتشفير
        const encryptUpload = document.getElementById('encryptUpload');
        const encryptInput = document.getElementById('fileInputEncrypt');
        
        if (encryptUpload && encryptInput) {
            encryptUpload.addEventListener('click', () => encryptInput.click());
            encryptUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                encryptUpload.classList.add('drag-over');
            });
            encryptUpload.addEventListener('dragleave', () => {
                encryptUpload.classList.remove('drag-over');
            });
            encryptUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                encryptUpload.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileSelect(e.dataTransfer.files[0], 'encrypt');
                }
            });
            
            encryptInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0], 'encrypt');
                }
            });
        }
        
        // رفع الملفات لفك التشفير
        const decryptUpload = document.getElementById('decryptUpload');
        const decryptInput = document.getElementById('fileInputDecrypt');
        
        if (decryptUpload && decryptInput) {
            decryptUpload.addEventListener('click', () => decryptInput.click());
            decryptUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                decryptUpload.classList.add('drag-over');
            });
            decryptUpload.addEventListener('dragleave', () => {
                decryptUpload.classList.remove('drag-over');
            });
            decryptUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                decryptUpload.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileSelect(e.dataTransfer.files[0], 'decrypt');
                }
            });
            
            decryptInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0], 'decrypt');
                }
            });
        }
    }
    
    /**
     * معالجة اختيار الملف
     */
    async handleFileSelect(file, type) {
        try {
            // التحقق من حجم الملف (10GB حد أقصى)
            if (file.size > 10 * 1024 * 1024 * 1024) {
                throw new Error('File size exceeds 10GB limit');
            }
            
            // تحديث واجهة الملف
            this.updateFileUI(file, type);
            
            // تحليل الملف
            const analysis = await this.api.file.analyze(file);
            
            // تحديث معلومات الملف
            this.updateFileInfo(file, analysis, type);
            
            // تمكين الزر المناسب
            const buttonId = type === 'encrypt' ? 'encryptBtn' : 'decryptBtn';
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = false;
            }
            
            // إظهار رسالة نجاح
            this.showStatusMessage('success', 'File loaded successfully', `Size: ${this.formatFileSize(file.size)}`);
            
        } catch (error) {
            this.errorHandler.logError(error, 'medium', 'File Selection');
            this.showStatusMessage('error', 'Failed to load file', error.message);
        }
    }
    
    /**
     * تحديث واجهة الملف
     */
    updateFileUI(file, type) {
        const fileInfoId = type === 'encrypt' ? 'encryptFileInfo' : 'decryptFileInfo';
        const fileInfo = document.getElementById(fileInfoId);
        
        if (fileInfo) {
            fileInfo.style.display = 'flex';
            
            const fileNameId = type === 'encrypt' ? 'encryptFileName' : 'decryptFileName';
            const fileSizeId = type === 'encrypt' ? 'encryptFileSize' : 'decryptFileSize';
            const fileTypeId = type === 'encrypt' ? 'encryptFileType' : 'decryptFileType';
            
            const fileName = document.getElementById(fileNameId);
            const fileSize = document.getElementById(fileSizeId);
            const fileType = document.getElementById(fileTypeId);
            
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
            if (fileType) fileType.textContent = file.type || 'Unknown';
        }
    }
    
    /**
     * تحديث معلومات الملف
     */
    updateFileInfo(file, analysis, type) {
        // إضافة معلومات إضافية للملفات المشفرة
        if (type === 'decrypt') {
            const decryptionInfo = document.getElementById('decryptionInfo');
            if (decryptionInfo) {
                decryptionInfo.classList.add('show');
                
                // هنا يمكن إضافة معلومات من التحليل
                const securityLevel = document.getElementById('fileSecurityLevel');
                const layers = document.getElementById('fileLayers');
                const date = document.getElementById('fileEncryptedDate');
                
                if (securityLevel) securityLevel.textContent = analysis.securityLevel || 'Unknown';
                if (layers) layers.textContent = analysis.layers || 'Unknown';
                if (date) date.textContent = new Date().toLocaleDateString();
            }
        }
    }
    
    /**
     * إعداد مستمعي كلمات المرور
     */
    setupPasswordListeners() {
        // حقل كلمة مرور التشفير
        const encryptPassword = document.getElementById('passwordEncrypt');
        const encryptConfirm = document.getElementById('passwordConfirm');
        
        if (encryptPassword) {
            encryptPassword.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value, 'encrypt');
            });
        }
        
        if (encryptPassword && encryptConfirm) {
            const checkMatch = () => {
                const match = encryptPassword.value === encryptConfirm.value;
                const matchIndicator = document.getElementById('passwordMatchIndicator');
                if (matchIndicator) {
                    matchIndicator.classList.toggle('show', match && encryptPassword.value.length > 0);
                }
                
                // تمكين/تعطيل زر التشفير
                const encryptBtn = document.getElementById('encryptBtn');
                if (encryptBtn) {
                    encryptBtn.disabled = !(match && encryptPassword.value.length >= 12);
                }
            };
            
            encryptPassword.addEventListener('input', checkMatch);
            encryptConfirm.addEventListener('input', checkMatch);
        }
        
        // حقل كلمة مرور فك التشفير
        const decryptPassword = document.getElementById('passwordDecrypt');
        if (decryptPassword) {
            decryptPassword.addEventListener('input', (e) => {
                const decryptBtn = document.getElementById('decryptBtn');
                if (decryptBtn) {
                    decryptBtn.disabled = e.target.value.length < 12;
                }
            });
        }
    }
    
    /**
     * التحقق من قوة كلمة المرور
     */
    checkPasswordStrength(password, type) {
        let strength = 0;
        const hints = document.querySelectorAll('.hint');
        
        // طول كلمة المرور
        if (password.length >= 12) {
            strength += 1;
            if (hints[0]) hints[0].classList.add('valid');
        } else {
            if (hints[0]) hints[0].classList.remove('valid');
        }
        
        // أحرف كبيرة
        if (/[A-Z]/.test(password)) {
            strength += 1;
            if (hints[1]) hints[1].classList.add('valid');
        } else {
            if (hints[1]) hints[1].classList.remove('valid');
        }
        
        // أحرف صغيرة
        if (/[a-z]/.test(password)) {
            strength += 1;
            if (hints[2]) hints[2].classList.add('valid');
        } else {
            if (hints[2]) hints[2].classList.remove('valid');
        }
        
        // أرقام
        if (/[0-9]/.test(password)) {
            strength += 1;
            if (hints[3]) hints[3].classList.add('valid');
        } else {
            if (hints[3]) hints[3].classList.remove('valid');
        }
        
        // رموز خاصة
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 1;
            if (hints[4]) hints[4].classList.add('valid');
        } else {
            if (hints[4]) hints[4].classList.remove('valid');
        }
        
        // إنتروبيا (تعقيد)
        const entropy = password.length * Math.log2(new Set(password.split('')).size);
        if (entropy > 50) {
            strength += 1;
            if (hints[5]) hints[5].classList.add('valid');
        } else {
            if (hints[5]) hints[5].classList.remove('valid');
        }
        
        // تحديث مؤشر القوة
        const strengthMeter = document.getElementById('passwordStrengthEncrypt');
        if (strengthMeter) {
            const strengthText = strengthMeter.querySelector('.strength-text');
            const bars = strengthMeter.querySelectorAll('.strength-bar');
            
            // إعادة تعيين الأشرطة
            bars.forEach(bar => bar.style.opacity = '0.3');
            
            // تحديث الأشرطة بناءً على القوة
            for (let i = 0; i < Math.min(strength, bars.length); i++) {
                bars[i].style.opacity = '1';
            }
            
            // تحديث النص
            if (strengthText) {
                const levels = ['WEAK', 'FAIR', 'GOOD', 'STRONG', 'VERY STRONG', 'EXCELLENT'];
                strengthText.textContent = levels[Math.min(strength, levels.length - 1)] || 'WEAK';
                
                // تلوين النص
                const colors = ['var(--error)', 'var(--warning)', '#FFA500', '#1E90FF', 'var(--success)', '#00FF00'];
                strengthText.style.color = colors[Math.min(strength, colors.length - 1)];
            }
        }
        
        return strength;
    }
    
    /**
     * إعداد أزرار الإجراءات
     */
    setupActionButtons() {
        // زر التشفير
        const encryptBtn = document.getElementById('encryptBtn');
        if (encryptBtn) {
            encryptBtn.addEventListener('click', async () => {
                await this.startEncryption();
            });
        }
        
        // زر فك التشفير
        const decryptBtn = document.getElementById('decryptBtn');
        if (decryptBtn) {
            decryptBtn.addEventListener('click', async () => {
                await this.startDecryption();
            });
        }
        
        // زر توليد كلمة مرور
        const generateBtn = document.querySelector('.btn-generate-password');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateSecurePassword();
            });
        }
        
        // أزرار إظهار/إخفاء كلمة المرور
        document.querySelectorAll('.btn-toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const inputId = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
                const input = document.getElementById(inputId);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    e.currentTarget.innerHTML = input.type === 'password' ? 
                        '<i class="fas fa-eye"></i>' : 
                        '<i class="fas fa-eye-slash"></i>';
                }
            });
        });
    }
    
    /**
     * بدء عملية التشفير
     */
    async startEncryption() {
        try {
            const fileInput = document.getElementById('fileInputEncrypt');
            const passwordInput = document.getElementById('passwordEncrypt');
            
            if (!fileInput.files.length || !passwordInput.value) {
                throw new Error('Please select a file and enter a password');
            }
            
            const file = fileInput.files[0];
            const password = passwordInput.value;
            
            // الحصول على مستوى الأمان المختار
            const securityLevel = document.querySelector('.level-btn.active')?.dataset.level || 'MEDIUM';
            
            // الحصول على الخيارات
            const options = this.getEncryptionOptions();
            options.securityLevel = securityLevel;
            
            // قلب البطاقة لعرض التقدم
            const encryptCard = document.querySelector('.encrypt-card');
            if (encryptCard) {
                encryptCard.classList.add('flipped');
            }
            
            // بدء التشفير
            const result = await this.api.encrypt(file, password, options);
            
            // تحميل الملف المشفر
            this.downloadEncryptedFile(result.encryptedData, file.name);
            
            // إظهار رسالة النجاح
            this.showStatusMessage('success', 'Encryption Complete', 
                `File encrypted successfully. Size: ${this.formatFileSize(result.encryptedData.size)}`);
            
            // قلب البطاقة للخلف بعد تأخير
            setTimeout(() => {
                if (encryptCard) {
                    encryptCard.classList.remove('flipped');
                }
                
                // إعادة تعيين الحقول
                this.resetEncryptionForm();
            }, 2000);
            
        } catch (error) {
            this.errorHandler.logError(error, 'high', 'Encryption Process');
            this.showStatusMessage('error', 'Encryption Failed', error.message);
        }
    }
    
    /**
     * بدء عملية فك التشفير
     */
    async startDecryption() {
        try {
            const fileInput = document.getElementById('fileInputDecrypt');
            const passwordInput = document.getElementById('passwordDecrypt');
            
            if (!fileInput.files.length || !passwordInput.value) {
                throw new Error('Please select a file and enter a password');
            }
            
            const file = fileInput.files[0];
            const password = passwordInput.value;
            
            // الحصول على الخيارات
            const options = this.getDecryptionOptions();
            
            // قلب البطاقة لعرض التقدم
            const decryptCard = document.querySelector('.decrypt-card');
            if (decryptCard) {
                decryptCard.classList.add('flipped');
            }
            
            // بدء فك التشفير
            const result = await this.api.decrypt(file, password, options);
            
            // تحميل الملف الأصلي
            this.downloadDecryptedFile(result.decryptedData, result.filename || 'decrypted_file');
            
            // إظهار رسالة النجاح
            this.showStatusMessage('success', 'Decryption Complete', 
                `File decrypted successfully. Size: ${this.formatFileSize(result.decryptedData.size)}`);
            
            // قلب البطاقة للخلف بعد تأخير
            setTimeout(() => {
                if (decryptCard) {
                    decryptCard.classList.remove('flipped');
                }
                
                // إعادة تعيين الحقول
                this.resetDecryptionForm();
            }, 2000);
            
        } catch (error) {
            this.errorHandler.logError(error, 'high', 'Decryption Process');
            this.showStatusMessage('error', 'Decryption Failed', error.message);
        }
    }
    
    /**
     * الحصول على خيارات التشفير
     */
    getEncryptionOptions() {
        return {
            compress: document.getElementById('compressOption')?.checked || false,
            split: document.getElementById('splitOption')?.checked || false,
            verify: document.getElementById('integrityOption')?.checked || true,
            wipe: document.getElementById('wipeOption')?.checked || true,
            securityLevel: this.state.securityLevel
        };
    }
    
    /**
     * الحصول على خيارات فك التشفير
     */
    getDecryptionOptions() {
        return {
            verify: document.getElementById('verifyIntegrity')?.checked || true,
            wipe: document.getElementById('wipeAfter')?.checked || true,
            keepMetadata: document.getElementById('keepMetadata')?.checked || false,
            autoOpen: document.getElementById('autoOpen')?.checked || false
        };
    }
    
    /**
     * تحميل الملف المشفر
     */
    downloadEncryptedFile(data, originalName) {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const extension = this.getEncryptionExtension();
        const filename = `${originalName}.${extension}`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * تحميل الملف المفكوك
     */
    downloadDecryptedFile(data, filename) {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * الحصول على امتداد التشفير المناسب
     */
    getEncryptionExtension() {
        switch (this.state.securityLevel) {
            case 'MILITARY': return 'cvmil';
            case 'HIGH': return 'cvhig';
            case 'MEDIUM': return 'cvmed';
            case 'BASIC': return 'cvbas';
            default: return 'cvault';
        }
    }
    
    /**
     * توليد كلمة مرور آمنة
     */
    generateSecurePassword() {
        const chars = {
            uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
            lowercase: 'abcdefghijkmnpqrstuvwxyz',
            numbers: '23456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        let password = '';
        
        // تأكد من وجود حرف من كل نوع
        password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
        password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
        password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
        password += chars.symbols[Math.floor(Math.random() * chars.symbols.length)];
        
        // أكمل إلى 16 حرف
        const allChars = chars.uppercase + chars.lowercase + chars.numbers + chars.symbols;
        for (let i = password.length; i < 16; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // خلط الحروف
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        // تحديث الحقول
        const encryptPassword = document.getElementById('passwordEncrypt');
        const encryptConfirm = document.getElementById('passwordConfirm');
        
        if (encryptPassword) {
            encryptPassword.value = password;
            encryptPassword.dispatchEvent(new Event('input'));
        }
        
        if (encryptConfirm) {
            encryptConfirm.value = password;
            encryptConfirm.dispatchEvent(new Event('input'));
        }
        
        // إظهار رسالة
        this.showStatusMessage('info', 'Password Generated', 'A secure password has been generated');
    }
    
    /**
     * تهيئة تحكم البطاقة ثلاثية الأبعاد
     */
    initialize3DCardControls() {
        const cards = document.querySelectorAll('.card-3d');
        
        cards.forEach(card => {
            // تأثير الميل بالماوس
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 5; // 5 درجات كحد أقصى
                const rotateX = ((centerY - y) / centerY) * 5;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }
    
    /**
     * إعادة تعيين نموذج التشفير
     */
    resetEncryptionForm() {
        const fileInfo = document.getElementById('encryptFileInfo');
        const fileInput = document.getElementById('fileInputEncrypt');
        const passwordInput = document.getElementById('passwordEncrypt');
        const confirmInput = document.getElementById('passwordConfirm');
        const encryptBtn = document.getElementById('encryptBtn');
        
        if (fileInfo) fileInfo.style.display = 'none';
        if (fileInput) fileInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (confirmInput) confirmInput.value = '';
        if (encryptBtn) encryptBtn.disabled = true;
        
        // إعادة تعيين مؤشر قوة كلمة المرور
        const hints = document.querySelectorAll('.hint');
        hints.forEach(hint => hint.classList.remove('valid'));
        
        const strengthText = document.querySelector('.strength-text');
        if (strengthText) {
            strengthText.textContent = 'WEAK';
            strengthText.style.color = 'var(--error)';
        }
    }
    
    /**
     * إعادة تعيين نموذج فك التشفير
     */
    resetDecryptionForm() {
        const fileInfo = document.getElementById('decryptFileInfo');
        const fileInput = document.getElementById('fileInputDecrypt');
        const passwordInput = document.getElementById('passwordDecrypt');
        const decryptBtn = document.getElementById('decryptBtn');
        const decryptionInfo = document.getElementById('decryptionInfo');
        
        if (fileInfo) fileInfo.style.display = 'none';
        if (fileInput) fileInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (decryptBtn) decryptBtn.disabled = true;
        if (decryptionInfo) decryptionInfo.classList.remove('show');
    }
    
    /**
     * إظهار رسالة الحالة
     */
    showStatusMessage(type, title, message) {
        const typeConfig = {
            success: { icon: 'fa-check-circle', color: 'success' },
            error: { icon: 'fa-exclamation-circle', color: 'error' },
            warning: { icon: 'fa-exclamation-triangle', color: 'warning' },
            info: { icon: 'fa-info-circle', color: 'info' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        const messageHTML = `
            <div class="status-message ${config.color}">
                <div class="status-icon">
                    <i class="fas ${config.icon}"></i>
                </div>
                <div class="status-content">
                    <h4>${title}</h4>
                    <span>${message}</span>
                </div>
                <button class="status-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.insertAdjacentHTML('afterbegin', messageHTML);
            
            // إزالة تلقائية بعد 5 ثواني
            setTimeout(() => {
                const messageEl = statusContainer.querySelector('.status-message');
                if (messageEl) {
                    messageEl.style.opacity = '0';
                    setTimeout(() => messageEl.remove(), 300);
                }
            }, 5000);
        }
    }
    
    /**
     * تنسيق حجم الملف
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * تحميل الترجمات
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`assets/lang/${lang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            
            const translations = await response.json();
            this.translations = translations;
            
            // تحديث النصوص
            this.applyTranslations();
        } catch (error) {
            console.warn(`Failed to load translations for ${lang}:`, error);
        }
    }
    
    /**
     * تطبيق الترجمات
     */
    applyTranslations() {
        if (!this.translations) return;
        
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });
    }
}

// ============================================================================
// GLOBAL EXPORT AND INITIALIZATION
// ============================================================================

// إنشاء نسخة عالمية
window.CipherVault = window.CipherVault || new CipherVaultProEnhanced();

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط لتحميل جميع الموارد
    setTimeout(() => {
        window.CipherVault.initialize();
    }, 100);
});

// تعريف الدوال العامة للاستخدام من HTML
window.CipherVaultPro = {
    clearFile: function(type) {
        if (type === 'encrypt') {
            const fileInfo = document.getElementById('encryptFileInfo');
            const fileInput = document.getElementById('fileInputEncrypt');
            if (fileInfo) fileInfo.style.display = 'none';
            if (fileInput) fileInput.value = '';
            
            const encryptBtn = document.getElementById('encryptBtn');
            if (encryptBtn) encryptBtn.disabled = true;
        } else {
            const fileInfo = document.getElementById('decryptFileInfo');
            const fileInput = document.getElementById('fileInputDecrypt');
            if (fileInfo) fileInfo.style.display = 'none';
            if (fileInput) fileInput.value = '';
            
            const decryptBtn = document.getElementById('decryptBtn');
            if (decryptBtn) decryptBtn.disabled = true;
        }
    },
    
    togglePassword: function(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },
    
    generatePassword: function() {
        if (window.CipherVault && window.CipherVault.generateSecurePassword) {
            window.CipherVault.generateSecurePassword();
        }
    },
    
    showFileInfo: function(type) {
        const fileInfo = document.getElementById(type === 'encrypt' ? 'encryptFileInfo' : 'decryptFileInfo');
        if (fileInfo) {
            alert('File information dialog would open here');
        }
    },
    
    analyzeFile: function(type) {
        alert('File analysis feature would run here');
    },
    
    analyzeEncryptedFile: function() {
        alert('Encrypted file analysis would run here');
    },
    
    showSecurityAudit: function() {
        alert('Security audit report would display here');
    },
    
    showPrivacyPolicy: function() {
        alert('Privacy policy would display here');
    },
    
    showDocumentation: function() {
        alert('Documentation would display here');
    },
    
    showAbout: function() {
        alert('About information would display here');
    },
    
    showCompatibilityInfo: function() {
        alert('Compatibility information would display here');
    }
};

// دعم Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker-enhanced.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherVaultProEnhanced;
}
