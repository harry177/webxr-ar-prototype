import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import "./Scene.styles.css";

export const Scene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);

  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const init = () => {
      const container = containerRef.current!;
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      rendererRef.current = renderer;

      renderer.xr.enabled = true;

      const arButton = ARButton.createButton(renderer);

      arButton.addEventListener("sessionstart", () => {
        setSessionActive(true);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, -1.5);
        cubeRef.current = cube;

        scene.add(cube);
      });

      arButton.addEventListener("sessionend", () => {
        setSessionActive(false);
        scene.remove(cubeRef.current!);
        cubeRef.current = null;
      });

      document.body.appendChild(arButton);

      container.appendChild(renderer.domElement);

      camera.position.z = 5;

      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;
    };

    const animate = () => {
      const { current: renderer } = rendererRef;
      const { current: scene } = sceneRef;
      const { current: camera } = cameraRef;
      const { current: cube } = cubeRef;

      if (renderer && scene && camera) {
        if (sessionActive) {
          if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
          }

          renderer.render(scene, camera);
        }
        animationFrameId = requestAnimationFrame(animate);
      }
      
    };

    init();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      const { current: renderer } = rendererRef;

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="scene-container" />
    </>
  );
};