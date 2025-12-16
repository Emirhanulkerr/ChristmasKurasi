import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import './ChristmasTree.css';

/**
 * High-Fidelity Christmas Tree Component
 * 
 * Features:
 * - Procedural geometry generation
 * - Physically based materials
 * - Soft, cinematic lighting
 * - Post-processing (Bloom)
 * - Gentle, organic animations
 */

interface ChristmasTreeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02); // Soft fog for depth

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 2.5, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false, // Post-processing handles AA or we trade it for performance
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeebb, 1.5);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xccddff, 0.5);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // --- MATERIALS ---
    const createBarkTexture = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#5d4037' : '#2d1b1e';
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = Math.random() * 2 + 1;
        const h = Math.random() * 30 + 10;
        ctx.fillRect(x, y, w, h);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 4);
      return texture;
    };

    const barkTexture = createBarkTexture();

    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: barkTexture,
      roughness: 0.9,
      metalness: 0.1,
    });

    const needleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b5e20,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const ornamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Custom shader material for lights to handle flickering
    const lightUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffb74d) }
    };

    const lightMaterial = new THREE.ShaderMaterial({
      uniforms: lightUniforms,
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vPosition;
        
        // Simple pseudo-random function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          // Create a unique flicker offset based on world position (approx)
          float offset = random(vec2(gl_FragCoord.x * 0.01, gl_FragCoord.y * 0.01));
          
          // Slow breathing + fast flicker
          float breathe = sin(uTime * 1.0 + offset * 10.0) * 0.3 + 0.7;
          float flicker = sin(uTime * 15.0 + offset * 100.0) * 0.1;
          
          float intensity = breathe + flicker;
          
          // Soft circle shape for the point sprite look if needed, but we use geometry
          gl_FragColor = vec4(uColor * intensity * 2.0, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });


    // --- GEOMETRY GENERATION ---
    
    // 1. Trunk
    const trunkHeight = 4.5;
    const trunkRadius = 0.2;
    const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.1, trunkRadius, trunkHeight, 12);
    trunkGeo.translate(0, trunkHeight / 2, 0);
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    scene.add(trunkMesh);

    // 2. Branches & Needles (Instanced)
    // We create a "Branch Unit" which is a stick with needles
    const createBranchGeometry = (length: number, width: number) => {
      // Thinner branch core
      const branchGeo = new THREE.CylinderGeometry(width * 0.4, width * 0.8, length, 5);
      branchGeo.translate(0, length / 2, 0);
      branchGeo.rotateZ(-Math.PI / 2); // Point along X axis initially

      // Needles - SIGNIFICANTLY INCREASED DENSITY
      const needleCount = Math.floor(length * 150); // Was 40
      const needles: THREE.BufferGeometry[] = [];
      // Longer, thinner needles for pine look
      const needleGeoBase = new THREE.CylinderGeometry(0.005, 0.01, 0.25, 3);
      
      for (let i = 0; i < needleCount; i++) {
        const needle = needleGeoBase.clone();
        const t = Math.random(); // Position along branch
        const angle = Math.random() * Math.PI * 2; // Radial angle
        
        // More natural pine needle distribution
        // Pine needles often cluster or point forward/outward
        const forwardLean = Math.PI / 4 + (Math.random() * 0.2); 

        // Position
        const x = t * length;
        // Add some volume to the branch
        const r = 0.02 + Math.random() * 0.02;
        const y = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        needle.rotateZ(Math.PI / 2); // Lay flat
        needle.rotateY(angle); // Rotate around branch
        needle.rotateZ(forwardLean); // Angle forward/out
        needle.translate(x, y, z);
        
        needles.push(needle);
      }

      // Merge branch and needles
      const merged = BufferGeometryUtils.mergeGeometries([branchGeo, ...needles]);
      return merged;
    };

    // Create a few variations of branches
    const branchGeos = [
      createBranchGeometry(1.4, 0.06), // Bottom (Long)
      createBranchGeometry(1.0, 0.05), // Middle
      createBranchGeometry(0.6, 0.04)  // Top (Short)
    ];

    // Place Branches
    const branchInstances: THREE.InstancedMesh[] = [];
    const layers = 24; // Increased from 12 for density
    const branchesPerLayer = 12; // Increased from 9
    
    // Helper to create instanced mesh for a specific geometry
    const createInstancedBranches = (geo: THREE.BufferGeometry, count: number) => {
      const mesh = new THREE.InstancedMesh(geo, needleMaterial, count);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // We'll collect transforms first then create meshes
    const branchTransforms: { index: number, matrix: THREE.Matrix4 }[][] = [[], [], []];
    
    const dummy = new THREE.Object3D();
    
    // Decoration types for variety
    // Type 0: Ball ornament (sphere)
    // Type 1: Star ornament (small)
    // Type 2: Bell ornament
    interface DecorationData {
      matrix: THREE.Matrix4;
      type: number; // 0=ball, 1=star, 2=bell
      colorIndex: number; // For variety
    }
    const ornaments: DecorationData[] = [];
    const lights: THREE.Matrix4[] = [];
    
    // Predefined ornament colors for a cohesive look
    const ornamentColors = [
      new THREE.Color(0xc41e3a), // Christmas Red
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xfffafa), // Snow White
      new THREE.Color(0x228b22), // Forest Green
      new THREE.Color(0x4169e1), // Royal Blue
      new THREE.Color(0x8b4513), // Saddle Brown
    ];

    // Tree shape parameters - wider triangle (60-60-60 equilateral-ish)
    const treeHeight = 3.5; // Height of foliage section
    const foliageStart = 0.8; // Where foliage begins (shows trunk below)
    const foliageEnd = foliageStart + treeHeight; // Top of tree
    const halfTopAngle = 40 * Math.PI / 180; // 80 degree top angle -> 40 degree half (MUCH WIDER)
    const maxRadius = treeHeight * Math.tan(halfTopAngle); // Base radius of triangle

    for (let i = 0; i < layers; i++) {
      const t = i / layers; // 0 to 1 (bottom to top)
      
      const layerY = foliageStart + t * treeHeight;
      
      // Natural droop: slight at bottom, almost none at top
      const droop = (Math.PI / 9) * (1 - t) + 0.05; 

      // Calculate target radius for perfect triangle silhouette
      // Linear taper from maxRadius at bottom to 0 at top
      const heightFromTop = foliageEnd - layerY;
      const targetRadius = heightFromTop * Math.tan(halfTopAngle);
      
      // Skip if too small
      if (targetRadius < 0.05) continue;
      
      // Adjust length so the projected tip hits the target radius
      // The horizontal projection of a branch = length * cos(droop)
      const branchLength = targetRadius / Math.cos(droop);

      // Select geometry based on length (approximate)
      let geoIndex = 0;
      if (branchLength < 1.0) geoIndex = 1;
      if (branchLength < 0.6) geoIndex = 2;

      // More branches at bottom, fewer at top
      const count = Math.floor(branchesPerLayer * (1 - t * 0.3));
      
      for (let j = 0; j < count; j++) {
        const angle = (j / count) * Math.PI * 2 + (i * 1.5); // More random spiral offset

        dummy.position.set(0, layerY, 0);
        dummy.rotation.set(0, 0, 0); // Reset rotation
        dummy.rotateY(angle); // Rotate around trunk
        dummy.rotateZ(-droop); // Tilt outward and slightly down
        
        // Add some random variation to rotation so it's not perfect
        dummy.rotateX((Math.random() - 0.5) * 0.15);
        dummy.rotateZ((Math.random() - 0.5) * 0.1);
        
        // Scale the branch mesh to match the calculated length
        const baseLengths = [1.4, 1.0, 0.6];
        const scaleX = branchLength / baseLengths[geoIndex];
        dummy.scale.set(scaleX, 1, 1); // Scale along length (X-axis before rotation)

        dummy.updateMatrix();
        
        branchTransforms[geoIndex].push({ index: 0, matrix: dummy.matrix.clone() });

        // --- DECORATION PLACEMENT (Evenly distributed) ---
        const globalIndex = i * branchesPerLayer + j;
        
        // Use deterministic placement based on golden angle for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
        const decorationPhase = globalIndex * goldenAngle;
        
        // 1. Ornaments: Place every 4th branch, but use golden angle to distribute evenly
        if (t < 0.85 && globalIndex % 4 === 0) {
          // Position along the branch (outer 40%)
          const dist = 0.6 + (Math.sin(decorationPhase) * 0.5 + 0.5) * 0.35;
          
          // Hang below the branch
          const ornamentPos = new THREE.Vector3(dist * branchLength, -0.12, 0);
          ornamentPos.applyMatrix4(dummy.matrix);
          
          // Vary size based on layer (bigger at bottom)
          const baseScale = 0.06 + (1 - t) * 0.04;
          const scale = baseScale + Math.sin(decorationPhase * 2) * 0.02;
          
          const itemDummy = new THREE.Object3D();
          itemDummy.position.copy(ornamentPos);
          itemDummy.scale.set(scale, scale, scale);
          itemDummy.updateMatrix();

          // Cycle through decoration types and colors
          const decorType = globalIndex % 3; // 0, 1, 2
          const colorIdx = (globalIndex * 7) % ornamentColors.length; // Prime multiplier for variety
          
          ornaments.push({
            matrix: itemDummy.matrix.clone(),
            type: decorType,
            colorIndex: colorIdx
          });
        }

        // 2. Lights: Wrap around branches in a spiral pattern
        // Place on every other branch for even coverage
        if (globalIndex % 2 === 0) {
          // 2-3 lights per branch, evenly spaced
          const numLights = 2 + (i % 2);
          for (let l = 0; l < numLights; l++) {
            // Even distribution along branch
            const dist = 0.25 + (l / numLights) * 0.65;
            
            // Spiral wrap around branch
            const wrapAngle = l * Math.PI * 0.7 + decorationPhase;
            const wrapRadius = 0.05;
            
            const lightPos = new THREE.Vector3(
              dist * branchLength,
              Math.sin(wrapAngle) * wrapRadius,
              Math.cos(wrapAngle) * wrapRadius
            );
            
            lightPos.applyMatrix4(dummy.matrix);
            
            const itemDummy = new THREE.Object3D();
            itemDummy.position.copy(lightPos);
            itemDummy.scale.set(0.4, 0.4, 0.4);
            itemDummy.updateMatrix();
            lights.push(itemDummy.matrix.clone());
          }
        }
      }
    }

    // Create and fill InstancedMeshes for branches
    branchGeos.forEach((geo, i) => {
      if (branchTransforms[i].length > 0) {
        const mesh = createInstancedBranches(geo, branchTransforms[i].length);
        branchTransforms[i].forEach((data, idx) => {
          mesh.setMatrixAt(idx, data.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        branchInstances.push(mesh);
      }
    });

    // Create Ornaments with variety
    // Ball ornaments (type 0)
    const ballGeo = new THREE.SphereGeometry(1, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.15,
      metalness: 0.9,
    });
    
    // Star ornaments (type 1) - using octahedron as star approximation
    const starGeo = new THREE.OctahedronGeometry(1.2, 0);
    const starMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.7,
    });
    
    // Bell ornaments (type 2) - using cone
    const bellGeo = new THREE.ConeGeometry(0.8, 1.4, 8);
    bellGeo.rotateX(Math.PI); // Flip upside down
    const bellMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.85,
    });

    // Group ornaments by type
    const ballOrnaments = ornaments.filter(o => o.type === 0);
    const starOrnaments = ornaments.filter(o => o.type === 1);
    const bellOrnaments = ornaments.filter(o => o.type === 2);

    // Create instanced meshes for each type
    if (ballOrnaments.length > 0) {
      const ballMesh = new THREE.InstancedMesh(ballGeo, ballMaterial, ballOrnaments.length);
      ballOrnaments.forEach((data, i) => {
        ballMesh.setMatrixAt(i, data.matrix);
        ballMesh.setColorAt(i, ornamentColors[data.colorIndex]);
      });
      ballMesh.instanceMatrix.needsUpdate = true;
      if (ballMesh.instanceColor) ballMesh.instanceColor.needsUpdate = true;
      ballMesh.castShadow = true;
      scene.add(ballMesh);
    }

    if (starOrnaments.length > 0) {
      const starMesh = new THREE.InstancedMesh(starGeo, starMaterial, starOrnaments.length);
      starOrnaments.forEach((data, i) => {
        starMesh.setMatrixAt(i, data.matrix);
        starMesh.setColorAt(i, ornamentColors[data.colorIndex]);
      });
      starMesh.instanceMatrix.needsUpdate = true;
      if (starMesh.instanceColor) starMesh.instanceColor.needsUpdate = true;
      starMesh.castShadow = true;
      scene.add(starMesh);
    }

    if (bellOrnaments.length > 0) {
      const bellMesh = new THREE.InstancedMesh(bellGeo, bellMaterial, bellOrnaments.length);
      bellOrnaments.forEach((data, i) => {
        bellMesh.setMatrixAt(i, data.matrix);
        bellMesh.setColorAt(i, ornamentColors[data.colorIndex]);
      });
      bellMesh.instanceMatrix.needsUpdate = true;
      if (bellMesh.instanceColor) bellMesh.instanceColor.needsUpdate = true;
      bellMesh.castShadow = true;
      scene.add(bellMesh);
    }

    // Create Lights
    const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMesh = new THREE.InstancedMesh(lightGeo, lightMaterial, lights.length);
    lights.forEach((mat, i) => {
      lightMesh.setMatrixAt(i, mat);
    });
    lightMesh.instanceMatrix.needsUpdate = true;
    scene.add(lightMesh);

    // --- POST PROCESSING ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    bloomPass.strength = 0.8;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.7; // Only bright things glow
    composer.addPass(bloomPass);

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      
      // Update uniforms
      lightUniforms.uTime.value = time;

      // Gentle tree sway
      const sway = Math.sin(time * 0.5) * 0.02;
      scene.rotation.y = sway;
      scene.rotation.z = Math.sin(time * 0.3) * 0.01;

      // Render
      composer.render();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose resources
      renderer.dispose();
      composer.dispose();
      
      // Traverse and dispose geometries/materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          }
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={`christmas-tree-container ${className || ''}`} style={style}>
      <canvas ref={canvasRef} />
    </div>
  );
};


