
import * as THREE from "three";

import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";

import gsap from "gsap";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            45,
            this.width / this.height,
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, 520); 
        this.camera.lookAt(0, 0, 0);
        
        this.time = 0;
        this.isPlaying = true;
        this.isModelLoaded = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0);
        this.intersects = [];
        this.ifClicked = false;

        this.addObjects();
        this.addModel();
        this.setupButton();
        this.resize();
        this.mousefun();
        this.setupResize();
    }

    addModel() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        let that = this;
        this.loader.load(
            "/models/beyonce.glb",
            function(gltf) {
                const model = gltf.scene;
                
                let geo = new THREE.BufferGeometry();
                let pos = model.children[0].geometry.attributes.position.array;

                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.computeBoundingBox();

                that.pointsMesh = new THREE.Points(geo, that.material);
                that.scene.add(that.pointsMesh);
                that.isModelLoaded = true;

                that.render(); // Start rendering
            },
            undefined,
            function(e) {
                console.error("Model loading error:", e);
            }
        );
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                mousePos: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
                isMouseOver: { type: "f", value: 0.0 },
                progress: { type: "f", value: 0.0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: { value: new THREE.Vector2(1, 1) },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometry = new THREE.PlaneGeometry(200, 410);
        this.plainMaterial = new THREE.MeshBasicMaterial({
            color: "red", 
            wireframe: true, 
            visible: false
        });
        this.plain = new THREE.Mesh(this.geometry, this.plainMaterial);
        this.scene.add(this.plain);
    }

    landingAnimation(domElem) {
        let domElemVar = domElem.textContent;
        let domElemHeight = domElem.offsetHeight;
        let splittedText = domElemVar.split("");
        let clutter = "";  
        splittedText.forEach(function(element, index) {
            clutter += `<span class="element">${element}</span>`;
        });
        domElem.innerHTML = clutter

        gsap.to(".element", {
            y: domElemHeight,
            duration: 1,
            stagger: 0.14285,
            ease: "expoScale(0.5,7,none)", 
        })
   
    }

    cornerAnimation() {
        let corner1 = document.querySelector("#cornor1")
        let corner2 = document.querySelector("#cornor2")
        let corner3 = document.querySelector("#cornor3")
        let corner4 = document.querySelector("#cornor4")
        gsap.to(corner1, {
            top: "1.25rem",
            left: "1rem",
            width: "2rem",
            height: "2rem",
            duration:1
        })
        gsap.to(corner2, {
            top: "1.25rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            duration:1
        })
        gsap.to(corner3, {
            bottom: "1.25rem",
            left: "1rem",
            width: "2rem",
            height: "2rem",
            duration:1
        })
        gsap.to(corner4, {
            bottom: "1.25rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            duration:1
        })
    }

    setupButton() {
        this.stickButton = document.querySelector('#stickButton');
        
        this.audio = document.getElementById('effectAudio');
        
        let p = document.querySelector("#heading p")
        p.style.transform = `translateY(-${p.offsetHeight}px)`;
        
        let corner1 = document.querySelector("#cornor1")
        let corner2 = document.querySelector("#cornor2")
        let corner3 = document.querySelector("#cornor3")
        let corner4 = document.querySelector("#cornor4")
        
        let btn = document.querySelector("#stickButton")
        
        corner1.style.width = `${btn.offsetWidth}px`
        corner1.style.height = `${btn.offsetHeight}px`
        
        corner2.style.width = `${btn.offsetWidth}px`
        corner2.style.height = `${btn.offsetHeight}px`
        
        corner3.style.width = `${btn.offsetWidth}px`
        corner3.style.height = `${btn.offsetHeight}px`
        
        corner4.style.width = `${btn.offsetWidth}px`
        corner4.style.height = `${btn.offsetHeight}px`
        
        let that = this;
        
        this.stickButton.addEventListener('click', () => {
            gsap.to(this.stickButton, {
                opacity:0,
                onComplete: () => {
                    this.stickButton.style.display = "none"
                }
            })
            
            gsap.to(this.material.uniforms.progress, {
                value: 1.0,
                duration: 2,
                ease: "power2.inOut",
                onStart: () => {
                    this.audio.currentTime = 0;
                    this.audio.play();
                }
            });

            this.cornerAnimation()
            this.landingAnimation(p)
            this.ifClicked = true
        });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying && this.isModelLoaded) {
            this.render();
            this.isPlaying = true;
        }
    }

    mousefun() {
        let that = this;

        function onMouseMove(event) {
            that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        
        function onTouchMove(event) {
            event.preventDefault();
            if (event.touches.length > 0) {
                that.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                that.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
                console.log("Touch moved:", that.mouse.x, that.mouse.y);
            }
        }
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
    }

    render() {
        if (!this.isPlaying || !this.isModelLoaded) return;
        this.time += 0.01;

        if (this.pointsMesh && this.ifClicked) {
            this.pointsMesh.rotation.y += 0.00375;
        }
        this.material.uniforms.time.value = this.time;
       
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.intersects = this.raycaster.intersectObjects([this.plain]);
        if (this.intersects.length > 0) {
            this.material.uniforms.mousePos.value = this.intersects[0].point;
            this.material.uniforms.isMouseOver.value = 1.0;
        } else {
            this.material.uniforms.mousePos.value = new THREE.Vector3(0,0,0);
            this.material.uniforms.isMouseOver.value = 0.0;
        }
     
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });

document.addEventListener('DOMContentLoaded', () => {
    gsap.set('.cursor', { xPercent: -50, yPercent: -50 });

    const cursor = document.querySelector('.cursor');

    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power2.out' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power2.out' });

    window.addEventListener('mousemove', (e) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        cursorX(e.touches[0].clientX);
        cursorY(e.touches[0].clientY);
    });

    new Sketch({
        dom: document.querySelector(".canvas"),
    });
});