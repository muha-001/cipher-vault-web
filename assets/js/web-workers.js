/**
 * CipherVault 3D Pro - Web Workers Manager
 * Handles parallel processing for large files
 * Version: 4.2.0
 */

class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.maxWorkers = this.calculateMaxWorkers();
        this.activeWorkers = 0;
        this.taskQueue = [];
        this.workerScript = this.generateWorkerScript();
    }

    /**
     * Calculate optimal number of workers based on device
     */
    calculateMaxWorkers() {
        const cores = navigator.hardwareConcurrency || 4;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        // Conservative limits for stability
        if (isMobile) {
            return Math.min(2, cores - 1);
        } else {
            return Math.min(4, cores - 1);
        }
    }

    /**
     * Generate inline worker script (avoids separate file)
     */
    generateWorkerScript() {
        return `
            self.addEventListener('message', async (event) => {
                const { taskId, operation, data, keyMaterial, chunkIndex, totalChunks } = event.data;
                
                try {
                    let result;
                    const startTime = performance.now();
                    
                    switch (operation) {
                        case 'encrypt_chunk':
                            result = await self.encryptChunk(data, keyMaterial, chunkIndex);
                            break;
                            
                        case 'decrypt_chunk':
                            result = await self.decryptChunk(data, keyMaterial, chunkIndex);
                            break;
                            
                        case 'compress':
                            result = await self.compressData(data);
                            break;
                            
                        case 'decompress':
                            result = await self.decompressData(data);
                            break;
                            
                        case 'hash':
                            result = await self.calculateHash(data);
                            break;
                            
                        default:
                            throw new Error('Unknown operation: ' + operation);
                    }
                    
                    const processingTime = performance.now() - startTime;
                    
                    self.postMessage({
                        taskId,
                        success: true,
                        result,
                        chunkIndex,
                        processingTime,
                        memoryUsage: self.performance.memory ? self.performance.memory.usedJSHeapSize : 0
                    });
                    
                } catch (error) {
                    self.postMessage({
                        taskId,
                        success: false,
                        error: error.message,
                        chunkIndex
                    });
                }
            });

            // Encryption function for chunks
            async function encryptChunk(data, keyMaterial, chunkIndex) {
                const iv = new Uint8Array(12);
                crypto.getRandomValues(iv);
                
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyMaterial,
                    { name: 'AES-GCM' },
                    false,
                    ['encrypt']
                );
                
                const encrypted = await crypto.subtle.encrypt(
                    {
                        name: 'AES-GCM',
                        iv,
                        tagLength: 128
                    },
                    key,
                    data
                );
                
                // Combine IV + encrypted data
                const result = new Uint8Array(iv.length + encrypted.byteLength);
                result.set(iv, 0);
                result.set(new Uint8Array(encrypted), iv.length);
                
                return result.buffer;
            }

            // Decryption function for chunks
            async function decryptChunk(data, keyMaterial, chunkIndex) {
                const iv = data.slice(0, 12);
                const ciphertext = data.slice(12);
                
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyMaterial,
                    { name: 'AES-GCM' },
                    false,
                    ['decrypt']
                );
                
                const decrypted = await crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv,
                        tagLength: 128
                    },
                    key,
                    ciphertext
                );
                
                return decrypted;
            }

            // Compression using pako (must be loaded in main thread and passed)
            async function compressData(data) {
                if (typeof self.pako !== 'undefined') {
                    const compressed = self.pako.deflate(new Uint8Array(data));
                    return compressed.buffer;
                }
                throw new Error('Compression library not available');
            }

            // Decompression using pako
            async function decompressData(data) {
                if (typeof self.pako !== 'undefined') {
                    const decompressed = self.pako.inflate(new Uint8Array(data));
                    return decompressed.buffer;
                }
                throw new Error('Compression library not available');
            }

            // Hash calculation
            async function calculateHash(data) {
                const hash = await crypto.subtle.digest('SHA-256', data);
                return hash;
            }

            // Error handler
            self.addEventListener('error', (error) => {
                self.postMessage({
                    error: 'Worker error: ' + error.message
                });
            });
        `;
    }

    /**
     * Initialize workers
     */
    async initialize() {
        if (!this.supportsWorkers()) {
            console.warn('Web Workers not supported, falling back to main thread');
            return false;
        }

        try {
            for (let i = 0; i < this.maxWorkers; i++) {
                await this.createWorker(i);
            }
            console.log(`Initialized ${this.maxWorkers} workers`);
            return true;
        } catch (error) {
            console.error('Failed to initialize workers:', error);
            return false;
        }
    }

    /**
     * Create a new worker
     */
    async createWorker(id) {
        return new Promise((resolve, reject) => {
            try {
                const blob = new Blob([this.workerScript], { type: 'application/javascript' });
                const workerURL = URL.createObjectURL(blob);
                const worker = new Worker(workerURL);

                worker.id = id;
                worker.busy = false;
                worker.taskCount = 0;

                worker.onmessage = (event) => {
                    this.handleWorkerResponse(worker, event.data);
                };

                worker.onerror = (error) => {
                    console.error(`Worker ${id} error:`, error);
                    this.handleWorkerError(worker, error);
                };

                this.workers.set(id, worker);
                URL.revokeObjectURL(workerURL); // Clean up URL
                resolve(worker);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Process file using workers
     */
    async processFile(file, password, operation, options = {}) {
        if (!this.supportsWorkers() || this.workers.size === 0) {
            throw new Error('Workers not available');
        }

        const fileSize = file.size;
        const chunkSize = options.chunkSize || Math.min(10 * 1024 * 1024, fileSize / this.maxWorkers);
        const totalChunks = Math.ceil(fileSize / chunkSize);

        // Generate key material once
        const keyMaterial = await this.prepareKeyMaterial(password, options);

        // Prepare all chunks
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, fileSize);
            chunks.push({ index: i, start, end });
        }

        // Process chunks in parallel
        const results = await this.processChunksParallel(
            file,
            chunks,
            operation,
            keyMaterial,
            totalChunks
        );

        // Combine results
        return this.combineResults(results, file, operation);
    }

    /**
     * Process chunks in parallel using available workers
     */
    async processChunksParallel(file, chunks, operation, keyMaterial, totalChunks) {
        const results = new Array(chunks.length);
        const pendingChunks = [...chunks];
        const activeTasks = new Map();

        return new Promise((resolve, reject) => {
            let completed = 0;
            let failed = false;

            const processNextChunk = () => {
                if (failed || pendingChunks.length === 0) {
                    return;
                }

                const worker = this.getAvailableWorker();
                if (!worker) {
                    return; // No workers available, wait
                }

                const chunk = pendingChunks.shift();
                const taskId = `${Date.now()}_${chunk.index}`;

                // Read chunk data
                this.readChunk(file, chunk.start, chunk.end)
                    .then(data => {
                        worker.busy = true;
                        activeTasks.set(worker.id, taskId);

                        worker.postMessage({
                            taskId,
                            operation: operation + '_chunk',
                            data: data.buffer,
                            keyMaterial,
                            chunkIndex: chunk.index,
                            totalChunks
                        }, [data.buffer]); // Transfer ownership
                    })
                    .catch(error => {
                        console.error('Failed to read chunk:', error);
                        results[chunk.index] = { error, index: chunk.index };
                        completed++;
                        checkCompletion();
                    });
            };

            const handleWorkerResponse = (workerId, response) => {
                const worker = this.workers.get(workerId);
                if (worker) {
                    worker.busy = false;
                    worker.taskCount++;
                    activeTasks.delete(workerId);
                }

                if (response.success) {
                    results[response.chunkIndex] = {
                        data: response.result,
                        index: response.chunkIndex,
                        processingTime: response.processingTime
                    };
                } else {
                    results[response.chunkIndex] = {
                        error: response.error,
                        index: response.chunkIndex
                    };
                    failed = true;
                    reject(new Error(`Worker failed on chunk ${response.chunkIndex}: ${response.error}`));
                }

                completed++;
                checkCompletion();
                
                if (!failed) {
                    processNextChunk();
                }
            };

            // Attach response handler to workers
            this.workers.forEach((worker, id) => {
                const originalOnMessage = worker.onmessage;
                worker.onmessage = (event) => {
                    if (originalOnMessage) originalOnMessage.call(worker, event);
                    handleWorkerResponse(id, event.data);
                };
            });

            const checkCompletion = () => {
                if (completed === chunks.length) {
                    resolve(results);
                }
            };

            // Start processing initial batch
            const initialBatch = Math.min(this.maxWorkers, chunks.length);
            for (let i = 0; i < initialBatch; i++) {
                processNextChunk();
            }
        });
    }

    /**
     * Get available worker
     */
    getAvailableWorker() {
        for (const [id, worker] of this.workers) {
            if (!worker.busy) {
                return worker;
            }
        }
        return null;
    }

    /**
     * Read chunk from file
     */
    async readChunk(file, start, end) {
        const slice = file.slice(start, end);
        return new Uint8Array(await slice.arrayBuffer());
    }

    /**
     * Prepare key material for workers
     */
    async prepareKeyMaterial(password, options) {
        // Derive key once and pass to workers
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iterations = options.iterations || 310000;

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        const rawKey = await crypto.subtle.exportKey('raw', derivedKey);
        return new Uint8Array(rawKey);
    }

    /**
     * Combine worker results
     */
    combineResults(results, originalFile, operation) {
        // Sort by chunk index
        results.sort((a, b) => a.index - b.index);

        // Check for errors
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            throw new Error(`Failed to process ${errors.length} chunks`);
        }

        // Calculate total size
        const totalSize = results.reduce((sum, result) => {
            return sum + (result.data ? result.data.byteLength : 0);
        }, 0);

        // Combine all data
        const combined = new Uint8Array(totalSize);
        let offset = 0;

        for (const result of results) {
            if (result.data) {
                const data = new Uint8Array(result.data);
                combined.set(data, offset);
                offset += data.length;
            }
        }

        return {
            data: combined,
            metadata: {
                originalSize: originalFile.size,
                processedSize: combined.length,
                chunks: results.length,
                operation
            }
        };
    }

    /**
     * Handle worker response
     */
    handleWorkerResponse(worker, response) {
        if (response.error) {
            console.error(`Worker ${worker.id} reported error:`, response.error);
        }
    }

    /**
     * Handle worker error
     */
    handleWorkerError(worker, error) {
        console.error(`Worker ${worker.id} crashed:`, error);
        this.workers.delete(worker.id);
        
        // Try to recreate worker
        setTimeout(() => {
            this.createWorker(worker.id).catch(err => {
                console.error('Failed to recreate worker:', err);
            });
        }, 1000);
    }

    /**
     * Check if workers are supported
     */
    supportsWorkers() {
        return typeof Worker !== 'undefined' && typeof Blob !== 'undefined';
    }

    /**
     * Get worker statistics
     */
    getStatistics() {
        const stats = {
            totalWorkers: this.workers.size,
            busyWorkers: Array.from(this.workers.values()).filter(w => w.busy).length,
            totalTasksProcessed: Array.from(this.workers.values()).reduce((sum, w) => sum + w.taskCount, 0),
            queueLength: this.taskQueue.length
        };

        // Add memory info if available
        if (performance.memory) {
            stats.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            };
        }

        return stats;
    }

    /**
     * Terminate all workers
     */
    terminate() {
        this.workers.forEach(worker => {
            try {
                worker.terminate();
            } catch (error) {
                console.error('Error terminating worker:', error);
            }
        });
        this.workers.clear();
        this.taskQueue = [];
        this.activeWorkers = 0;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.terminate();
    }
}

// Create global instance
const WorkerManagerInstance = new WorkerManager();

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        try {
            await WorkerManagerInstance.initialize();
            console.log('Worker Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Worker Manager:', error);
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        WorkerManagerInstance.cleanup();
    });

    window.WorkerManager = WorkerManagerInstance;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkerManagerInstance;
}
