import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Scene.styles.css";

export const Scene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let lastClientX = 0;
    let lastClientY = 0;

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();

      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        isDragging = true;
        lastClientX = event.clientX;
        lastClientY = event.clientY;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();

      if (isDragging) {
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        mouse.set(x, y);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
          const movementX = event.clientX - lastClientX;
          const movementY = event.clientY - lastClientY;

          cube.rotation.x += movementY * 0.01;
          cube.rotation.y += movementX * 0.01;
        }

        lastClientX = event.clientX;
        lastClientY = event.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();

      const touch = event.touches[0];
      const rect = container.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        isDragging = true;
        lastClientX = touch.clientX;
        lastClientY = touch.clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();

      if (isDragging && event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        mouse.set(x, y);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
          const movementX = touch.clientX - lastClientX;
          const movementY = touch.clientY - lastClientY;

          cube.rotation.x += movementY * 0.01;
          cube.rotation.y += movementX * 0.01;
        }

        lastClientX = touch.clientX;
        lastClientY = touch.clientY;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId!);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="scene-container" ref={containerRef}></div>;
};
