"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function MouseTracker({ onMove }: { onMove: (x: number, y: number) => void }) {
  useFrame((state) => {
    onMove(state.mouse.x, state.mouse.y);
  });
  return null;
}

function FloatingObject({
  position,
  scale,
  speed,
  color,
  mousePos,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
  mousePos: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
      
      const targetX = initialPos.x + mousePos.x * 2;
      const targetY = initialPos.y + mousePos.y * 2;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[scale, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          speed={speed * 1.5}
          distort={0.4}
          radius={1}
          transparent
          opacity={0.12}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>
    </Float>
  );
}

export default function Scene3D() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const objects = useMemo(() => {
    const items = [];
    const colors = ["#E8C4B0", "#C97B63", "#D4A853", "#F5EDE3"];
    for (let i = 0; i < 15; i++) {
      items.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10 - 5,
        ] as [number, number, number],
        scale: Math.random() * 1.2 + 0.4,
        speed: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return items;
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#E8C4B0" />
      
      <MouseTracker onMove={(x, y) => setMousePos({ x, y })} />
      
      {objects.map((obj) => (
        <FloatingObject
          key={obj.id}
          position={obj.position}
          scale={obj.scale}
          speed={obj.speed}
          color={obj.color}
          mousePos={mousePos}
        />
      ))}
      
      <Sphere args={[30, 32, 32]} scale={[-1, 1, 1]}>
        <meshBasicMaterial color="#FAF7F4" side={THREE.BackSide} />
      </Sphere>
    </Canvas>
  );
}
