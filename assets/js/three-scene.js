/**
 * CipherVault 3D Pro - Three.js Scene Manager
 * Version: 4.2.0 - Enhanced Performance Edition
 * 
 * Manages the 3D visualization using Three.js
 * Enhanced for security applications with optimized memory management
 */

// ============================================================================
// THREE.JS SCENE CONFIGURATION - OPTIMIZED FOR SECURITY APPLICATIONS
// ============================================================================

const THREE_SCENE_CONFIG = {
    // Scene settings - optimized for dark security theme
    scene: {
        background: 0x050510,
        fog: {
            color: 0x050510,
            near: 1,
            far: 1000
        }
    },
    
    // Camera settings - optimized for surveillance view
    camera: {
        fov: 75,
        near: 0.1,
        far: 10000,
        position: { x: 0, y: 0, z: 25 }
    },
    
    // Renderer settings - optimized for performance
    renderer: {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true, // Important for security applications
        shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap || 2
        },
        precision: 'highp' // Better quality for security visualization
    },
    
    // Lighting settings - optimized for security monitoring
    lighting: {
        ambient: {
            color: 0x00aaff,
            intensity: 0.15 // Reduced for better performance
        },
        directional: {
            color: 0x00d4ff,
            intensity: 0.6, // Reduced for better performance
            position: { x: 10, y: 10, z: 5 }
        },
        pointLights: [
            {
                color: 0xff0080,
                intensity: 0.3, // Reduced for better performance
                distance: 100,
                position: { x: -20, y: 10, z: 10 }
            },
            {
                color: 0x00ff88,
                intensity: 0.3, // Reduced for better performance
                distance: 100,
                position: { x: 20, y: -10, z: -10 }
            }
        ]
    },
    
    // Particle system - OPTIMIZED for memory management
    particles: {
        count: 1000, // Reduced from 2000 for better performance
        size: 0.08, // Slightly reduced
        opacity: 0.7,
        colors: {
            min: 0x0088ff,
            max: 0x00ffff
        },
        speed: 0.0008,
        spread: 150 // Reduced spread for better clustering
    },
    
    // Floating cubes - OPTIMIZED for memory management
    cubes: {
        count: 15, // Reduced from 25 for better performance
        size: 0.8, // Slightly reduced
        colors: [
            0x00d4ff, // Cyan
            0xff0080, // Pink
            0x00ff88, // Green
            0xffaa00, // Orange
            0xaa00ff  // Purple
        ],
        opacity: 0.5, // Reduced for better performance
        rotationSpeed: { min: 0.008, max: 0.02 }, // Reduced speed
        floatSpeed: { min: 0.001, max: 0.008 }, // Reduced speed
        spread: 40 // Reduced spread
    },
    
    // Animation settings - OPTIMIZED for security applications
    animation: {
        enabled: true,
        frameRate: 60,
        motionBlur: false,
        bloomEffect: true,
        bloom: {
            strength: 0.4, // Reduced for performance
            radius: 0.3,
            threshold: 0.9 // Increased threshold
        }
    },
    
    // Performance settings - ENHANCED for security applications
    performance: {
        maxFPS: 60,
        adaptiveQuality: true,
        dynamicScaling: true,
        lowPowerMode: false,
        memoryThreshold: 0.85, // Lowered from 0.9
        fpsThreshold: 30, // Adjusted for better UX
        autoCleanup: true, // Auto cleanup of unused resources
        cleanupInterval: 30000 // Cleanup every 30 seconds
    }
};

// ============================================================================
// THREE.JS SCENE MANAGER - ENHANCED WITH SECURITY OPTIMIZATIONS
// ============================================================================

class ThreeSceneManager {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        // Scene objects
        this.particles = [];
        this.cubes = [];
        this.lights = [];
        this.effects = {};
        
        // Animation state
        this.animationId = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        // Performance monitoring - ENHANCED
        this.performance = {
            frameTimes: [],
            memoryUsage: [],
            lastMemoryCheck: 0,
            lastCleanup: 0,
            cleanupCount: 0
        };
        
        // Mouse interaction
        this.mouse = {
            x: 0,
            y: 0,
            normalizedX: 0,
            normalizedY: 0,
            isMoving: false,
            lastMoveTime: 0
        };
        
        // Configuration
        this.config = THREE_SCENE_CONFIG;
        
        // Error tracking
        this.errors = [];
        
