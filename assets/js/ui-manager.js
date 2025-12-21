/**
 * CipherVault 3D Pro - UI Manager
 * Handles all user interface interactions and updates
 * Version: 4.2.0
 */

class UIManager {
    constructor() {
        this.isInitialized = false;
        this.isDarkMode = this.detectDarkMode();
        this.currentLanguage = 'en';
        this.fileCache = new Map();
        this.performanceMonitor = new PerformanceMonitor();
        this.touchEnabled = this.isTouchDevice();
        
        // UI Elements cache
        this.elements = {};
        this.animations = new Map();
    }

    /**
     * Initialize UI Manager
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Setup animations
            this.setupAnimations();
            
            // Initialize language
            await this.initializeLanguage();
            
            // Initialize dark mode
            this.initializeDarkMode();
            
            // Setup security indicators
            this.initializeSecurityIndicators();
            
            // Setup file handlers
            this.initializeFileHandlers();
            
            // Setup password validation
            this.initializePasswordValidation();
            
            this.isInitialized = true;
            console.log('UI Manager initialized');
            
        } catch (error) {
            console.error('Failed to initialize UI Manager:', error);
            throw error;
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            // Security indicators
            securityLevelValue: document.getElementById('securityLevelValue'),
            securityHttps: document.getElementById('securityHttps'),
            securityCrypto: document.getElementById('securityCrypto'),
            securityWorkers: document.getElementById('securityWorkers'),
            securityStorage: document.getElementById('securityStorage'),
            
            // Language selector
            langOptions: document.querySelectorAll('.lang-option'),
            
            // Mode toggles
            toggleDarkMode: document.getElementById('toggleDarkMode'),
            toggleAdvanced: document.getElementById('toggleAdvanced'),
            toggleSecurity: document.getElementById('toggleSecurity'),
            
            // File inputs
            fileInputEncrypt: document.getElementById('fileInputEncrypt'),
            fileInputDecrypt: document.getElementById('fileInputDecrypt'),
            encryptUpload: document.getElementById('encryptUpload'),
            decryptUpload: document.getElementById('decryptUpload'),
            
            // File info displays
            encryptFileInfo: document.getElementById('encryptFileInfo'),
            decryptFileInfo: document.getElementById('decryptFileInfo'),
            
            // Password inputs
            passwordEncrypt: document.getElementById('passwordEncrypt'),
            passwordDecrypt: document.getElementById('passwordDecrypt'),
            passwordConfirm: document.getElementById('passwordConfirm'),
            
            // Password strength indicators
            passwordStrengthEncrypt: document.getElementById('passwordStrengthEncrypt'),
            passwordMatchIndicator: document.getElementById('passwordMatchIndicator'),
            
            // Buttons
            encryptBtn: document.getElementById('encryptBtn'),
            decryptBtn: document.getElementById('decryptBtn'),
            
            // Progress indicators
            encryptProgress: document.getElementById('encryptProgress'),
            decryptProgress: document.getElementById('decryptProgress'),
            
            // Status messages
            statusContainer: document.getElementById('status-container'),
            successStatus: document.getElementById('success-status'),
            errorStatus: document.getElementById('error-status'),
            warningStatus: document.getElementById('warning-status'),
            infoStatus: document.getElementById('info-status'),
            
            // Advanced settings
            advancedSettingsPanel: document.getElementById('advancedSettingsPanel'),
            closeAdvancedSettings: document.getElementById('closeAdvancedSettings'),
            
            // Stats
            filesProcessed: document.getElementById('filesProcessed'),
            dataEncrypted: document.getElementById('dataEncrypted'),
            encryptionSpeed: document.getElementById('encryptionSpeed'),
            securityLevel: document.getElementById('securityLevel'),
            
            // Connection status
            connectionIcon: document.getElementById('connectionIcon'),
            connectionStatus: document.getElementById('connectionStatus'),
            auditStatus: document.getElementById('auditStatus')
        };
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Language selection
        this.elements.langOptions.forEach(option => {
            option.addEventListener('click', (e) => this.handleLanguageChange(e));
        });

        // Dark mode toggle
        this.elements.toggleDarkMode.addEventListener('click', () => this.toggleDarkMode());

        // Advanced settings
        this.elements.toggleAdvanced.addEventListener('click', () => this.toggleAdvancedSettings());
        this.elements.closeAdvancedSettings.addEventListener('click', () => this.hideAdvancedSettings());

        // Security audit toggle
        this.elements.toggleSecurity.addEventListener('click', () => this.showSecurityAudit());

        // File uploads
        this.elements.encryptUpload.addEventListener('click', () => this.elements.fileInputEncrypt.click());
        this.elements.decryptUpload.addEventListener('click', () => this.elements.fileInputDecrypt.click());
        
        this.elements.fileInputEncrypt.addEventListener('change', (e) => this.handleFileSelect(e, 'encrypt'));
        this.elements.fileInputDecrypt.addEventListener('change', (e) => this.handleFileSelect(e, 'decrypt'));

        // Drag and drop
        this.setupDragAndDrop(this.elements.encryptUpload, 'encrypt');
        this.setupDragAndDrop(this.elements.decryptUpload, 'decrypt');

        // Password validation
        this.elements.passwordEncrypt.addEventListener('input', () => this.validatePassword('encrypt'));
        this.elements.passwordDecrypt.addEventListener('input', () => this.validatePassword('decrypt'));
        this.elements.passwordConfirm.addEventListener('input', () => this.validatePasswordConfirm());

        // Encryption/Decryption buttons
        this.elements.encryptBtn.addEventListener('click', () => this.handleEncrypt());
        this.elements.decryptBtn.addEventListener('click', () => this.handleDecrypt());

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        
        // Custom events
        window.addEventListener('fileprogress', (e) => this.updateProgressDisplay(e.detail));
        window.addEventListener('busystate', (e) => this.setBusyState(e.detail.busy, e.detail.operation));
        
        // Touch-specific events
        if (this.touchEnabled) {
            this.initializeTouchEvents();
        }
    }

    /**
     * Setup drag and drop for file uploads
     */
    setupDragAndDrop(element, type) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileDrop(files[0], type);
            }
        });
    }

    /**
     * Initialize touch-specific events
     */
    initializeTouchEvents() {
        // Add touch feedback for buttons
        const buttons = document.querySelectorAll('.btn-3d, .btn-icon, .control-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-active');
            }, { passive: true });

            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
            }, { passive: true });

            // Prevent long-press context menu on buttons
            button.addEventListener('contextmenu', (e) => e.preventDefault());
        });

        // Improve touch scrolling
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.card-3d, .advanced-settings-panel')) {
                e.stopPropagation();
            }
        }, { passive: true });
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        await this.displayFileInfo(file, type);
    }

    /**
     * Handle file drop
     */
    async handleFileDrop(file, type) {
        if (!file) return;

        await this.displayFileInfo(file, type);
        
        // Update file input
        const input = type === 'encrypt' ? this.elements.fileInputEncrypt : this.elements.fileInputDecrypt;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    }

    /**
     * Display file information
     */
    async displayFileInfo(file, type) {
        const fileInfoElement = type === 'encrypt' ? this.elements.encryptFileInfo : this.elements.decryptFileInfo;
        const fileNameElement = document.getElementById(`${type}FileName`);
        const fileSizeElement = document.getElementById(`${type}FileSize`);
        
        // Validate file
        if (!this.validateFile(file, type)) {
            this.showNotification('Invalid file selected', 'error');
            return;
        }

        // Calculate file size
        const fileSize = this.formatFileSize(file.size);
        
        // Update UI
        fileNameElement.textContent = file.name;
        fileSizeElement.textContent = fileSize;
        
        // Show file info panel with animation
        fileInfoElement.style.display = 'flex';
        this.animateElement(fileInfoElement, 'slideDown');
        
        // Cache file for later use
        this.fileCache.set(type, file);
        
        // Validate encrypted files
        if (type === 'decrypt') {
            await this.validateEncryptedFile(file);
        }
    }

    /**
     * Validate file based on type
     */
    validateFile(file, type) {
        if (!file) return false;
        
        if (type === 'decrypt') {
            // Check if file is encrypted
            const validExtensions = ['.cvault', '.cvenc', '.cvmil'];
            const fileName = file.name.toLowerCase();
            return validExtensions.some(ext => fileName.endsWith(ext));
        }
        
        return true; // Accept any file for encryption
    }

    /**
     * Validate encrypted file format
     */
    async validateEncryptedFile(file) {
        try {
            const buffer = await file.slice(0, 100).arrayBuffer(); // Read first 100 bytes
            const header = new Uint8Array(buffer);
            
            // Check signature (first 4 bytes should be 'CV3D')
            const signature = String.fromCharCode(...header.slice(0, 4));
            if (signature !== 'CV3D') {
                this.showNotification('Invalid encrypted file format', 'warning');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('File validation failed:', error);
            return false;
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Handle encryption
     */
    async handleEncrypt() {
        try {
            const file = this.fileCache.get('encrypt');
            const password = this.elements.passwordEncrypt.value;
            const confirmPassword = this.elements.passwordConfirm.value;
            
            // Validate inputs
            if (!this.validateEncryptionInputs(file, password, confirmPassword)) {
                return;
            }
            
            // Flip card to show progress
            this.flipCard('encrypt');
            
            // Disable UI
            this.setBusyState(true, 'encrypt');
            
            // Get options
            const options = this.getEncryptionOptions();
            
            // Start encryption
            const result = await window.FileProcessor.processFile(
                file,
                password,
                'encrypt',
                options
            );
            
            // Show success
            this.showNotification(`File encrypted successfully! Saved as ${result.metadata.originalName}.cvault`, 'success');
            
            // Update stats
            this.updateStats(result.metadata);
            
        } catch (error) {
            console.error('Encryption failed:', error);
            this.showNotification(`Encryption failed: ${error.message}`, 'error');
        } finally {
            // Re-enable UI
            this.setBusyState(false);
            
            // Flip card back after delay
            setTimeout(() => this.flipCard('encrypt'), 2000);
        }
    }

    /**
     * Handle decryption
     */
    async handleDecrypt() {
        try {
            const file = this.fileCache.get('decrypt');
            const password = this.elements.passwordDecrypt.value;
            
            // Validate inputs
            if (!this.validateDecryptionInputs(file, password)) {
                return;
            }
            
            // Flip card to show progress
            this.flipCard('decrypt');
            
            // Disable UI
            this.setBusyState(true, 'decrypt');
            
            // Start decryption
            const result = await window.FileProcessor.processFile(
                file,
                password,
                'decrypt'
            );
            
            // Show success
            this.showNotification(`File decrypted successfully!`, 'success');
            
            // Update stats
            this.updateStats(result.metadata);
            
        } catch (error) {
            console.error('Decryption failed:', error);
            this.showNotification(`Decryption failed: ${error.message}`, 'error');
        } finally {
            // Re-enable UI
            this.setBusyState(false);
            
            // Flip card back after delay
            setTimeout(() => this.flipCard('decrypt'), 2000);
        }
    }

    /**
     * Validate encryption inputs
     */
    validateEncryptionInputs(file, password, confirmPassword) {
        if (!file) {
            this.showNotification('Please select a file to encrypt', 'warning');
            return false;
        }
        
        if (!password || password.length < 12) {
            this.showNotification('Password must be at least 12 characters', 'warning');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'warning');
            return false;
        }
        
        const strength = this.calculatePasswordStrength(password);
        if (strength < 3) {
            this.showNotification('Please use a stronger password', 'warning');
            return false;
        }
        
        return true;
    }

    /**
     * Validate decryption inputs
     */
    validateDecryptionInputs(file, password) {
        if (!file) {
            this.showNotification('Please select a file to decrypt', 'warning');
            return false;
        }
        
        if (!password || password.length < 1) {
            this.showNotification('Please enter the encryption password', 'warning');
            return false;
        }
        
        return true;
    }

    /**
     * Get encryption options from UI
     */
    getEncryptionOptions() {
        const securityLevel = document.querySelector('input[name="securityLevel"]:checked')?.value || 'MEDIUM';
        const compress = document.getElementById('compressOption')?.checked ?? true;
        const useWorkers = document.getElementById('useWorkers')?.checked ?? true;
        
        return {
            securityLevel,
            compress,
            useWorkers,
            chunkSize: this.calculateOptimalChunkSize()
        };
    }

    /**
     * Calculate optimal chunk size
     */
    calculateOptimalChunkSize() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        return isMobile ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
    }

    /**
     * Flip 3D card
     */
    flipCard(type) {
        const card = document.querySelector(`.${type}-card`);
        card.classList.toggle('flipped');
    }

    /**
     * Update progress display
     */
    updateProgressDisplay(detail) {
        const { percent, status, operation } = detail;
        
        const progressElement = document.getElementById(`${operation}ProgressPercent`);
        const statusElement = document.getElementById(`${operation}ProgressStatus`);
        
        if (progressElement) {
            progressElement.textContent = Math.round(percent);
            
            // Update progress bar
            const progressBar = document.querySelector(`#${operation}Progress .progress-bar`);
            if (progressBar) {
                const circumference = 2 * Math.PI * 64;
                const offset = circumference - (percent / 100) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
        }
        
        if (statusElement) {
            statusElement.textContent = status.toUpperCase();
        }
    }

    /**
     * Set busy state for UI
     */
    setBusyState(busy, operation = null) {
        // Disable/enable buttons
        const buttons = document.querySelectorAll('.btn-3d, .btn-icon, .control-btn');
        buttons.forEach(button => {
            button.disabled = busy;
        });
        
        // Show/hide loading indicators
        if (busy && operation) {
            this.showLoading(operation);
        } else {
            this.hideLoading();
        }
    }

    /**
     * Show loading indicator
     */
    showLoading(operation) {
        const card = document.querySelector(`.${operation}-card`);
        if (card) {
            card.classList.add('loading');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        document.querySelectorAll('.card-3d.loading').forEach(card => {
            card.classList.remove('loading');
        });
    }

    /**
     * Update statistics display
     */
    updateStats(metadata) {
        // Update files processed
        const filesProcessed = parseInt(this.elements.filesProcessed.textContent) || 0;
        this.elements.filesProcessed.textContent = filesProcessed + 1;
        
        // Update data encrypted
        const currentData = this.parseDataSize(this.elements.dataEncrypted.textContent);
        const newData = currentData + (metadata.originalSize / (1024 * 1024));
        this.elements.dataEncrypted.textContent = `${newData.toFixed(2)} MB`;
        
        // Update encryption speed
        if (metadata.speed) {
            const speedMBps = (metadata.speed / (1024 * 1024)).toFixed(2);
            this.elements.encryptionSpeed.textContent = `${speedMBps} MB/s`;
        }
    }

    /**
     * Parse data size string to MB
     */
    parseDataSize(sizeString) {
        const match = sizeString.match(/(\d+\.?\d*)\s*(\w+)/);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        switch (unit) {
            case 'KB': return value / 1024;
            case 'MB': return value;
            case 'GB': return value * 1024;
            case 'TB': return value * 1024 * 1024;
            default: return value;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const statusElement = this.elements[`${type}Status`];
        const textElement = statusElement.querySelector('span');
        
        if (!statusElement || !textElement) return;
        
        // Set message
        textElement.textContent = message;
        
        // Show with animation
        statusElement.style.display = 'flex';
        this.animateElement(statusElement, 'slideUp');
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(type);
            }, duration);
        }
    }

    /**
     * Hide notification
     */
    hideNotification(type) {
        const statusElement = this.elements[`${type}Status`];
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', this.isDarkMode);
        
        // Update button icon
        const icon = this.elements.toggleDarkMode.querySelector('i');
        icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showNotification(
            this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled',
            'info',
            2000
        );
    }

    /**
     * Detect dark mode preference
     */
    detectDarkMode() {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return saved === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Initialize dark mode
     */
    initializeDarkMode() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        
        // Update button icon
        const icon = this.elements.toggleDarkMode?.querySelector('i');
        if (icon) {
            icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    /**
     * Toggle advanced settings
     */
    toggleAdvancedSettings() {
        const panel = this.elements.advancedSettingsPanel;
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            this.animateElement(panel, 'fadeIn');
        }
    }

    /**
     * Hide advanced settings
     */
    hideAdvancedSettings() {
        this.elements.advancedSettingsPanel.classList.remove('active');
    }

    /**
     * Show security audit
     */
    showSecurityAudit() {
        // Implement security audit display
        this.showNotification('Security audit feature coming soon', 'info');
    }

    /**
     * Handle language change
     */
    async handleLanguageChange(event) {
        const target = event.currentTarget;
        const lang = target.dataset.lang;
        
        // Update active state
        this.elements.langOptions.forEach(option => {
            option.classList.remove('active');
        });
        target.classList.add('active');
        
        // Change language
        await this.changeLanguage(lang);
    }

    /**
     * Change application language
     */
    async changeLanguage(lang) {
        this.currentLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // Update all translatable elements
        this.updateTranslations(lang);
        
        // Save preference
        localStorage.setItem('language', lang);
        
        this.showNotification(
            lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
            'info',
            2000
        );
    }

    /**
     * Update all translations
     */
    updateTranslations(lang) {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key, lang);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text' || element.type === 'password') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    /**
     * Get translation for key
     */
    getTranslation(key, lang) {
        // This should be replaced with actual translation files
        const translations = {
            'en': {
                'app-title': 'CIPHERVAULT 3D PRO',
                'tagline': 'Military-Grade Encryption · Zero Trust Architecture',
                'encrypt-title': 'ENCRYPT FILE',
                'decrypt-title': 'DECRYPT FILE',
                'choose-file': 'Drag & Drop or Click to Select File',
                'supported-files': 'Supports ALL file types up to 5GB',
                'password-label': 'PASSWORD (12+ CHARACTERS)',
                'confirm-password': 'CONFIRM PASSWORD',
                'encrypt-btn': 'ENCRYPT NOW',
                'decrypt-btn': 'DECRYPT NOW',
                'processing': 'PROCESSING...'
            },
            'ar': {
                'app-title': 'سيفر فولت ثلاثي الأبعاد برو',
                'tagline': 'تشفير عسكري المستوى · هندسة عدم الثقة',
                'encrypt-title': 'تشفير الملف',
                'decrypt-title': 'فك تشفير الملف',
                'choose-file': 'اسحب وأفلت أو انقر لاختيار ملف',
                'supported-files': 'يدعم جميع أنواع الملفات حتى 5 جيجابايت',
                'password-label': 'كلمة المرور (12+ حرفاً)',
                'confirm-password': 'تأكيد كلمة المرور',
                'encrypt-btn': 'تشفير الآن',
                'decrypt-btn': 'فك التشفير الآن',
                'processing': 'جاري المعالجة...'
            }
        };

        return translations[lang]?.[key] || key;
    }

    /**
     * Initialize language
     */
    async initializeLanguage() {
        const savedLang = localStorage.getItem('language') || 
                         (navigator.language.startsWith('ar') ? 'ar' : 'en');
        
        await this.changeLanguage(savedLang);
    }

    /**
     * Initialize security indicators
     */
    initializeSecurityIndicators() {
        // Check HTTPS
        const isSecure = window.location.protocol === 'https:';
        this.updateSecurityIndicator('securityHttps', isSecure);
        
        // Check Crypto API
        const hasCrypto = typeof crypto !== 'undefined' && 
                         typeof crypto.subtle !== 'undefined';
        this.updateSecurityIndicator('securityCrypto', hasCrypto);
        
        // Check Web Workers
        const hasWorkers = typeof Worker !== 'undefined';
        this.updateSecurityIndicator('securityWorkers', hasWorkers);
        
        // Check Storage
        const hasStorage = typeof localStorage !== 'undefined';
        this.updateSecurityIndicator('securityStorage', hasStorage);
        
        // Update security level
        const secureCount = [isSecure, hasCrypto, hasWorkers, hasStorage]
            .filter(Boolean).length;
        
        const levels = ['LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'];
        this.elements.securityLevelValue.textContent = levels[secureCount] || 'UNKNOWN';
    }

    /**
     * Update security indicator
     */
    updateSecurityIndicator(elementId, isActive) {
        const element = this.elements[elementId];
        if (element) {
            element.classList.toggle('active', isActive);
            element.classList.toggle('medium', !isActive);
        }
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(isOnline) {
        this.elements.connectionIcon.className = isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash';
        this.elements.connectionStatus.textContent = isOnline ? 'Online' : 'Offline';
        
        if (!isOnline) {
            this.showNotification('You are offline. Some features may not work.', 'warning');
        }
    }

    /**
     * Validate password strength
     */
    validatePassword(type) {
        const password = type === 'encrypt' ? 
            this.elements.passwordEncrypt.value : 
            this.elements.passwordDecrypt.value;
        
        const strength = this.calculatePasswordStrength(password);
        this.updatePasswordStrengthDisplay(type, strength);
        
        return strength;
    }

    /**
     * Calculate password strength
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score += 1; // Uppercase
        if (/[a-z]/.test(password)) score += 1; // Lowercase
        if (/[0-9]/.test(password)) score += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special chars
        
        // Return score 0-6, normalize to 0-3 for display
        return Math.min(Math.floor(score / 2), 3);
    }

    /**
     * Update password strength display
     */
    updatePasswordStrengthDisplay(type, strength) {
        if (type !== 'encrypt') return;
        
        const strengthText = this.elements.passwordStrengthEncrypt.querySelector('.strength-text');
        const bars = this.elements.passwordStrengthEncrypt.querySelectorAll('.strength-bar');
        
        // Reset all bars
        bars.forEach(bar => {
            bar.style.width = '0';
        });
        
        // Update based on strength
        const strengthLabels = ['WEAK', 'FAIR', 'GOOD', 'STRONG'];
        strengthText.textContent = strengthLabels[strength] || 'WEAK';
        
        // Activate appropriate number of bars
        for (let i = 0; i <= strength; i++) {
            if (bars[i]) {
                bars[i].style.width = '60px';
                bars[i].className = 'strength-bar ' + 
                    (strength === 0 ? 'weak' : 
                     strength === 1 ? 'medium' : 
                     strength === 2 ? 'strong' : 'very-strong');
            }
        }
    }

    /**
     * Validate password confirmation
     */
    validatePasswordConfirm() {
        const password = this.elements.passwordEncrypt.value;
        const confirm = this.elements.passwordConfirm.value;
        
        if (!password || !confirm) {
            this.elements.passwordMatchIndicator.classList.remove('show');
            return false;
        }
        
        const matches = password === confirm;
        this.elements.passwordMatchIndicator.classList.toggle('show', matches);
        
        return matches;
    }

    /**
     * Initialize file handlers
     */
    initializeFileHandlers() {
        // Clear file buttons
        document.querySelectorAll('.btn-icon[onclick*="clearFile"]').forEach(button => {
            const type = button.getAttribute('onclick').includes('encrypt') ? 'encrypt' : 'decrypt';
            button.addEventListener('click', () => this.clearFile(type));
        });
        
        // File info buttons
        document.querySelectorAll('.btn-icon[onclick*="showFileInfo"]').forEach(button => {
            const type = button.getAttribute('onclick').includes('encrypt') ? 'encrypt' : 'decrypt';
            button.addEventListener('click', () => this.showFileDetails(type));
        });
        
        // Password toggle buttons
        document.querySelectorAll('.btn-toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const inputId = e.target.closest('button').getAttribute('onclick')
                    .match(/togglePassword\('([^']+)'\)/)[1];
                this.togglePasswordVisibility(inputId);
            });
        });
    }

    /**
     * Initialize password validation
     */
    initializePasswordValidation() {
        // Real-time validation
        this.elements.passwordEncrypt.addEventListener('input', () => {
            this.validatePassword('encrypt');
            this.validatePasswordConfirm();
        });
        
        this.elements.passwordConfirm.addEventListener('input', () => {
            this.validatePasswordConfirm();
        });
    }

    /**
     * Clear selected file
     */
    clearFile(type) {
        const fileInfoElement = type === 'encrypt' ? 
            this.elements.encryptFileInfo : this.elements.decryptFileInfo;
        const fileInput = type === 'encrypt' ? 
            this.elements.fileInputEncrypt : this.elements.fileInputDecrypt;
        
        // Hide file info
        fileInfoElement.style.display = 'none';
        
        // Reset file input
        fileInput.value = '';
        
        // Remove from cache
        this.fileCache.delete(type);
        
        // Clear password if encrypting
        if (type === 'encrypt') {
            this.elements.passwordEncrypt.value = '';
            this.elements.passwordConfirm.value = '';
            this.elements.passwordMatchIndicator.classList.remove('show');
        } else {
            this.elements.passwordDecrypt.value = '';
        }
        
        this.showNotification('File cleared', 'info', 2000);
    }

    /**
     * Show file details
     */
    showFileDetails(type) {
        const file = this.fileCache.get(type);
        if (!file) return;
        
        const details = `
            Name: ${file.name}
            Size: ${this.formatFileSize(file.size)}
            Type: ${file.type || 'Unknown'}
            Modified: ${new Date(file.lastModified).toLocaleString()}
        `;
        
        this.showNotification(details, 'info', 5000);
    }

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = input.parentElement.querySelector('.btn-toggle-password');
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            button.setAttribute('data-tooltip', 'Hide Password');
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="fas fa-eye"></i>';
            button.setAttribute('data-tooltip', 'Show Password');
        }
    }

    /**
     * Setup animations
     */
    setupAnimations() {
        // Add CSS animations if not already present
        if (!document.getElementById('ui-animations')) {
            const style = document.createElement('style');
            style.id = 'ui-animations';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .touch-active {
                    animation: pulse 0.3s ease;
                }
                
                .drag-over {
                    border-color: var(--accent) !important;
                    background: rgba(0, 255, 136, 0.1) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Animate element
     */
    animateElement(element, animationName) {
        element.style.animation = `${animationName} 0.3s ease`;
        
        // Remove animation after it completes
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust UI for different screen sizes
        const isMobile = window.innerWidth <= 768;
        
        // Update touch detection
        this.touchEnabled = isMobile || this.isTouchDevice();
        
        // Adjust animations for performance
        if (isMobile) {
            // Disable heavy animations on mobile
            document.querySelectorAll('.floating-icon').forEach(icon => {
                icon.style.animation = 'none';
            });
        }
    }

    /**
     * Check if device is touch-enabled
     */
    isTouchDevice() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }

    /**
     * Performance monitoring class
     */
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                renderTime: 0,
                memoryUsage: 0,
                interactionDelay: 0
            };
            
            this.startTime = performance.now();
        }
        
        recordRenderTime() {
            this.metrics.renderTime = performance.now() - this.startTime;
        }
        
        getMemoryUsage() {
            if (performance.memory) {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            }
            return this.metrics.memoryUsage;
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Clear all timeouts and intervals
        this.animations.forEach((id) => {
            clearTimeout(id);
        });
        this.animations.clear();
        
        // Clear file cache
        this.fileCache.clear();
        
        // Remove event listeners
        // Note: In production, you should properly remove event listeners
    }
}

// Create global instance
const UIManagerInstance = new UIManager();

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        try {
            await UIManagerInstance.initialize();
            console.log('UI Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize UI Manager:', error);
        }
    });

    // Export for global use
    window.UIManager = UIManagerInstance;
    
    // Export convenience functions for global use
    window.showNotification = (message, type, duration) => {
        UIManagerInstance.showNotification(message, type, duration);
    };
    
    window.clearFile = (type) => {
        UIManagerInstance.clearFile(type);
    };
    
    window.togglePassword = (inputId) => {
        UIManagerInstance.togglePasswordVisibility(inputId);
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManagerInstance;
}
