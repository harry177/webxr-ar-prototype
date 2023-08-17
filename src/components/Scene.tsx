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
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(true);

  const handleMouseClick = (event: MouseEvent) => {
    const { current: raycaster } = raycasterRef;
    const { current: camera } = cameraRef;
    const { current: cube } = cubeRef;

    if (raycaster && camera && cube) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        cube.scale.set(
          cube.scale.x * 1.1,
          cube.scale.y * 1.1,
          cube.scale.z * 1.1
        );
        setIsMuted((isMuted) => !isMuted);
        console.log('fff');
      }
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    const { current: raycaster } = raycasterRef;
    const { current: camera } = cameraRef;
    const { current: cube } = cubeRef;
    const { current: scene } = sceneRef;

    if (scene && raycaster && camera && cube) {
    const touch = event.touches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;

      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0 && intersects[0].object === cube) {
        cube.scale.set(
          cube.scale.x * 1.1,
          cube.scale.y * 1.1,
          cube.scale.z * 1.1
        );
        setIsMuted((isMuted) => !isMuted);
        console.log('fff')
      }
    }
  };

  function handleDocumentClick() {
    const { current: container } = containerRef;
    if (container) {
      container.addEventListener("click", handleMouseClick);
    }
  }

  useEffect(() => {
    const handleWindowResize = () => {
      const { current: camera } = cameraRef;
      const { current: renderer } = rendererRef;
  
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    const init = () => {
      const container = containerRef.current!;

      container.addEventListener("click", handleDocumentClick);
    
      window.addEventListener("resize", handleWindowResize);

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

      renderer.domElement.addEventListener("touchstart", handleTouchStart);

      const arButton = ARButton.createButton(renderer);

      const handleARSession = () => {
        const { current: scene } = sceneRef;
        const { current: cube } = cubeRef;
        const { current: video } = videoRef;
        if (scene && cube) {
          scene.add(cube);
        }
        if (video) {
          video.play();
        }
      };
      arButton.addEventListener("click", handleARSession);

      const video = videoRef.current;

      if (video) {
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        textureRef.current = texture;

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
          map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(0.5, 0.5, 0.5);
        cube.position.set(0, 0, -2.5);
        cubeRef.current = cube;

        renderer.setAnimationLoop(animate);

        document.body.appendChild(arButton);

        container.appendChild(renderer.domElement);

        camera.position.z = 5;

        const raycaster = new THREE.Raycaster();
        raycasterRef.current = raycaster;

        video.play();
      }

      document.addEventListener("click", handleDocumentClick);
    };

    const animate = () => {
      const { current: renderer } = rendererRef;
      const { current: scene } = sceneRef;
      const { current: camera } = cameraRef;
      const { current: cube } = cubeRef;
      const { current: texture } = textureRef;

      if (renderer && scene && camera) {
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }

        if (texture) {
          texture.needsUpdate = true;
        }

        renderer.render(scene, camera);
      }
    };

    init();

    return () => {
      const { current: renderer } = rendererRef;

      if (renderer) {
        renderer.dispose();
      }

      const { current: container } = containerRef;
     
        container && container.removeEventListener("click", handleDocumentClick);
        renderer && renderer.domElement.removeEventListener("touchstart", handleTouchStart);
    
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <>
      <video
        ref={videoRef}
        className="video-texture"
        muted
        autoPlay
        loop
        preload="auto"
        crossOrigin="anonymous"
        controls
        playsInline
      >
        <source
          type="video/mp4"
          src="https://webglsamples.org/color-adjust/sample-video.mp4"
        ></source>
      </video>
      <div ref={containerRef} className="scene-container" />
    </>
  );
};
