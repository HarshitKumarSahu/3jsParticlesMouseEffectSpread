# 3D Particle Effect with Mouse Interaction

Welcome to the **3D Particle Effect with Mouse Interaction** project! This is a creative web-based visualization built using Three.js, featuring a dynamic particle system derived from a 3D model (e.g., Beyoncé), interactive mouse effects, and smooth animations powered by GSAP. The project showcases a blend of WebGL shaders, 3D rendering, and modern JavaScript techniques.

## Preview
./public/preview.png

## Demo
https://3js-particles-mouse-effect-spread.vercel.app/

## Features
- **Interactive Particle System**: Particles are generated from a 3D model and respond to mouse movement.
- **Shader Effects**: Custom vertex and fragment shaders create unique visual patterns.
- **GSAP Animations**: Smooth text animations and cursor effects using the GreenSock Animation Platform.
- **Mouse and Touch Support**: Tracks mouse and touch input for an engaging user experience.
- **Dynamic Transitions**: Button click triggers audio playback and animated transitions.

## Prerequisites
- **Node.js**: v20.x (LTS) or later (tested with v22.17.0).
- **npm**: Included with Node.js.
- **Web Browser**: Modern browsers like Chrome, Firefox, or Edge.

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/HarshitKumarSahu/3jsParticlesMouseEffectSpread.git
   cd 3jsParticlesMouseEffectSpread

2. **Install Dependencies**
   ```bash
   npm install

3. **Set Up the 3D Model**
- Place your .glb model (e.g., beyonce.glb) in the /models directory.
- Ensure the Draco decoder files are in the ./draco/ directory (download from Three.js or include via CDN if needed).

4. **Run the Project Locally**
- Start the development server:
    ```bash
    npm run dev
- Open your browser at http://localhost:5173 (or the port specified by Vite).

5. **Build for Production**
- Build the project for deployment:
    ```bash
    npm run build
- Serve the dist folder using a static server or deploy to a platform like Vercel.

## Usage
- Interact with the Scene: Move your mouse or touch the screen to influence the particle movement.
- Click the Button: Triggers an animation sequence, including audio playback and text effects.
- Customize: Modify the shaders (fragment.glsl, vertex.glsl) or GSAP animations in test.js to suit your vision.

## Dependencies
1. **Three.js**: For 3D rendering and WebGL.
2. **GSAP**: For animations (included via CDN or npm).
3. **Vite**: For development and build tooling.
4. **GLTFLoader & DRACOLoader**: For loading 3D models with compression.

## Customization
- Shaders: Edit fragment.glsl and vertex.glsl to change particle colors, shapes, or behaviors.
- Animations: Adjust GSAP timelines in test.js (e.g., landingAnimation, cornerAnimation) for different effects.
- Model: Replace beyonce.glb with another .glb file to use a different 3D model.
- Styles: Modify CSS in index.html to alter the cursor, button, or text appearance.

**License**
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as per the terms.

**Acknowledgments**
- Inspired by Three.js examples and GSAP tutorials.
- Thanks to the open-source community for tools like Vite and Draco compression.