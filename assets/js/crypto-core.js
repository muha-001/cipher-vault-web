/**
 * CipherVault 3D Pro - Core Cryptography Engine
 * Military Grade Encryption System
 * Version: 4.1.0
 */

class CryptoCore {
    constructor() {
        this.signature = new TextEncoder().encode('CV3D');
        this.version = 4;
        this.algorithm = 'AES-GCM';
        this.keySize = 256;
        this.ivSize = 12;
        this.tagLength = 128;
        
        // Security configuration
        this.iterations = {
            BASIC: 100000,
            MEDIUM: 310000,
            HIGH: 600000,
            MILITARY: 1000000
        };
        
        // Salt sizes per security level
        this.saltSizes = {
            BASIC: 16,
            MEDIUM: 24,
            HIGH: 32,
            MILITARY: 48
        };
        
        // Memory protection
        this.memoryWipePasses = 3;
        this.secureWipeEnabled = true;
        
        // Progress tracking
        this.progressCallbacks = new Map();
        
        // Performance monitoring
        this.performance = {
            encryptTimes: [],
            decryptTimes: [],
            keyDerivationTimes: []
        };
        
        // Device capability detection
        this.deviceCapabilities = this.detectDeviceCapabilities();
    }
    
    // ============================================================================
    // KEY MANAGEMENT & DERIVATION
    // ============================================================================
    
