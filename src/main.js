import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertexParticle.glsl";


import * as dat from "dat.gui";
import gsap from "gsap";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
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
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor("#111", 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.001,
            1000
        );
        this.camera.position.set(0, 0, 300);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.time = 0;
        this.isPlaying = true;
        
        this.raycaster = new THREE.Raycaster()

        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        let that = this;
        this.loader.load(
            "/models/beyonce.glb",
            function(gltf) {
                const model = gltf.scene;
                
                let geo = new THREE.BufferGeometry()
                let pos = model.children[0].geometry.attributes.position.array;

                geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
                let bBox = geo.computeBoundingBox();

                that.pointsMesh = new THREE.Points(geo, that.material);
                that.scene.add(that.pointsMesh)

            },
            undefined,
            function(e) {
                console.log(e);
            }
        );


        this.addObjects();
        this.resize();
        this.render();
        this.mouse()
        this.setupResize();
        this.settings();
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
        extensions: {
            derivatives: "#extension GL_OES_standard_derivatives : enable",
        },
        side: THREE.DoubleSide,
        uniforms: {
            time: { type: "f", value: 0 },
            mousePos: { type: "v3", value: new THREE.Vector3(0,0,0) },
            resolution: { type: "v4", value: new THREE.Vector4() },
            uvRate1: { value: new THREE.Vector2(1, 1) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        });

        this.geometry = new THREE.PlaneGeometry(200, 410);
        this.plain = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color: "red", wireframe: true, visible: true}));
        this.scene.add(this.plain);
    }

    settings() {
        this.settings = {
            howmuchrgb: 1,
        };
        this.gui = new dat.GUI();
        // this.gui.add(this.settings, "howmuchrgb", 0, 1, 0.01).onChange((value) => {
        //   this.material.uniforms.progress.value = value;
        // });
        this.gui.add(this.settings, "howmuchrgb", 0, 1, 0.01);
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
        if (!this.isPlaying) {
            this.render();
            this.isPlaying = true;
        }
    }

    mouse() {
        this.mouse = new THREE.Vector2();
        let that = this;
        function onPointerMove( event ) {
            that.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            that.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;        
        }
        window.addEventListener( 'mousemove', onPointerMove );
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.01;

        if(this.pointsMesh) {
            this.pointsMesh.rotation.y += 0.005
        }
        this.material.uniforms.time.value = this.time;
       
        this.raycaster.setFromCamera( this.mouse, this.camera );
        this.intersects = this.raycaster.intersectObjects( [this.plain] );
        if(this.intersects.length > 0) {
            this.material.uniforms.mousePos.value = this.intersects[0].point
        }
     
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}


new Sketch({
  dom: document.querySelector(".canvas"),
});
