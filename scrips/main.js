if (typeof lucide !== 'undefined') lucide.createIcons();
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsapBeanMotion = typeof gsap !== 'undefined' && !prefersReducedMotion;

        // Photorealistic Three.js Coffee Bean Simulation
        (function initRealCoffeeBeans3D() {
            const container = document.getElementById('hero-canvas-container');
            if (!container) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0, 0, 14);

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
            container.appendChild(renderer.domElement);
            scene.fog = new THREE.FogExp2(0x0b0705, 0.008);

            // High Quality Cinematic Lighting for Realistic Coffee Texture Specular Highlights
            const ambientLight = new THREE.AmbientLight(0xffecd6, 0.8);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
            keyLight.position.set(8, 12, 10);
            keyLight.castShadow = true;
            scene.add(keyLight);

            const fillLight = new THREE.PointLight(0xc88d51, 3.5, 25);
            fillLight.position.set(-8, -4, 6);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0xd4af37, 2.0);
            rimLight.position.set(-5, 8, -8);
            scene.add(rimLight);

            // Procedural Bump & Gloss Texture Canvas for Coffee Beans
            function generateCoffeeTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                // Rich dark roast base gradient
                const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
                grad.addColorStop(0, '#3e2213');
                grad.addColorStop(0.5, '#261309');
                grad.addColorStop(1, '#150904');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 512, 512);

                // Organic roasted pore texture noise
                for (let i = 0; i < 8000; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    const radius = Math.random() * 1.5;
                    const opacity = Math.random() * 0.15;
                    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity * 1.5})`;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Center crease detail on texture
                ctx.strokeStyle = '#0a0402';
                ctx.lineWidth = 14;
                ctx.beginPath();
                ctx.moveTo(256, 40);
                ctx.bezierCurveTo(280, 180, 230, 330, 256, 472);
                ctx.stroke();

                ctx.strokeStyle = '#5a3821';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(258, 42);
                ctx.bezierCurveTo(282, 182, 232, 332, 258, 470);
                ctx.stroke();

                return new THREE.CanvasTexture(canvas);
            }

            const coffeeTexture = generateCoffeeTexture();

            // Photorealistic Coffee Bean Custom Geometry
            function createCoffeeBeanGeometry() {
                const geom = new THREE.SphereGeometry(1, 32, 32);
                geom.scale(0.7, 1.15, 0.52);

                const pos = geom.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    let x = pos.getX(i);
                    let y = pos.getY(i);
                    let z = pos.getZ(i);

                    // Organic bean asymmetry and center groove indent
                    const indent = Math.exp(-Math.pow(x * 3.2, 2)) * 0.28;
                    if (z > 0) {
                        z -= indent;
                    } else {
                        z += indent * 0.3;
                    }

                    // Slight subtle surface organic noise deformation
                    x += (Math.random() - 0.5) * 0.03;
                    y += (Math.random() - 0.5) * 0.03;

                    pos.setXYZ(i, x, y, z);
                }
                geom.computeVertexNormals();
                return geom;
            }

            const beanGeometry = createCoffeeBeanGeometry();
            
            // Material with Roasted Oil Sheen and Natural Gloss
            const beanMaterial = new THREE.MeshPhysicalMaterial({
                map: coffeeTexture,
                roughness: 0.32,
                metalness: 0.02,
                bumpMap: coffeeTexture,
                bumpScale: 0.075,
                clearcoat: 0.4,
                clearcoatRoughness: 0.28
            });

            // Instantiate dynamic beans around hero layout
            const beans = [];
            const beanCount = window.innerWidth < 768 ? 16 : 32;
            const beanColors = [0x59321f, 0x714127, 0x8a512f, 0x9a6036];
            const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            const viewWidth = viewHeight * camera.aspect;

            for (let i = 0; i < beanCount; i++) {
                const depth = -6 + Math.random() * 9;
                const depthFactor = THREE.MathUtils.clamp((depth + 6) / 9, 0, 1);
                const scale = 0.4 + Math.random() * 0.45 + depthFactor * 0.5;
                const material = beanMaterial.clone();
                material.color.setHex(beanColors[Math.floor(Math.random() * beanColors.length)]);
                material.roughness = 0.24 + Math.random() * 0.2;
                if (depth < -2) {
                    material.transparent = true;
                    material.opacity = 0.52 + Math.random() * 0.2;
                    material.depthWrite = false;
                }

                const mesh = new THREE.Mesh(beanGeometry, material);
                mesh.scale.set(scale * 0.7, scale * 1.15, scale * 0.52);

                const orbitRadiusX = viewWidth * (0.12 + Math.random() * 0.22);
                const orbitRadiusY = viewHeight * (0.18 + Math.random() * 0.25);
                const orbitPhase = Math.random() * Math.PI * 2;
                const flowCenterX = (Math.random() - 0.5) * viewWidth * 0.08;
                const flowCenterY = (Math.random() - 0.5) * viewHeight * 0.08;
                mesh.position.set(
                    flowCenterX + Math.cos(orbitPhase) * orbitRadiusX,
                    flowCenterY + Math.sin(orbitPhase) * orbitRadiusY,
                    depth
                );

                const initialRotation = {
                    x: Math.random() * Math.PI * 2,
                    y: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI * 2
                };
                mesh.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);

                mesh.userData = {
                    orbitRadiusX,
                    orbitRadiusY,
                    orbitPhase,
                    motionPhase: 0,
                    orbitDuration: Math.random() < 0.2 ? 8 + Math.random() * 5 : 16 + Math.random() * 20,
                    direction: Math.random() < 0.5 ? -1 : 1,
                    weavePhase: Math.random() * Math.PI * 2,
                    weaveWidth: viewWidth * (0.008 + Math.random() * 0.018),
                    floatAmplitude: viewHeight * (0.01 + Math.random() * 0.02),
                    depthAmplitude: 0.25 + depthFactor * 0.5,
                    parallaxFactor: 0.35 + depthFactor * 0.9,
                    flowCenterX,
                    flowCenterY,
                    initialZ: depth,
                    initialRotation
                };

                scene.add(mesh);
                beans.push(mesh);
            }

            const dustCount = window.innerWidth < 768 ? 55 : 110;
            const dustPositions = new Float32Array(dustCount * 3);
            const dustSpeeds = [];

            for (let i = 0; i < dustCount; i++) {
                dustPositions[i * 3] = (Math.random() - 0.5) * 20;
                dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
                dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
                dustSpeeds.push(0.003 + Math.random() * 0.006);
            }

            const dustGeometry = new THREE.BufferGeometry();
            dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
            const dustMaterial = new THREE.PointsMaterial({
                color: 0xe7bd7c,
                size: window.innerWidth < 768 ? 0.055 : 0.045,
                transparent: true,
                opacity: 0.58,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            scene.add(new THREE.Points(dustGeometry, dustMaterial));

            // Interactive mouse movement physics
            let mouseX = 0;
            let mouseY = 0;
            let targetX = 0;
            let targetY = 0;

            window.addEventListener('pointermove', (e) => {
                mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            function updateBeanMotion(bean) {
                const data = bean.userData;
                const angle = data.motionPhase * data.direction + data.orbitPhase;
                const weave = Math.sin(angle * 2 + data.weavePhase);

                bean.position.x = data.flowCenterX + Math.cos(angle) * data.orbitRadiusX + weave * data.weaveWidth + targetX * data.parallaxFactor;
                bean.position.y = data.flowCenterY + Math.sin(angle) * data.orbitRadiusY + weave * data.floatAmplitude + targetY * data.parallaxFactor * 0.45;
                bean.position.z = data.initialZ + Math.sin(angle) * data.depthAmplitude;
                bean.rotation.x = data.initialRotation.x + Math.sin(angle * 2) * 0.18;
                bean.rotation.y = data.initialRotation.y + data.motionPhase * data.direction;
                bean.rotation.z = data.initialRotation.z + Math.cos(angle * 2) * 0.14;
            }

            beans.forEach(bean => {
                updateBeanMotion(bean);
                if (hasGsapBeanMotion) {
                    gsap.to(bean.userData, {
                        motionPhase: Math.PI * 2,
                        duration: bean.userData.orbitDuration,
                        ease: 'none',
                        repeat: -1,
                        onUpdate: () => updateBeanMotion(bean)
                    });
                }
            });

            // Smooth resize handler
            window.addEventListener('resize', () => {
                if (!container) return;
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });

            // Animation Loop
            const clock = new THREE.Clock();
            let animationFrameId;

            function animate() {
                if (document.hidden) return;
                animationFrameId = requestAnimationFrame(animate);
                const elapsedTime = clock.getElapsedTime();

                targetX += (mouseX - targetX) * 0.05;
                targetY += (mouseY - targetY) * 0.05;

                if (!hasGsapBeanMotion && !prefersReducedMotion) {
                    beans.forEach(bean => {
                        bean.userData.motionPhase = elapsedTime / bean.userData.orbitDuration * Math.PI * 2;
                        updateBeanMotion(bean);
                    });
                }

                for (let i = 0; i < dustCount; i++) {
                    const yIndex = i * 3 + 1;
                    dustPositions[yIndex] += dustSpeeds[i];
                    dustPositions[i * 3] += Math.sin(elapsedTime * 0.35 + i) * 0.0015;

                    if (dustPositions[yIndex] > 7) {
                        dustPositions[yIndex] = -7;
                        dustPositions[i * 3] = (Math.random() - 0.5) * 20;
                    }
                }
                dustGeometry.attributes.position.needsUpdate = true;

                fillLight.position.x = -8 + targetX * 1.4;
                fillLight.intensity = 3.2 + Math.sin(elapsedTime * 0.7) * 0.45;
                camera.position.x = targetX * 0.9;
                camera.position.y = -targetY * 0.7;
                camera.lookAt(0, 0, 0);

                renderer.render(scene, camera);
            }

            if (prefersReducedMotion) {
                renderer.render(scene, camera);
            } else {
                animate();
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        cancelAnimationFrame(animationFrameId);
                    } else {
                        animate();
                    }
                });
            }
        })();


        /* =========================================================================
           1. CUSTOM CURSOR & MOUSE TRACKING
           ========================================================================= */
        const cursorDot = document.getElementById('cursorDot');
        const cursorOutline = document.getElementById('cursorOutline');

        if (window.innerWidth >= 1024 && cursorDot && cursorOutline) {
            window.addEventListener('mousemove', (e) => {
                const posX = e.clientX;
                const posY = e.clientY;

                if (cursorDot) {
                    cursorDot.style.left = `${posX}px`;
                    cursorDot.style.top = `${posY}px`;
                }

                if (cursorOutline && cursorOutline.animate) {
                    cursorOutline.animate({
                        left: `${posX}px`,
                        top: `${posY}px`
                    }, { duration: 500, fill: "forwards" });
                }
            });

            // Scale cursor on hover interactive elements
            const interactables = document.querySelectorAll('a, button, input, .product-card');
            interactables.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (cursorOutline) {
                        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.8)';
                        cursorOutline.style.borderColor = '#D4AF37';
                        cursorOutline.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                    }
                });
                el.addEventListener('mouseleave', () => {
                    if (cursorOutline) {
                        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                        cursorOutline.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                        cursorOutline.style.backgroundColor = 'transparent';
                    }
                });
            });
        }

        /* =========================================================================
           2. HEADER NAVBAR SCROLL EFFECT
           ========================================================================= */
        const mainHeader = document.getElementById('mainHeader');
        if (mainHeader) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('glass-nav', 'py-4');
                    mainHeader.classList.remove('py-6');
                } else {
                    mainHeader.classList.remove('glass-nav', 'py-4');
                    mainHeader.classList.add('py-6');
                }
            });
        }

        // Mobile Navigation Toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            document.querySelectorAll('.mobile-link').forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
            });
        }

        /* =========================================================================
           3. THREE.JS 3D FALLING COFFEE BEANS ENGINE (MULTIPLE DEPTH LAYERS)
           ========================================================================= */
        const container3D = document.getElementById('threeCanvasContainer');
        if (container3D) {
            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 15;

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container3D.appendChild(renderer.domElement);

            // Warm Ambient Lights for Realism
            const ambientLight = new THREE.AmbientLight(0xfff0dd, 1.2);
            scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0xd4af37, 2.5, 50);
            pointLight1.position.set(10, 15, 10);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0xc59b27, 1.5, 40);
            pointLight2.position.set(-10, -10, 5);
            scene.add(pointLight2);

            // Procedural Coffee Bean Geometry Creation
            function createCoffeeBeanMesh() {
                const group = new THREE.Group();

                const beanGeo = new THREE.SphereGeometry(0.5, 16, 16);
                beanGeo.scale(1, 1.4, 0.6);

                const beanMat = new THREE.MeshStandardMaterial({
                    color: 0x2A160E,
                    roughness: 0.4,
                    metalness: 0.1,
                });

                const mainMesh = new THREE.Mesh(beanGeo, beanMat);
                group.add(mainMesh);

                const creaseGeo = new THREE.BoxGeometry(0.08, 1.3, 0.3);
                const creaseMat = new THREE.MeshBasicMaterial({ color: 0x120A07 });
                const creaseMesh = new THREE.Mesh(creaseGeo, creaseMat);
                creaseMesh.position.z = 0.25;
                group.add(creaseMesh);

                return group;
            }

            const beans = [];
            const beanCount = window.innerWidth < 768 ? 25 : 60;

            for (let i = 0; i < beanCount; i++) {
                const bean = createCoffeeBeanMesh();
                const depthLayer = Math.random();
                let zPos = 0;
                let scale = 1;

                if (depthLayer < 0.33) {
                    zPos = -10 + Math.random() * 5;
                    scale = 0.4 + Math.random() * 0.3;
                } else if (depthLayer < 0.66) {
                    zPos = -2 + Math.random() * 4;
                    scale = 0.8 + Math.random() * 0.4;
                } else {
                    zPos = 4 + Math.random() * 5;
                    scale = 1.2 + Math.random() * 0.6;
                }

                bean.position.set(
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 30,
                    zPos
                );

                bean.scale.set(scale, scale, scale);

                bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                bean.userData = {
                    rotSpeedX: (Math.random() - 0.5) * 0.02,
                    rotSpeedY: (Math.random() - 0.5) * 0.02,
                    fallSpeed: 0.01 + Math.random() * 0.025,
                    initialY: bean.position.y
                };

                scene.add(bean);
                beans.push(bean);
            }

            function animateBeans() {
                requestAnimationFrame(animateBeans);

                beans.forEach(bean => {
                    bean.rotation.x += bean.userData.rotSpeedX;
                    bean.rotation.y += bean.userData.rotSpeedY;

                    bean.position.y -= bean.userData.fallSpeed;

                    if (bean.position.y < -15) {
                        bean.position.y = 15;
                        bean.position.x = (Math.random() - 0.5) * 30;
                    }
                });

                renderer.render(scene, camera);
            }
            animateBeans();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        /* =========================================================================
           4. HERO COFFEE STEAM CANVAS SHADER/PARTICLE SYSTEM
           ========================================================================= */
        const steamCanvas = document.getElementById('steamCanvas');
        if (steamCanvas && steamCanvas.getContext) {
            const ctx = steamCanvas.getContext('2d');

            function resizeSteamCanvas() {
                if (!steamCanvas.parentElement) return;
                steamCanvas.width = steamCanvas.parentElement.clientWidth;
                steamCanvas.height = steamCanvas.parentElement.clientHeight;
            }
            resizeSteamCanvas();
            window.addEventListener('resize', resizeSteamCanvas);

            const steamParticles = [];
            const particleCount = 35;

            for (let i = 0; i < particleCount; i++) {
                steamParticles.push({
                    x: steamCanvas.width / 2 + (Math.random() - 0.5) * 40,
                    y: steamCanvas.height / 2 + 20 + Math.random() * 50,
                    radius: 15 + Math.random() * 25,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: -0.8 - Math.random() * 0.8,
                    alpha: 0.01 + Math.random() * 0.15,
                    maxAlpha: 0.12 + Math.random() * 0.08
                });
            }

            function drawSteam() {
                ctx.clearRect(0, 0, steamCanvas.width, steamCanvas.height);

                steamParticles.forEach(p => {
                    p.x += p.vx + Math.sin(p.y * 0.02) * 0.3;
                    p.y += p.vy;
                    p.radius += 0.3;

                    if (p.y < steamCanvas.height / 2 - 120) {
                        p.alpha -= 0.003;
                    }

                    if (p.alpha <= 0 || p.y < 0) {
                        p.x = steamCanvas.width / 2 + (Math.random() - 0.5) * 40;
                        p.y = steamCanvas.height / 2 + 20;
                        p.radius = 15 + Math.random() * 20;
                        p.alpha = 0.01;
                    }

                    ctx.beginPath();
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                    gradient.addColorStop(0, `rgba(245, 240, 235, ${p.alpha})`);
                    gradient.addColorStop(0.5, `rgba(212, 175, 55, ${p.alpha * 0.3})`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                });

                requestAnimationFrame(drawSteam);
            }
            drawSteam();
        }

        const processCards = Array.from(document.querySelectorAll('.process-step-card'));

        if (processCards.length) {
            const revealProcessCard = (card, index) => {
                card.classList.add('is-visible');
                const startFloating = () => card.classList.add('is-floating');

                if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                    card.classList.add('gsap-card-entrance-active');
                    gsap.fromTo(card,
                        { autoAlpha: 0, y: 52, rotateX: 8, scale: 0.96, transformPerspective: 900 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            rotateX: 0,
                            scale: 1,
                            duration: 0.95,
                            delay: index * 0.14,
                            ease: 'power3.out',
                            onComplete: () => {
                                card.classList.remove('gsap-card-entrance-active');
                                card.classList.add('gsap-card-entrance-done');
                                startFloating();
                            }
                        }
                    );
                } else {
                    window.setTimeout(startFloating, 900 + index * 120);
                }
            };

            if ('IntersectionObserver' in window) {
                const processCardObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        processCardObserver.unobserve(entry.target);
                        revealProcessCard(entry.target, processCards.indexOf(entry.target));
                    });
                }, { threshold: 0.18 });

                processCards.forEach(card => processCardObserver.observe(card));
            } else {
                processCards.forEach(revealProcessCard);
            }
        }

        /* =========================================================================
           5. GSAP & SCROLLTRIGGER ANIMATIONS
           ========================================================================= */
        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
            if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

            const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            heroTl.from('#heroSubtitle', { autoAlpha: 0, y: 18, duration: 0.65 })
                .from('#heroTitle', { autoAlpha: 0, y: 32, duration: 0.9 }, '-=0.35')
                .from('#heroDesc', { autoAlpha: 0, y: 22, duration: 0.7 }, '-=0.5')
                .from('#heroButtons', { autoAlpha: 0, y: 18, duration: 0.65 }, '-=0.4')
                .from('#hero .max-w-md', { autoAlpha: 0, scale: 0.94, y: 24, duration: 1.1 }, '-=0.8')
                .from('#hero .grid.grid-cols-3 > div', { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.1 }, '-=0.35');

            if (hasScrollTrigger) {
                gsap.from('#historia h2, #historia p, #historia .glass-card', {
                    autoAlpha: 0,
                    y: 28,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#historia .grid', start: 'top 72%', once: true }
                });
                gsap.from('#storyImageWrapper', {
                    autoAlpha: 0,
                    x: 36,
                    scale: 0.97,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#storyImageWrapper', start: 'top 78%', once: true }
                });
                gsap.to('#storyImageWrapper img', {
                    yPercent: -5,
                    ease: 'none',
                    scrollTrigger: { trigger: '#historia', start: 'top bottom', end: 'bottom top', scrub: 1 }
                });
                gsap.from('#produtos .text-center > *', {
                    autoAlpha: 0,
                    y: 22,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#produtos', start: 'top 76%', once: true }
                });
                gsap.from('.product-card', {
                    autoAlpha: 0,
                    y: 42,
                    rotateX: 5,
                    transformPerspective: 900,
                    stagger: 0.13,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#produtos .product-card', start: 'top 82%', once: true }
                });
                gsap.to('#processProgressLine', {
                    width: '100%',
                    ease: 'none',
                    scrollTrigger: { trigger: '#processo', start: 'top 60%', end: 'bottom 80%', scrub: 1 }
                });
                gsap.fromTo('.reveal-clip',
                    { clipPath: 'inset(0 100% 0 0)' },
                    {
                        clipPath: 'inset(0 0% 0 0)',
                        stagger: 0.14,
                        duration: 1,
                        ease: 'power3.inOut',
                        scrollTrigger: { trigger: '#processo .grid', start: 'top 76%', once: true }
                    }
                );
                gsap.from('#depoimentos .testimonial-slide, #depoimentos .testimonial-dot', {
                    autoAlpha: 0,
                    y: 20,
                    stagger: 0.1,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#depoimentos', start: 'top 75%', once: true }
                });
                gsap.from('#cta h2, #cta p, #cta a', {
                    autoAlpha: 0,
                    y: 24,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#cta', start: 'top 72%', once: true }
                });
                gsap.to('#cta img', {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'bottom top', scrub: 1 }
                });
            }

            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('mouseenter', () => gsap.to(card, { y: -7, duration: 0.3, ease: 'power2.out' }));
                card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' }));
            });
        }

        /* =========================================================================
           6. TESTIMONIALS INTERACTIVE CAROUSEL
           ========================================================================= */
        const testimonialsData = [
            {
                quote: "Um dos melhores cafés que já experimentei. A experiência começa no aroma inebriante da embalagem e culmina no último gole aveludado da manhã.",
                author: "Mariana Almeida",
                role: "Sommelier de Vinhos & Entusiasta de Gastronomia"
            },
            {
                quote: "A torra artesanal do Café BH é impecável. As notas de caramelo e chocolate amargo no Café Intenso são notáveis. Virou item indispensável no meu escritório.",
                author: "Carlos Eduardo Costa",
                role: "Arquiteto & Cliente Assíduo"
            },
            {
                quote: "Atendimento exclusivo e entrega ultra rápida. Receber os grãos recém-torrados em casa é um luxo que transforma nossa rotina familiar.",
                author: "Beatriz Nogueira",
                role: "Designer Interiores"
            }
        ];

        let currentTestimonial = 0;
        const testimonialContainer = document.getElementById('testimonialContainer');
        const dots = document.querySelectorAll('.testimonial-dot');

        function updateTestimonial(index) {
            if (!testimonialContainer) return;
            currentTestimonial = index;
            const data = testimonialsData[index];

            const renderTestimonial = () => {
                testimonialContainer.innerHTML = `
                    <div class="testimonial-slide space-y-6 max-w-3xl">
                        <p class="font-serif text-xl sm:text-2xl md:text-3xl text-cream-50 font-light leading-relaxed">
                            "${data.quote}"
                        </p>
                        <div>
                            <h4 class="font-semibold text-amber-gold text-sm tracking-widest uppercase">${data.author}</h4>
                            <span class="text-xs text-cream-300/50">${data.role}</span>
                        </div>
                    </div>
                `;
            };

            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(testimonialContainer, {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    onComplete: () => {
                        renderTestimonial();
                        gsap.fromTo(testimonialContainer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
                    }
                });
            } else {
                renderTestimonial();
            }

            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('bg-amber-gold', 'w-3', 'h-3');
                    dot.classList.remove('bg-coffee-800', 'w-2', 'h-2');
                } else {
                    dot.classList.remove('bg-amber-gold', 'w-3', 'h-3');
                    dot.classList.add('bg-coffee-800', 'w-2', 'h-2');
                }
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                updateTestimonial(index);
            });
        });

        // Auto rotate testimonials
        setInterval(() => {
            if (dots.length > 0) {
                let next = (currentTestimonial + 1) % testimonialsData.length;
                updateTestimonial(next);
            }
        }, 6000);

        /* =========================================================================
           7. VIRTUAL PROJECT FILES MODAL VIEWER
           ========================================================================= */
        const projectModal = document.getElementById('projectModal');
        const openProjectFilesBtn = document.getElementById('openProjectFilesBtn');
        const openProjectFilesBtnMobile = document.getElementById('openProjectFilesBtnMobile');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const codeDisplayArea = document.getElementById('codeDisplayArea');
        const fileTabs = document.querySelectorAll('.file-tab');

        const virtualFiles = {
            html: `<!-- index.html (Café BH) -->\n<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <title>Café BH</title>\n  <script src="https://cdn.tailwindcss.com"><\/script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\/script>\n</head>\n<body>\n  <!-- Hero, História, Produtos e Processo -->\n</body>\n</html>`,
            css: `/* style.css */\nbody {\n  background-color: #0B0706;\n  color: #F5F0EB;\n  font-family: 'Inter', sans-serif;\n}\n\n.text-gold-gradient {\n  background: linear-gradient(135deg, #FFF0C3, #D4AF37);\n  -webkit-background-clip: text;\n}\n\n.film-grain {\n  position: fixed;\n  opacity: 0.045;\n}`,
            js: `// script.js\nimport * as THREE from 'three';\nimport { gsap } from 'gsap';\n\n// Three.js Bean Particles System\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight);\n// Animate and Render loop...`,
            readme: `# Café BH — Landing Page Premium\n\nLanding page cinematográfica e de alta performance desenvolvida para a marca de café especial **Café BH**.\n\n## Tecnologias\n- HTML5 & CSS3 (Tailwind CSS)\n- JavaScript ES6+\n- GSAP & ScrollTrigger\n- Three.js (3D Falling Beans & Lighting)\n\n## Como Executar\nAbra o arquivo \`index.html\` em qualquer navegador moderno.`
        };

        function openModal() {
            if (!projectModal || !codeDisplayArea) return;
            projectModal.classList.remove('hidden');
            projectModal.classList.add('flex');
            codeDisplayArea.textContent = virtualFiles.html;
        }

        if (openProjectFilesBtn) openProjectFilesBtn.addEventListener('click', openModal);
        if (openProjectFilesBtnMobile) openProjectFilesBtnMobile.addEventListener('click', openModal);

        if (closeModalBtn && projectModal) {
            closeModalBtn.addEventListener('click', () => {
                projectModal.classList.add('hidden');
                projectModal.classList.remove('flex');
            });
        }

        fileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                fileTabs.forEach(t => {
                    t.classList.remove('bg-amber-gold/20', 'text-amber-gold', 'border', 'border-amber-gold/30');
                    t.classList.add('text-cream-200');
                });
                tab.classList.add('bg-amber-gold/20', 'text-amber-gold', 'border', 'border-amber-gold/30');
                tab.classList.remove('text-cream-200');

                const fileKey = tab.getAttribute('data-file');
                if (codeDisplayArea && virtualFiles[fileKey]) {
                    codeDisplayArea.textContent = virtualFiles[fileKey];
                }
            });
        });