        // Initialize
        this.init();
    }
    
    // ============================================================================
    // INITIALIZATION - WITH ENHANCED ERROR HANDLING
    // ============================================================================
    
    /**
     * Initialize Three.js scene with enhanced error handling
     */
    init() {
        console.log('Initializing Three.js scene for CipherVault Security...');
        
        try {
            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js library not loaded. Required for security visualization.');
            }
            
            // Check WebGL support
            if (!this.checkWebGLSupport()) {
                throw new Error('WebGL not supported. 3D visualization disabled.');
            }
            
            // Create scene components
            this.createScene();
            this.createCamera();
            this.createRenderer();
            
            // Create scene elements
            this.createLighting();
            this.createParticles();
            this.createFloatingCubes();
            
            // Create effects (with fallback)
            if (this.config.animation.bloomEffect) {
                this.createEffects();
            }
            
            // Setup controls
            this.setupControls();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.startAnimation();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Start auto cleanup if enabled
            if (this.config.performance.autoCleanup) {
                this.startAutoCleanup();
            }
            
            console.log('Three.js scene initialized successfully for security monitoring');
            
        } catch (error) {
            console.error('Failed to initialize Three.js scene:', error);
            this.handleInitError(error);
        }
    }
    
    /**
     * Check WebGL support
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl instanceof WebGLRenderingContext;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Create Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.scene.background);
        
        // Add fog for depth (security theme)
        this.scene.fog = new THREE.Fog(
            this.config.scene.fog.color,
            this.config.scene.fog.near,
            this.config.scene.fog.far
        );
        
        // Add scene helper only in debug mode
        if (window.location.hash === '#debug') {
            const axesHelper = new THREE.AxesHelper(10); // Smaller for performance
            this.scene.add(axesHelper);
        }
    }
    
    /**
     * Create camera
     */
    createCamera() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            this.config.camera.fov,
            aspectRatio,
            this.config.camera.near,
            this.config.camera.far
        );
        
        this.camera.position.set(
            this.config.camera.position.x,
            this.config.camera.position.y,
            this.config.camera.position.z
        );
        
        this.camera.lookAt(0, 0, 0);
        
        // Store original position for reset
        this.camera.userData = {
            originalPosition: this.camera.position.clone(),
            originalRotation: this.camera.rotation.clone()
        };
    }
    
    /**
     * Create renderer with security optimizations
     */
    createRenderer() {
        try {
            // Create WebGL renderer with security settings
            const rendererOptions = {
                antialias: this.config.renderer.antialias,
                alpha: this.config.renderer.alpha,
                powerPreference: this.config.renderer.powerPreference,
                preserveDrawingBuffer: this.config.renderer.preserveDrawingBuffer,
                precision: this.config.renderer.precision,
                stencil: false, // Disabled for performance
                depth: true
            };
            
            this.renderer = new THREE.WebGLRenderer(rendererOptions);
            
            // Configure renderer for security applications
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limited for performance
            this.renderer.shadowMap.enabled = this.config.renderer.shadowMap.enabled;
            
            // Use available shadow map type
            if (THREE.PCFSoftShadowMap) {
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            
            // Encoding and tone mapping
            if (THREE.sRGBEncoding) {
                this.renderer.outputEncoding = THREE.sRGBEncoding;
            }
            
            if (THREE.ACESFilmicToneMapping) {
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            }
            
            this.renderer.toneMappingExposure = 0.9; // Slightly reduced
            
            // Add renderer to DOM
            const container = document.getElementById('threejs-container');
            if (container) {
                // Clear any existing canvas
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                container.appendChild(this.renderer.domElement);
            } else {
                console.warn('Three.js container not found, creating fallback container');
                this.createFallbackContainer();
            }
            
            // Set renderer ID for debugging
            this.renderer.domElement.id = 'ciphervault-3d-renderer';
            
        } catch (error) {
            console.error('Failed to create WebGL renderer:', error);
            this.createCanvasFallback();
        }
    }
    
    /**
     * Create fallback container
     */
    createFallbackContainer() {
        const container = document.createElement('div');
        container.id = 'threejs-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Create canvas fallback
     */
    createCanvasFallback() {
        console.warn('Using canvas fallback for 3D visualization');
        
        const container = document.getElementById('threejs-container') || this.createFallbackContainer();
        const canvas = document.createElement('canvas');
        canvas.id = 'ciphervault-canvas-fallback';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #050510 0%, #0a1a2a 100%);
        `;
        
        // Clear container and add canvas
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(canvas);
        
        // Dispatch event for fallback mode
        const event = new CustomEvent('threejs:fallback', { detail: { reason: 'WebGL not available' } });
        window.dispatchEvent(event);
    }
    
    /**
     * Create lighting
     */
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            this.config.lighting.ambient.color,
            this.config.lighting.ambient.intensity
        );
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Directional light (main light)
        const directionalLight = new THREE.DirectionalLight(
            this.config.lighting.directional.color,
            this.config.lighting.directional.intensity
        );
        directionalLight.position.set(
            this.config.lighting.directional.position.x,
            this.config.lighting.directional.position.y,
            this.config.lighting.directional.position.z
        );
        
        // Enable shadows only if performance allows
        if (this.config.renderer.shadowMap.enabled) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 1024; // Reduced for performance
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 300; // Reduced
        }
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Point lights (reduced for performance)
        this.config.lighting.pointLights.forEach((lightConfig, index) => {
            const pointLight = new THREE.PointLight(
                lightConfig.color,
                lightConfig.intensity,
                lightConfig.distance
            );
            pointLight.position.set(
                lightConfig.position.x,
                lightConfig.position.y,
                lightConfig.position.z
            );
            
            // Store original intensity
            pointLight.userData = { originalIntensity: lightConfig.intensity };
            
            this.scene.add(pointLight);
            this.lights.push(pointLight);
        });
    }
    
    /**
     * Create particle system with memory optimization
     */
    createParticles() {
        const particleCount = this.config.particles.count;
        
        // Use BufferGeometry for better performance
        const geometry = new THREE.BufferGeometry();
        
        // Create positions
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Color helper
        const colorMin = new THREE.Color(this.config.particles.colors.min);
        const colorMax = new THREE.Color(this.config.particles.colors.max);
        
        for (let i = 0; i < particleCount; i++) {
            // Position in a sphere
            const radius = Math.random() * this.config.particles.spread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Interpolate color
            const t = Math.random();
            const color = new THREE.Color();
            color.r = colorMin.r + (colorMax.r - colorMin.r) * t;
            color.g = colorMin.g + (colorMax.g - colorMin.g) * t;
            color.b = colorMin.b + (colorMax.b - colorMin.b) * t;
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random size
            sizes[i] = Math.random() * 0.04 + this.config.particles.size;
        }
        
        // Set attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Material with performance optimizations
        const material = new THREE.PointsMaterial({
            size: this.config.particles.size,
            vertexColors: true,
            transparent: true,
            opacity: this.config.particles.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.frustumCulled = false; // Prevent culling for always visible particles
        
        // Store animation data
        particleSystem.userData = {
            originalPositions: positions.slice(),
            speeds: Array.from({ length: particleCount }, () => ({
                x: (Math.random() - 0.5) * this.config.particles.speed,
                y: (Math.random() - 0.5) * this.config.particles.speed,
                z: (Math.random() - 0.5) * this.config.particles.speed
            })),
            timeOffset: Math.random() * Math.PI * 2
        };
        
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
    }
    
    /**
     * Create floating cubes with performance optimization
     */
    createFloatingCubes() {
        const geometry = new THREE.BoxGeometry(
            this.config.cubes.size,
            this.config.cubes.size,
            this.config.cubes.size
        );
        
        // Reuse geometry for all cubes (instancing would be better but more complex)
        for (let i = 0; i < this.config.cubes.count; i++) {
            const colorIndex = i % this.config.cubes.colors.length;
            const color = this.config.cubes.colors[colorIndex];
            
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: this.config.cubes.opacity,
                shininess: 80,
                specular: 0x111111,
                emissive: 0x000000,
                emissiveIntensity: 0.05
            });
            
            const cube = new THREE.Mesh(geometry, material);
            
            // Position
            cube.position.set(
                (Math.random() - 0.5) * this.config.cubes.spread * 2,
                (Math.random() - 0.5) * this.config.cubes.spread * 2,
                (Math.random() - 0.5) * this.config.cubes.spread * 2
            );
            
            // Random rotation
            cube.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Animation data
            cube.userData = {
                originalPosition: cube.position.clone(),
                rotationSpeed: {
                    x: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) + 
                       this.config.cubes.rotationSpeed.min,
                    y: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) + 
                       this.config.cubes.rotationSpeed.min,
                    z: Math.random() * (this.config.cubes.rotationSpeed.max - this.config.cubes.rotationSpeed.min) + 
                       this.config.cubes.rotationSpeed.min
                },
                floatSpeed: Math.random() * (this.config.cubes.floatSpeed.max - this.config.cubes.floatSpeed.min) + 
                           this.config.cubes.floatSpeed.min,
                floatOffset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.008 + 0.004,
                pulseOffset: Math.random() * Math.PI * 2
            };
            
            this.scene.add(cube);
            this.cubes.push(cube);
        }
        
        // Mark geometry for disposal when no longer needed
        geometry.userData = { canDispose: true };
    }
    
    /**
     * Create post-processing effects with fallback
     */
    async createEffects() {
        // Skip if WebGL2 not available
        if (this.renderer.capabilities && !this.renderer.capabilities.isWebGL2) {
            console.warn('WebGL 2 not available, skipping advanced effects');
            return;
        }
        
        // Skip if required classes not available
        if (typeof THREE.EffectComposer === 'undefined') {
            console.warn('EffectComposer not available, skipping post-processing');
            return;
        }
        
        try {
            // Dynamically load required passes if needed
            await this.loadRequiredPasses();
            
            // Create effect composer
            this.composer = new THREE.EffectComposer(this.renderer);
            
            // Create render pass
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Try to create bloom pass (may fail if UnrealBloomPass not available)
            if (typeof THREE.UnrealBloomPass !== 'undefined') {
                const bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    this.config.animation.bloom.strength,
                    this.config.animation.bloom.radius,
                    this.config.animation.bloom.threshold
                );
                this.composer.addPass(bloomPass);
                this.effects.bloom = bloomPass;
                
                console.log('Bloom effect initialized');
            } else {
                console.warn('UnrealBloomPass not available, using basic rendering');
            }
            
            this.effects.composer = this.composer;
            
        } catch (error) {
            console.warn('Failed to create post-processing effects:', error);
            this.composer = null;
            this.effects = {};
        }
    }
    
    /**
     * Load required post-processing passes
     */
    async loadRequiredPasses() {
        const requiredClasses = ['EffectComposer', 'RenderPass', 'UnrealBloomPass'];
        const missingClasses = requiredClasses.filter(cls => typeof THREE[cls] === 'undefined');
        
        if (missingClasses.length === 0) return;
        
        console.log('Loading missing post-processing classes:', missingClasses);
        
        // In a real implementation, you would load these scripts dynamically
        // For now, we'll just warn and continue without effects
        console.warn('Some post-processing classes not available:', missingClasses);
    }
    
    /**
     * Setup orbit controls with fallback
     */
    setupControls() {
        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('OrbitControls not available, using basic interaction');
            return;
        }
        
        try {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.rotateSpeed = 0.5;
            this.controls.zoomSpeed = 0.8;
            this.controls.panSpeed = 0.8;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.enableRotate = true;
            this.controls.maxDistance = 100;
            this.controls.minDistance = 5;
            this.controls.maxPolarAngle = Math.PI;
            this.controls.minPolarAngle = 0;
            
            // Store original settings
            this.controls.userData = {
                originalDamping: this.controls.enableDamping,
                originalSpeed: this.controls.rotateSpeed
            };
            
        } catch (error) {
            console.warn('Failed to setup OrbitControls:', error);
            this.controls = null;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.onWindowResize(), 250);
        });
        
        // Mouse movement
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseleave', () => this.onMouseLeave());
        
        // Visibility change
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Debug controls
        if (window.location.hash === '#debug') {
            window.addEventListener('keydown', (e) => this.onDebugKeyDown(e));
        }
    }
    
    // ============================================================================
    // ANIMATION LOOP - WITH PERFORMANCE OPTIMIZATIONS
    // ============================================================================
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (!this.config.animation.enabled) {
            console.log('Animation disabled, rendering static scene');
            this.render();
            return;
        }
        
        console.log('Starting optimized animation loop...');
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    /**
     * Animation loop with performance optimizations
     */
    animate(currentTime) {
        // Calculate delta time with clamping
        let deltaTime = currentTime - this.lastFrameTime;
        deltaTime = Math.min(deltaTime, 100); // Cap at 100ms for stability
        this.lastFrameTime = currentTime;
        
        // Update FPS calculation
        this.updateFPS(currentTime);
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update mouse state
        this.updateMouseState();
        
        // Update scene elements
        this.updateParticles(deltaTime);
        this.updateCubes(deltaTime);
        this.updateLighting(deltaTime);
        
        // Update camera
        if (!this.controls) {
            this.updateCamera(deltaTime);
        }
        
        // Render
        this.render();
        
        // Performance monitoring
        this.monitorPerformance(deltaTime);
        
        // Continue animation
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    /**
     * Update FPS calculation
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime > 1000) {
            this.fps = Math.round((this.frameCount * 1000) / currentTime);
            this.frameCount = 0;
            
            // Store for performance monitoring
            this.performance.frameTimes.push(1000 / this.fps);
            if (this.performance.frameTimes.length > 60) {
                this.performance.frameTimes.shift();
            }
        }
    }
    
    /**
     * Update particles animation
     */
    updateParticles(deltaTime) {
        if (!this.particles.length) return;
        
        const time = performance.now() * 0.001;
        
        this.particles.forEach(particleSystem => {
            const positions = particleSystem.geometry.attributes.position.array;
            const originalPositions = particleSystem.userData.originalPositions;
            const speeds = particleSystem.userData.speeds;
            const timeOffset = particleSystem.userData.timeOffset;
            
            // Optimized animation loop
            for (let i = 0; i < positions.length; i += 3) {
                const idx = i / 3;
                const speed = speeds[idx];
                
                // Calculate movement
                const t = time + timeOffset + idx * 0.005;
                
                positions[i] = originalPositions[i] + 
                    Math.sin(t * 0.5) * 0.3 +
                    speed.x * t * 8;
                
                positions[i + 1] = originalPositions[i + 1] + 
                    Math.cos(t * 0.3) * 0.3 +
                    speed.y * t * 8;
                
                positions[i + 2] = originalPositions[i + 2] + 
                    Math.sin(t * 0.7) * 0.3 +
                    speed.z * t * 8;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    /**
     * Update cubes animation
     */
    updateCubes(deltaTime) {
        const time = performance.now() * 0.001;
        const deltaFactor = deltaTime / 16; // Normalize to 60fps
        
        this.cubes.forEach(cube => {
            const data = cube.userData;
            
            // Rotation
            cube.rotation.x += data.rotationSpeed.x * deltaFactor;
            cube.rotation.y += data.rotationSpeed.y * deltaFactor;
            cube.rotation.z += data.rotationSpeed.z * deltaFactor;
            
            // Floating motion
            const floatT = time * data.floatSpeed + data.floatOffset;
            cube.position.y = data.originalPosition.y + Math.sin(floatT) * 1.5;
            
            // Pulsing scale
            const pulse = Math.sin(time * data.pulseSpeed + data.pulseOffset) * 0.08 + 0.92;
            cube.scale.setScalar(pulse);
            
            // Update material
            if (cube.material) {
                cube.material.opacity = this.config.cubes.opacity * (0.9 + pulse * 0.1);
            }
        });
    }
    
    /**
     * Update lighting
     */
    updateLighting(deltaTime) {
        const time = performance.now() * 0.001;
        
        this.lights.forEach((light, index) => {
            if (light.isPointLight && light.userData.originalIntensity) {
                // Subtle pulsing
                const intensity = light.userData.originalIntensity;
                const pulse = Math.sin(time * 0.3 + index) * 0.15 + 0.85;
                light.intensity = intensity * pulse;
            }
        });
    }
    
    /**
     * Update camera based on mouse
     */
    updateCamera(deltaTime) {
        if (this.controls || !this.mouse.isMoving) return;
        
        const targetX = this.mouse.normalizedX * 3;
        const targetY = this.mouse.normalizedY * 2;
        
        // Smooth interpolation
        this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
        this.camera.position.y += (-targetY - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Update mouse state
     */
    updateMouseState() {
        const currentTime = performance.now();
        const timeSinceMove = currentTime - this.mouse.lastMoveTime;
        
        this.mouse.isMoving = timeSinceMove < 150; // 150ms threshold
        
        this.mouse.normalizedX = (this.mouse.x / window.innerWidth) * 2 - 1;
        this.mouse.normalizedY = (this.mouse.y / window.innerHeight) * 2 - 1;
    }
    
    /**
     * Render scene
     */
    render() {
        try {
            if (this.composer && this.config.animation.bloomEffect) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.error('Render error:', error);
            this.handleRenderError(error);
        }
    }
    
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Dispatch event
        const event = new CustomEvent('threejs:resize', {
            detail: { width: window.innerWidth, height: window.innerHeight }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        this.mouse.lastMoveTime = performance.now();
        this.mouse.isMoving = true;
    }
    
    /**
     * Handle mouse leave
     */
    onMouseLeave() {
        this.mouse.isMoving = false;
    }
    
    /**
     * Handle visibility change
     */
    onVisibilityChange() {
        if (document.hidden) {
            this.pauseAnimation();
        } else {
            this.resumeAnimation();
        }
    }
    
    /**
     * Handle debug key presses
     */
    onDebugKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'p':
                this.togglePerformanceMode();
                break;
            case 'b':
                this.toggleBloomEffect();
                break;
            case 'r':
                this.resetScene();
                break;
            case 's':
                this.logStatistics();
                break;
        }
    }
    
    // ============================================================================
    // PERFORMANCE MANAGEMENT - ENHANCED FOR SECURITY APPLICATIONS
    // ============================================================================
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Memory monitoring
        setInterval(() => this.checkMemoryUsage(), 15000);
        
        // Performance logging
        setInterval(() => this.logPerformanceStats(), 60000);
    }
    
    /**
     * Start auto cleanup
     */
    startAutoCleanup() {
        setInterval(() => {
            if (this.config.performance.autoCleanup) {
                this.autoCleanup();
            }
        }, this.config.performance.cleanupInterval);
    }
    
    /**
     * Monitor performance
     */
    monitorPerformance(deltaTime) {
        // Track frame time
        this.performance.frameTimes.push(deltaTime);
        if (this.performance.frameTimes.length > 120) {
            this.performance.frameTimes.shift();
        }
        
        // Adaptive quality adjustment
        if (this.config.performance.adaptiveQuality && this.performance.frameTimes.length >= 30) {
            this.adjustQualityBasedOnPerformance();
        }
    }
    
    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (!performance.memory) return;
        
        const memory = performance.memory;
        const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        this.performance.memoryUsage.push({
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            usage: usage,
            timestamp: Date.now()
        });
        
        // Keep last 20 measurements
        if (this.performance.memoryUsage.length > 20) {
            this.performance.memoryUsage.shift();
        }
        
        // Check threshold
        if (usage > this.config.performance.memoryThreshold) {
            console.warn(`High memory usage: ${Math.round(usage * 100)}%`);
            this.reduceMemoryUsage();
        }
    }
    
    /**
     * Log performance statistics
     */
    logPerformanceStats() {
        if (this.performance.frameTimes.length === 0) return;
        
        const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b, 0) / 
                            this.performance.frameTimes.length;
        const avgFPS = 1000 / avgFrameTime;
        
        console.log(`Performance - FPS: ${Math.round(avgFPS)}, Frame: ${avgFrameTime.toFixed(2)}ms`);
        
        if (this.performance.memoryUsage.length > 0) {
            const mem = this.performance.memoryUsage[this.performance.memoryUsage.length - 1];
            const usedMB = mem.used / (1024 * 1024);
            console.log(`Memory - Used: ${usedMB.toFixed(2)}MB, Usage: ${Math.round(mem.usage * 100)}%`);
        }
    }
    
    /**
     * Adjust quality based on performance
     */
    adjustQualityBasedOnPerformance() {
        if (this.performance.frameTimes.length < 30) return;
        
        const avgFrameTime = this.performance.frameTimes.reduce((a, b) => a + b, 0) / 
                            this.performance.frameTimes.length;
        const currentFPS = 1000 / avgFrameTime;
        
        // Adjust particle count
        if (currentFPS < this.config.performance.fpsThreshold) {
            this.reduceParticleCount();
        } else if (currentFPS > 50 && this.config.particles.count < THREE_SCENE_CONFIG.particles.count) {
            this.increaseParticleCount();
        }
    }
    
    /**
     * Reduce particle count
     */
    reduceParticleCount() {
        if (!this.particles.length) return;
        
        const particleSystem = this.particles[0];
        const currentCount = particleSystem.geometry.attributes.position.count;
        const targetCount = Math.max(300, Math.floor(currentCount * 0.7));
        
        if (targetCount < currentCount) {
            this.adjustParticleCount(targetCount);
            console.log(`Reduced particles from ${currentCount} to ${targetCount} for performance`);
        }
    }
    
    /**
     * Increase particle count
     */
    increaseParticleCount() {
        if (!this.particles.length) return;
        
        const particleSystem = this.particles[0];
        const currentCount = particleSystem.geometry.attributes.position.count;
        const targetCount = Math.min(
            THREE_SCENE_CONFIG.particles.count,
            Math.floor(currentCount * 1.3)
        );
        
        if (targetCount > currentCount) {
            this.adjustParticleCount(targetCount);
            console.log(`Increased particles from ${currentCount} to ${targetCount}`);
        }
    }
    
    /**
     * Adjust particle count
     */
    adjustParticleCount(targetCount) {
        if (!this.particles.length) return;
        
        const particleSystem = this.particles[0];
        const currentCount = particleSystem.geometry.attributes.position.count;
        
        if (targetCount === currentCount) return;
        
        // Create new arrays
        const newPositions = new Float32Array(targetCount * 3);
        const newColors = new Float32Array(targetCount * 3);
        const newSizes = new Float32Array(targetCount);
        
        // Copy existing particles
        const copyCount = Math.min(currentCount, targetCount);
        const oldPositions = particleSystem.geometry.attributes.position.array;
        const oldColors = particleSystem.geometry.attributes.color.array;
        
        for (let i = 0; i < copyCount; i++) {
            newPositions[i * 3] = oldPositions[i * 3];
            newPositions[i * 3 + 1] = oldPositions[i * 3 + 1];
            newPositions[i * 3 + 2] = oldPositions[i * 3 + 2];
            
            newColors[i * 3] = oldColors[i * 3];
            newColors[i * 3 + 1] = oldColors[i * 3 + 1];
            newColors[i * 3 + 2] = oldColors[i * 3 + 2];
            
            newSizes[i] = particleSystem.geometry.attributes.size?.array[i] || this.config.particles.size;
        }
        
        // Add new particles if needed
        for (let i = copyCount; i < targetCount; i++) {
            const radius = Math.random() * this.config.particles.spread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            newPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            newPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            newPositions[i * 3 + 2] = radius * Math.cos(phi);
            
            const color = new THREE.Color(
                Math.random() * (this.config.particles.colors.max - this.config.particles.colors.min) + 
                this.config.particles.colors.min
            );
            newColors[i * 3] = color.r;
            newColors[i * 3 + 1] = color.g;
            newColors[i * 3 + 2] = color.b;
            
            newSizes[i] = Math.random() * 0.04 + this.config.particles.size;
        }
        
        // Update geometry
        particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        particleSystem.geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
        particleSystem.geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
        
        // Update user data
        particleSystem.userData.originalPositions = newPositions.slice();
        particleSystem.userData.speeds = Array.from({ length: targetCount }, () => ({
            x: (Math.random() - 0.5) * this.config.particles.speed,
            y: (Math.random() - 0.5) * this.config.particles.speed,
            z: (Math.random() - 0.5) * this.config.particles.speed
        }));
    }
    
    /**
     * Reduce memory usage
     */
    reduceMemoryUsage() {
        console.log('Applying memory reduction measures...');
        
        // Reduce particles
        if (this.particles.length > 0) {
            const particleSystem = this.particles[0];
            const currentCount = particleSystem.geometry.attributes.position.count;
            const targetCount = Math.max(200, Math.floor(currentCount * 0.5));
            
            if (targetCount < currentCount) {
                this.adjustParticleCount(targetCount);
            }
        }
        
        // Remove some cubes
        if (this.cubes.length > 8) {
            const cubesToRemove = this.cubes.splice(8);
            cubesToRemove.forEach(cube => {
                this.scene.remove(cube);
                this.disposeObject(cube);
            });
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear renderer caches
        this.renderer.dispose();
        
        console.log('Memory reduction completed');
    }
    
    /**
     * Auto cleanup of unused resources
     */
    autoCleanup() {
        this.performance.cleanupCount++;
        this.performance.lastCleanup = Date.now();
        
        // Dispose of unused geometries and materials
        this.cleanupUnusedResources();
        
        // Clear Three.js internal caches
        if (THREE.Cache) {
            THREE.Cache.clear();
        }
        
        // Log cleanup
        console.log(`Auto cleanup #${this.performance.cleanupCount} completed`);
    }
    
    /**
     * Cleanup unused resources
     */
    cleanupUnusedResources() {
        // Clean up geometries
        const resourceCounts = {
            geometries: 0,
            materials: 0,
            textures: 0
        };
        
        // Traverse scene and dispose of unused resources
        this.scene.traverse((object) => {
            if (object.geometry && object.geometry.userData?.canDispose) {
                if (object.geometry.boundingSphere === null) {
                    object.geometry.dispose();
                    resourceCounts.geometries++;
                }
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                        resourceCounts.materials++;
                    });
                } else {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                    resourceCounts.materials++;
                }
            }
        });
        
        // Log cleanup results
        if (Object.values(resourceCounts).some(count => count > 0)) {
            console.log(`Cleanup - Geometries: ${resourceCounts.geometries}, Materials: ${resourceCounts.materials}`);
        }
    }
    
    /**
     * Dispose of an object and its resources
     */
    disposeObject(object) {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        if (object.texture) object.texture.dispose();
    }
    
    // ============================================================================
    // PUBLIC METHODS - ENHANCED
    // ============================================================================
    
    /**
     * Pause animation
     */
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            
            // Dispatch event
            const event = new CustomEvent('threejs:animation:paused');
            window.dispatchEvent(event);
        }
    }
    
    /**
     * Resume animation
     */
    resumeAnimation() {
        if (!this.animationId && this.config.animation.enabled) {
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame((time) => this.animate(time));
            
            // Dispatch event
            const event = new CustomEvent('threejs:animation:resumed');
            window.dispatchEvent(event);
        }
    }
    
    /**
     * Toggle performance mode
     */
    togglePerformanceMode() {
        this.config.performance.lowPowerMode = !this.config.performance.lowPowerMode;
        
        if (this.config.performance.lowPowerMode) {
            // Enable low power mode
            this.enableLowPowerMode();
        } else {
            // Disable low power mode
            this.disableLowPowerMode();
        }
    }
    
    /**
     * Enable low power mode
     */
    enableLowPowerMode() {
        console.log('Enabling low power mode...');
        
        // Reduce quality settings
        this.renderer.setPixelRatio(1);
        this.config.particles.count = 300;
        this.config.cubes.count = 8;
        this.config.animation.bloomEffect = false;
        
        // Disable shadows
        this.config.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.enabled = false;
        
        // Recreate scene
        this.recreateSceneWithCurrentConfig();
        
        // Dispatch event
        const event = new CustomEvent('threejs:mode:lowpower');
        window.dispatchEvent(event);
    }
    
    /**
     * Disable low power mode
     */
    disableLowPowerMode() {
        console.log('Disabling low power mode...');
        
        // Restore quality settings
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.config.particles.count = THREE_SCENE_CONFIG.particles.count;
        this.config.cubes.count = THREE_SCENE_CONFIG.cubes.count;
        this.config.animation.bloomEffect = THREE_SCENE_CONFIG.animation.bloomEffect;
        
        // Enable shadows
        this.config.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.enabled = true;
        
        // Recreate scene
        this.recreateSceneWithCurrentConfig();
        
        // Dispatch event
        const event = new CustomEvent('threejs:mode:normal');
        window.dispatchEvent(event);
    }
    
    /**
     * Toggle bloom effect
     */
    toggleBloomEffect() {
        this.config.animation.bloomEffect = !this.config.animation.bloomEffect;
        
        if (this.config.animation.bloomEffect) {
            this.createEffects();
            console.log('Bloom effect enabled');
        } else {
            if (this.composer) {
                this.composer = null;
                this.effects = {};
            }
            console.log('Bloom effect disabled');
        }
    }
    
    /**
     * Reset scene to initial state
     */
    resetScene() {
        console.log('Resetting scene...');
        
        // Cleanup current scene
        this.cleanup();
        
        // Reset configuration
        this.config = { ...THREE_SCENE_CONFIG };
        
        // Reinitialize
        this.init();
        
        // Dispatch event
        const event = new CustomEvent('threejs:scene:reset');
        window.dispatchEvent(event);
    }
    
    /**
     * Recreate scene with current configuration
     */
    recreateSceneWithCurrentConfig() {
        // Clear existing scene
        this.cleanupSceneObjects();
        
        // Recreate scene elements
        this.createLighting();
        this.createParticles();
        this.createFloatingCubes();
        
        // Recreate effects if needed
        if (this.config.animation.bloomEffect) {
            this.createEffects();
        }
        
        console.log('Scene recreated with current configuration');
    }
    
    /**
     * Cleanup scene objects
     */
    cleanupSceneObjects() {
        // Remove all objects from scene
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
            this.scene.remove(object);
            this.disposeObject(object);
        }
        
        // Clear arrays
        this.particles = [];
        this.cubes = [];
        this.lights = [];
        this.effects = {};
    }
    
    /**
     * Handle initialization error
     */
    handleInitError(error) {
        console.error('Three.js initialization error:', error);
        this.errors.push(error);
        
        // Create error display
        const errorDisplay = this.createErrorDisplay(error);
        
        // Dispatch error event
        const event = new CustomEvent('threejs:error', { 
            detail: { error, timestamp: Date.now() } 
        });
        window.dispatchEvent(event);
        
        return errorDisplay;
    }
    
    /**
     * Handle render error
     */
    handleRenderError(error) {
        console.error('Render error:', error);
        
        // Try to recover
        try {
            this.renderer.forceContextLoss();
            this.renderer.context = null;
            this.renderer.domElement = null;
            
            // Recreate renderer
            this.createRenderer();
        } catch (recoveryError) {
            console.error('Failed to recover from render error:', recoveryError);
            this.createCanvasFallback();
        }
    }
    
    /**
     * Create error display
     */
    createErrorDisplay(error) {
        const container = document.getElementById('threejs-container');
        if (!container) return null;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'threejs-error-display';
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #ff4757;
            padding: 20px;
            background: rgba(5, 5, 16, 0.95);
            border-radius: 10px;
            border: 2px solid #ff4757;
            max-width: 400px;
            z-index: 1000;
        `;
        
        errorDiv.innerHTML = `
            <div style="margin-bottom: 15px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #ff4757;"></i>
            </div>
            <h3 style="margin: 0 0 10px 0; color: #ff4757;">3D Visualization Error</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #8a8aa3;">
                ${error.message || 'Unknown error occurred'}
            </p>
            <p style="font-size: 12px; color: #4a4a6a; margin: 0;">
                Note: Encryption/Decryption functions are unaffected and continue to work normally.
            </p>
        `;
        
        container.appendChild(errorDiv);
        return errorDiv;
    }
    
    /**
     * Get scene statistics
     */
    getStatistics() {
        return {
            fps: this.fps,
            objects: {
                particles: this.particles.reduce((sum, ps) => sum + ps.geometry.attributes.position.count, 0),
                cubes: this.cubes.length,
                lights: this.lights.length,
                total: this.scene.children.length
            },
            performance: {
                avgFrameTime: this.performance.frameTimes.length > 0 ? 
                    this.performance.frameTimes.reduce((a, b) => a + b, 0) / this.performance.frameTimes.length : 0,
                memoryUsage: this.performance.memoryUsage.length > 0 ? 
                    this.performance.memoryUsage[this.performance.memoryUsage.length - 1] : null,
                errors: this.errors.length,
                cleanupCount: this.performance.cleanupCount
            },
            config: {
                particleCount: this.config.particles.count,
                cubeCount: this.config.cubes.count,
                bloomEnabled: this.config.animation.bloomEffect,
                lowPowerMode: this.config.performance.lowPowerMode,
                adaptiveQuality: this.config.performance.adaptiveQuality
            }
        };
    }
    
    /**
     * Log statistics
     */
    logStatistics() {
        const stats = this.getStatistics();
        console.group('Three.js Scene Statistics');
        console.log('FPS:', stats.fps);
        console.log('Objects:', stats.objects);
        console.log('Performance:', stats.performance);
        console.log('Configuration:', stats.config);
        console.groupEnd();
    }
    
    /**
     * Cleanup all resources
     */
    cleanup() {
        console.log('Cleaning up Three.js scene...');
        
        // Stop animation
        this.pauseAnimation();
        
        // Clear intervals
        clearInterval(this.performance.monitorInterval);
        clearInterval(this.performance.cleanupInterval);
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.onWindowResize());
        window.removeEventListener('mousemove', (e) => this.onMouseMove(e));
        window.removeEventListener('mouseleave', () => this.onMouseLeave());
        document.removeEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Cleanup scene objects
        this.cleanupSceneObjects();
        
        // Dispose Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            
            // Remove from DOM
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        // Dispose controls
        if (this.controls) {
            this.controls.dispose();
        }
        
        // Dispose effects
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        console.log('Three.js scene cleanup complete');
    }
}

// ============================================================================
// GLOBAL INITIALIZATION WITH ERROR HANDLING
// ============================================================================

// Global instance
let ThreeScene = null;

/**
 * Initialize Three.js scene with security optimizations
 */
function initThreeJS() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js library not loaded. 3D visualization disabled.');
        return null;
    }
    
    try {
        // Check if already initialized
        if (ThreeScene) {
            console.warn('Three.js scene already initialized');
            return ThreeScene;
        }
        
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            console.warn('WebGL not supported. 3D visualization disabled.');
            return null;
        }
        
        // Create scene manager
        ThreeScene = new ThreeSceneManager();
        console.log('Three.js scene initialized for CipherVault Security');
        
        // Dispatch initialization event
        const event = new CustomEvent('threejs:initialized', { 
            detail: { timestamp: Date.now(), version: '4.2.0' } 
        });
        window.dispatchEvent(event);
        
        return ThreeScene;
        
    } catch (error) {
        console.error('Failed to initialize Three.js scene:', error);
        
        // Create fallback visualization
        createThreeJSFallback();
        
        return null;
    }
}

/**
 * Create Three.js fallback visualization
 */
function createThreeJSFallback() {
    const container = document.getElementById('threejs-container');
    if (!container) return;
    
    // Create simple CSS-based visualization
    container.innerHTML = `
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #050510 0%, #0a1a2a 50%, #050510 100%);
            overflow: hidden;
        ">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
                animation: pulse 4s ease-in-out infinite;
            "></div>
        </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Created Three.js fallback visualization');
}

/**
 * Get Three.js scene instance
 */
function getThreeScene() {
    return ThreeScene;
}

/**
 * Cleanup Three.js scene
 */
function cleanupThreeJS() {
    if (ThreeScene) {
        ThreeScene.cleanup();
        ThreeScene = null;
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.initThreeJS = initThreeJS;
    window.getThreeScene = getThreeScene;
    window.cleanupThreeJS = cleanupThreeJS;
    window.ThreeSceneManager = ThreeSceneManager;
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThreeSceneManager,
        initThreeJS,
        getThreeScene,
        cleanupThreeJS,
        THREE_SCENE_CONFIG
    };
}

// Auto-initialize if in browser and Three.js is loaded
if (typeof window !== 'undefined' && typeof THREE !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initThreeJS, 1000); // Delay initialization
        });
    } else {
        setTimeout(initThreeJS, 1000);
    }
}