    /**
     * Derive encryption key from password using PBKDF2
     */
    async deriveKey(password, salt, iterations = 310000, keyLength = 256) {
        const startTime = performance.now();
        
        try {
            // Convert password to ArrayBuffer
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            // Import password as raw key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            // Derive key using PBKDF2
            const derivedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                {
                    name: this.algorithm,
                    length: keyLength
                },
                false, // Not extractable
                ['encrypt', 'decrypt']
            );
            
            // Secure wipe of sensitive data
            if (this.secureWipeEnabled) {
                this.secureWipeArray(passwordBuffer);
            }
            
            // Track performance
            const duration = performance.now() - startTime;
            this.performance.keyDerivationTimes.push(duration);
            this.trimPerformanceArray(this.performance.keyDerivationTimes);
            
            return derivedKey;
            
        } catch (error) {
            console.error('Key derivation failed:', error);
            throw new Error(`KEY_DERIVATION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Derive HMAC key for integrity verification
     */
    async deriveHMACKey(password, salt, iterations = 100000) {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            const hmacKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                {
                    name: 'HMAC',
                    hash: 'SHA-256',
                    length: 256
                },
                false,
                ['sign', 'verify']
            );
            
            if (this.secureWipeEnabled) {
                this.secureWipeArray(passwordBuffer);
            }
            
            return hmacKey;
            
        } catch (error) {
            console.error('HMAC key derivation failed:', error);
            throw new Error(`HMAC_KEY_DERIVATION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Generate random cryptographic values
     */
    generateRandomBytes(size) {
        return crypto.getRandomValues(new Uint8Array(size));
    }
    
    /**
     * Generate unique file ID
     */
    generateFileId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.getRandomValues(new Uint8Array(12));
        const randomStr = Array.from(random)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        return `file_${timestamp}_${randomStr}`;
    }
    
    // ============================================================================
    // ENCRYPTION METHODS
    // ============================================================================
    
    /**
     * Encrypt data with AES-GCM
     */
    async encryptData(plaintext, key, iv, additionalData = null) {
        const startTime = performance.now();
        
        try {
            const algorithm = {
                name: this.algorithm,
                iv,
                tagLength: this.tagLength
            };
            
            // Add additional authenticated data if provided
            if (additionalData) {
                algorithm.additionalData = additionalData;
            }
            
            const ciphertext = await crypto.subtle.encrypt(
                algorithm,
                key,
                plaintext
            );
            
            const duration = performance.now() - startTime;
            this.performance.encryptTimes.push(duration);
            this.trimPerformanceArray(this.performance.encryptTimes);
            
            return new Uint8Array(ciphertext);
            
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error(`ENCRYPTION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Encrypt file with metadata (optimized for mobile)
     */
    async encryptFile(file, password, options = {}) {
        const startTime = performance.now();
        
        try {
            // Parse options
            const securityLevel = options.securityLevel || 'MEDIUM';
            const compress = options.compress !== false;
            const iterations = this.iterations[securityLevel] || this.iterations.MEDIUM;
            const saltSize = this.saltSizes[securityLevel] || this.saltSizes.MEDIUM;
            
            // Adjust for mobile devices
            const maxMemory = this.deviceCapabilities.maxMemory;
            const chunkSize = Math.min(options.chunkSize || (10 * 1024 * 1024), maxMemory);
            
            // Generate cryptographic parameters
            const salt = this.generateRandomBytes(saltSize);
            const iv = this.generateRandomBytes(this.ivSize);
            const fileId = this.generateFileId();
            
            this.updateProgress('encrypt', 10);
            
            // Derive keys
            const [encryptionKey, hmacKey] = await Promise.all([
                this.deriveKey(password, salt, iterations, this.keySize),
                this.deriveHMACKey(password, salt, Math.floor(iterations / 3))
            ]);
            
            this.updateProgress('encrypt', 30);
            
            // Process file in chunks if large
            let encryptedData;
            if (file.size > chunkSize) {
                encryptedData = await this.encryptFileChunked(file, encryptionKey, hmacKey, salt, iv, compress, chunkSize);
            } else {
                // Read file data
                const arrayBuffer = await file.arrayBuffer();
                let dataToEncrypt = new Uint8Array(arrayBuffer);
                
                // Compress if enabled
                if (compress && dataToEncrypt.length > 1024) {
                    try {
                        const compressed = pako.deflate(dataToEncrypt);
                        dataToEncrypt = new Uint8Array(compressed);
                    } catch (error) {
                        console.warn('Compression failed:', error);
                    }
                }
                
                this.updateProgress('encrypt', 40);
                
                // Encrypt data
                const ciphertext = await this.encryptData(
                    dataToEncrypt,
                    encryptionKey,
                    iv,
                    salt
                );
                
                this.updateProgress('encrypt', 60);
                
                // Calculate HMAC for integrity
                const hmac = await crypto.subtle.sign(
                    'HMAC',
                    hmacKey,
                    ciphertext
                );
                
                // Prepare metadata
                const metadata = {
                    originalName: file.name,
                    originalSize: file.size,
                    mimeType: file.type,
                    timestamp: Date.now(),
                    securityLevel,
                    iterations,
                    saltSize,
                    compressed: compress && dataToEncrypt.length < file.size,
                    fileId,
                    chunked: false
                };
                
                // Create file header
                encryptedData = this.createFilePackage(
                    salt,
                    iv,
                    new Uint8Array(hmac).slice(0, 32),
                    metadata,
                    ciphertext
                );
                
                // Secure wipe
                if (this.secureWipeEnabled) {
                    this.secureWipeArray(dataToEncrypt);
                    this.secureWipeArray(new Uint8Array(arrayBuffer));
                }
            }
            
            this.updateProgress('encrypt', 90);
            
            // Calculate performance metrics
            const duration = performance.now() - startTime;
            const speed = file.size / (duration / 1000); // bytes per second
            
            this.updateProgress('encrypt', 100);
            
            return {
                data: encryptedData,
                metadata: {
                    originalName: file.name,
                    originalSize: file.size,
                    encryptionTime: duration,
                    encryptedSize: encryptedData.length,
                    speed
                },
                fileId
            };
            
        } catch (error) {
            console.error('File encryption failed:', error);
            throw error;
        }
    }
    
    /**
     * Encrypt file in chunks for large files
     */
    async encryptFileChunked(file, encryptionKey, hmacKey, salt, iv, compress, chunkSize) {
        const totalChunks = Math.ceil(file.size / chunkSize);
        const encryptedChunks = [];
        let totalEncryptedSize = 0;
        
        // Metadata
        const metadata = {
            originalName: file.name,
            originalSize: file.size,
            mimeType: file.type,
            timestamp: Date.now(),
            securityLevel: 'MEDIUM',
            iterations: this.iterations.MEDIUM,
            saltSize: salt.length,
            compressed: compress,
            fileId: this.generateFileId(),
            chunked: true,
            totalChunks,
            chunkSize
        };
        
        // Process each chunk
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            const arrayBuffer = await chunk.arrayBuffer();
            let chunkData = new Uint8Array(arrayBuffer);
            
            // Compress if enabled
            if (compress && chunkData.length > 1024) {
                try {
                    const compressed = pako.deflate(chunkData);
                    chunkData = new Uint8Array(compressed);
                } catch (error) {
                    console.warn('Chunk compression failed:', error);
                }
            }
            
            // Generate unique IV for each chunk
            const chunkIV = this.incrementIV(iv, i);
            
            // Encrypt chunk
            const encryptedChunk = await this.encryptData(
                chunkData,
                encryptionKey,
                chunkIV,
                salt
            );
            
            // Add chunk header
            const chunkHeader = new Uint8Array(12);
            const view = new DataView(chunkHeader.buffer);
            view.setUint32(0, i, false); // Chunk index
            view.setUint32(4, chunkData.length, false); // Original size
            view.setUint32(8, encryptedChunk.length, false); // Encrypted size
            
            encryptedChunks.push(chunkHeader);
            encryptedChunks.push(encryptedChunk);
            totalEncryptedSize += chunkHeader.length + encryptedChunk.length;
            
            // Update progress
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            this.updateProgress('encrypt', Math.min(90, 30 + progress * 0.6));
            
            // Secure wipe
            if (this.secureWipeEnabled) {
                this.secureWipeArray(chunkData);
                this.secureWipeArray(new Uint8Array(arrayBuffer));
            }
        }
        
        // Calculate HMAC over all encrypted data
        const allEncryptedData = this.concatUint8Arrays(encryptedChunks);
        const finalHMAC = await crypto.subtle.sign(
            'HMAC',
            hmacKey,
            allEncryptedData
        );
        
        // Create final package
        const finalHMACBytes = new Uint8Array(finalHMAC).slice(0, 32);
        return this.createFilePackage(
            salt,
            iv,
            finalHMACBytes,
            metadata,
            allEncryptedData
        );
    }
    
    /**
     * Create encrypted file package
     */
    createFilePackage(salt, iv, hmac, metadata, ciphertext) {
        // Package structure:
        // 1. Signature (4 bytes)
        // 2. Version (1 byte)
        // 3. Metadata length (4 bytes)
        // 4. Metadata (JSON)
        // 5. Salt (1 byte length + data)
        // 6. IV (12 bytes)
        // 7. HMAC (32 bytes)
        // 8. Data length (8 bytes)
        // 9. Encrypted data
        
        const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
        const metadataLength = metadataBytes.length;
        
        const packageSize = 4 + 1 + 4 + metadataLength + 1 + salt.length + 
                            iv.length + hmac.length + 8 + ciphertext.length;
        
        const package = new Uint8Array(packageSize);
        const view = new DataView(package.buffer);
        let offset = 0;
        
        // Signature
        package.set(this.signature, offset);
        offset += 4;
        
        // Version
        package[offset++] = this.version;
        
        // Metadata length
        view.setUint32(offset, metadataLength, false);
        offset += 4;
        
        // Metadata
        package.set(metadataBytes, offset);
        offset += metadataLength;
        
        // Salt
        package[offset++] = salt.length;
        package.set(salt, offset);
        offset += salt.length;
        
        // IV
        package.set(iv, offset);
        offset += iv.length;
        
        // HMAC
        package.set(hmac, offset);
        offset += hmac.length;
        
        // Data length
        view.setBigUint64(offset, BigInt(ciphertext.length), false);
        offset += 8;
        
        // Encrypted data
        package.set(ciphertext, offset);
        
        return package;
    }
    
    /**
     * Parse encrypted file package
     */
    parseFilePackage(package) {
        const view = new DataView(package.buffer);
        let offset = 0;
        
        // Verify signature
        const signature = package.slice(offset, offset + 4);
        offset += 4;
        
        if (!this.arraysEqual(signature, this.signature)) {
            throw new Error('INVALID_SIGNATURE: Not a CipherVault file');
        }
        
        // Version
        const version = package[offset++];
        if (version !== this.version) {
            throw new Error(`UNSUPPORTED_VERSION: ${version}`);
        }
        
        // Metadata length
        const metadataLength = view.getUint32(offset, false);
        offset += 4;
        
        // Metadata
        const metadataBytes = package.slice(offset, offset + metadataLength);
        offset += metadataLength;
        const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
        
        // Salt
        const saltSize = package[offset++];
        const salt = package.slice(offset, offset + saltSize);
        offset += saltSize;
        
        // IV
        const iv = package.slice(offset, offset + this.ivSize);
        offset += this.ivSize;
        
        // HMAC
        const hmac = package.slice(offset, offset + 32);
        offset += 32;
        
        // Data length
        const dataLength = Number(view.getBigUint64(offset, false));
        offset += 8;
        
        // Encrypted data
        const ciphertext = package.slice(offset, offset + dataLength);
        
        return {
            version,
            metadata,
            salt,
            iv,
            hmac,
            ciphertext,
            dataOffset: offset
        };
    }
    
    // ============================================================================
    // DECRYPTION METHODS
    // ============================================================================
    
    /**
     * Decrypt data with AES-GCM
     */
    async decryptData(ciphertext, key, iv, additionalData = null) {
        const startTime = performance.now();
        
        try {
            const algorithm = {
                name: this.algorithm,
                iv,
                tagLength: this.tagLength
            };
            
            if (additionalData) {
                algorithm.additionalData = additionalData;
            }
            
            const plaintext = await crypto.subtle.decrypt(
                algorithm,
                key,
                ciphertext
            );
            
            const duration = performance.now() - startTime;
            this.performance.decryptTimes.push(duration);
            this.trimPerformanceArray(this.performance.decryptTimes);
            
            return new Uint8Array(plaintext);
            
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error(`DECRYPTION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Decrypt file
     */
    async decryptFile(encryptedData, password, progressCallback) {
        const startTime = performance.now();
        
        try {
            // Parse file package
            const packageInfo = this.parseFilePackage(encryptedData);
            const { salt, iv, hmac, metadata, ciphertext } = packageInfo;
            
            this.updateProgress('decrypt', 20);
            
            // Verify HMAC before decryption
            const hmacKey = await this.deriveHMACKey(
                password, 
                salt, 
                Math.floor(metadata.iterations / 3)
            );
            
            const calculatedHMAC = await crypto.subtle.sign(
                'HMAC',
                hmacKey,
                ciphertext
            );
            
            const calculatedHMACBytes = new Uint8Array(calculatedHMAC).slice(0, 32);
            if (!this.arraysEqual(hmac, calculatedHMACBytes)) {
                throw new Error('INTEGRITY_CHECK_FAILED: File may be corrupted or password incorrect');
            }
            
            this.updateProgress('decrypt', 40);
            
            // Derive encryption key
            const encryptionKey = await this.deriveKey(
                password,
                salt,
                metadata.iterations,
                this.keySize
            );
            
            this.updateProgress('decrypt', 60);
            
            let decryptedData;
            if (metadata.chunked) {
                // Decrypt chunked file
                decryptedData = await this.decryptFileChunked(
                    ciphertext,
                    encryptionKey,
                    salt,
                    iv,
                    metadata
                );
            } else {
                // Decrypt single file
                const decrypted = await this.decryptData(
                    ciphertext,
                    encryptionKey,
                    iv,
                    salt
                );
                
                // Decompress if needed
                if (metadata.compressed) {
                    try {
                        const decompressed = pako.inflate(decrypted);
                        decryptedData = new Uint8Array(decompressed);
                    } catch (error) {
                        console.warn('Decompression failed:', error);
                        decryptedData = decrypted;
                    }
                } else {
                    decryptedData = decrypted;
                }
            }
            
            this.updateProgress('decrypt', 90);
            
            // Calculate performance
            const duration = performance.now() - startTime;
            const speed = metadata.originalSize / (duration / 1000);
            
            this.updateProgress('decrypt', 100);
            
            return {
                data: decryptedData,
                metadata: {
                    ...metadata,
                    decryptionTime: duration,
                    speed
                }
            };
            
        } catch (error) {
            console.error('File decryption failed:', error);
            throw error;
        }
    }
    
    /**
     * Decrypt chunked file
     */
    async decryptFileChunked(ciphertext, encryptionKey, salt, iv, metadata) {
        const decryptedChunks = [];
        let offset = 0;
        const totalChunks = metadata.totalChunks;
        
        for (let i = 0; i < totalChunks; i++) {
            // Read chunk header
            const chunkHeader = ciphertext.slice(offset, offset + 12);
            offset += 12;
            
            const view = new DataView(chunkHeader.buffer);
            const chunkIndex = view.getUint32(0, false);
            const originalSize = view.getUint32(4, false);
            const encryptedSize = view.getUint32(8, false);
            
            // Read encrypted chunk
            const encryptedChunk = ciphertext.slice(offset, offset + encryptedSize);
            offset += encryptedSize;
            
            // Generate chunk-specific IV
            const chunkIV = this.incrementIV(iv, chunkIndex);
            
            // Decrypt chunk
            const decryptedChunk = await this.decryptData(
                encryptedChunk,
                encryptionKey,
                chunkIV,
                salt
            );
            
            // Verify size
            if (decryptedChunk.length !== originalSize) {
                throw new Error(`CHUNK_SIZE_MISMATCH: Chunk ${i}`);
            }
            
            // Decompress if needed
            let finalChunk = decryptedChunk;
            if (metadata.compressed) {
                try {
                    const decompressed = pako.inflate(decryptedChunk);
                    finalChunk = new Uint8Array(decompressed);
                } catch (error) {
                    console.warn('Chunk decompression failed:', error);
                }
            }
            
            decryptedChunks.push(finalChunk);
            
            // Update progress
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            this.updateProgress('decrypt', Math.min(90, 60 + progress * 0.3));
        }
        
        // Combine all chunks
        return this.concatUint8Arrays(decryptedChunks);
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    /**
     * Detect device capabilities
     */
    detectDeviceCapabilities() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        
        // Calculate safe memory limits
        const maxMemory = isMobile ? 
            Math.min(100 * 1024 * 1024, memory * 0.3 * 1024 * 1024 * 1024) : // 30% of RAM for mobile
            Math.min(500 * 1024 * 1024, memory * 0.5 * 1024 * 1024 * 1024);  // 50% of RAM for desktop
        
        return {
            isMobile,
            maxMemory,
            cores,
            supportsWorkers: typeof Worker !== 'undefined',
            maxChunkSize: Math.min(10 * 1024 * 1024, maxMemory / 10) // 10MB or 10% of max memory
        };
    }
    
    /**
     * Secure wipe of sensitive data
     */
    secureWipeArray(array) {
        if (!array || !array.buffer) return;
        
        const view = new Uint8Array(array.buffer);
        for (let pass = 0; pass < this.memoryWipePasses; pass++) {
            // Overwrite with random data
            crypto.getRandomValues(view);
            // Overwrite with zeros
            for (let i = 0; i < view.length; i++) {
                view[i] = 0;
            }
        }
    }
    
    /**
     * Compare two arrays in constant time
     */
    arraysEqual(a, b) {
        if (a.byteLength !== b.byteLength) return false;
        
        const aView = new Uint8Array(a);
        const bView = new Uint8Array(b);
        let result = 0;
        
        for (let i = 0; i < aView.length; i++) {
            result |= aView[i] ^ bView[i];
        }
        
        return result === 0;
    }
    
    /**
     * Concatenate multiple Uint8Arrays
     */
    concatUint8Arrays(arrays) {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        
        return result;
    }
    
    /**
     * Increment IV for chunked encryption
     */
    incrementIV(iv, increment) {
        const newIV = new Uint8Array(iv);
        const view = new DataView(newIV.buffer);
        const originalValue = view.getUint32(iv.length - 4, false);
        view.setUint32(iv.length - 4, originalValue + increment, false);
        
        return newIV;
    }
    
    /**
     * Update progress callback
     */
    updateProgress(operation, percent) {
        if (typeof this.progressCallbacks.get(operation) === 'function') {
            this.progressCallbacks.get(operation)(Math.min(100, Math.max(0, percent)));
        }
    }
    
    /**
     * Set progress callback for operation
     */
    setProgressCallback(operation, callback) {
        this.progressCallbacks.set(operation, callback);
    }
    
    /**
     * Trim performance array to keep only recent measurements
     */
    trimPerformanceArray(array, maxLength = 100) {
        if (array.length > maxLength) {
            array.splice(0, array.length - maxLength);
        }
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const calculateStats = (array) => {
            if (array.length === 0) return null;
            
            const sum = array.reduce((a, b) => a + b, 0);
            const avg = sum / array.length;
            const min = Math.min(...array);
            const max = Math.max(...array);
            
            return { avg, min, max, count: array.length };
        };
        
        return {
            encryption: calculateStats(this.performance.encryptTimes),
            decryption: calculateStats(this.performance.decryptTimes),
            keyDerivation: calculateStats(this.performance.keyDerivationTimes)
        };
    }
    
    /**
     * Test cryptographic functions
     */
    async selfTest() {
        const testResults = [];
        
        try {
            // Test random generation
            const randomBytes = this.generateRandomBytes(32);
            testResults.push({
                test: 'Random Generation',
                passed: randomBytes.length === 32,
                details: 'Generated 32 random bytes'
            });
            
            // Test key derivation
            const testPassword = 'TestPassword123!@#';
            const testSalt = this.generateRandomBytes(16);
            const testKey = await this.deriveKey(testPassword, testSalt, 1000);
            
            testResults.push({
                test: 'Key Derivation',
                passed: !!testKey,
                details: 'Successfully derived key'
            });
            
            // Test encryption/decryption
            const testData = new TextEncoder().encode('Test encryption data');
            const testIV = this.generateRandomBytes(12);
            const encrypted = await this.encryptData(testData, testKey, testIV);
            const decrypted = await this.decryptData(encrypted, testKey, testIV);
            
            const dataMatches = this.arraysEqual(testData, decrypted);
            testResults.push({
                test: 'Encryption/Decryption',
                passed: dataMatches,
                details: dataMatches ? 'Data matches' : 'Data mismatch'
            });
            
            // Test HMAC
            const hmacKey = await this.deriveHMACKey(testPassword, testSalt, 1000);
            const hmac = await crypto.subtle.sign('HMAC', hmacKey, testData);
            
            testResults.push({
                test: 'HMAC Generation',
                passed: hmac.byteLength > 0,
                details: `Generated ${hmac.byteLength} byte HMAC`
            });
            
            // Test secure wipe
            const testArray = new Uint8Array([1, 2, 3, 4, 5]);
            this.secureWipeArray(testArray);
            const allZeros = testArray.every(byte => byte === 0);
            
            testResults.push({
                test: 'Secure Wipe',
                passed: allZeros,
                details: allZeros ? 'All bytes zeroed' : 'Bytes not properly wiped'
            });
            
            return {
                passed: testResults.every(r => r.passed),
                results: testResults
            };
            
        } catch (error) {
            console.error('Self-test failed:', error);
            return {
                passed: false,
                error: error.message,
                results: testResults
            };
        }
    }
}

// ============================================================================
// EXPORT AND INITIALIZATION
// ============================================================================

// Create global instance
const CryptoEngine = new CryptoCore();

// Make available globally
if (typeof window !== 'undefined') {
    window.CryptoEngine = CryptoEngine;
    window.CryptoCore = CryptoCore;
}

// Initialize self-test on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        setTimeout(async () => {
            try {
                const testResult = await CryptoEngine.selfTest();
                console.log('CryptoCore Self-Test:', testResult.passed ? 'PASSED' : 'FAILED');
                
                if (!testResult.passed) {
                    console.warn('Cryptographic self-test failed:', testResult);
                }
            } catch (error) {
                console.error('Self-test initialization failed:', error);
            }
        }, 1000);
    });
}
