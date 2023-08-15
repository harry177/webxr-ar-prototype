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
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const lastClientXRef = useRef(0);
  const lastClientYRef = useRef(0);

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
      });
      arButton.addEventListener("sessionend", () => {
        setSessionActive(false);
      });

      document.body.appendChild(arButton);

      container.appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, -2);
      scene.add(cube);
      cubeRef.current = cube;

      camera.position.z = 5;

      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;

      const handleTouchMove = (event: TouchEvent) => {
        event.preventDefault();

        if (isDraggingRef.current && event.touches.length === 1) {
          const touch = event.touches[0];
          const rect = container.getBoundingClientRect();
          const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

          mouseRef.current.set(x, y);
          raycaster.setFromCamera(mouseRef.current, camera);

          const intersects = raycaster.intersectObjects(scene.children);

          if (intersects.length > 0) {
            const movementX = touch.clientX - lastClientXRef.current;
            const movementY = touch.clientY - lastClientYRef.current;

            cube.rotation.x += movementY * 0.01;
            cube.rotation.y += movementX * 0.01;
          }

          lastClientXRef.current = touch.clientX;
          lastClientYRef.current = touch.clientY;
        }
      };

      const handleTouchEnd = () => {
        isDraggingRef.current = false;
      };

      container.addEventListener("touchmove", handleTouchMove);
      container.addEventListener("touchend", handleTouchEnd);
    };

    const handleWindowResize = () => {
      const { current: renderer } = rendererRef;
      const { current: camera } = cameraRef;

      if (renderer && camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    const animate = () => {
      const { current: renderer } = rendererRef;
      const { current: scene } = sceneRef;
      const { current: camera } = cameraRef;

      if (renderer && scene && camera && sessionActive) {
        renderer.render(scene, camera);
      }
    };

    init();
    rendererRef.current!.setAnimationLoop(animate);

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);

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
