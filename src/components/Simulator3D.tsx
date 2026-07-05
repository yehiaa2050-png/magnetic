import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Simulator3DProps {
  massKg: number;
  distanceMm: number;
  setDistanceMm: (d: number) => void;
  status: 'balanced' | 'falling' | 'flying';
  themeColor: string;
  shape: string;
}

function LevitatingObject({ distanceMm, massKg, shape, status }: { distanceMm: number, massKg: number, shape: string, status: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = Math.max(0.5, Math.pow(massKg, 1/3) * 0.2);

  const geometry = useMemo(() => {
    switch(shape) {
      case 'sphere': return <sphereGeometry args={[size/1.5, 32, 32]} />;
      case 'torus': return <torusGeometry args={[size/1.8, size/4, 16, 32]} />;
      case 'box':
      default: return <boxGeometry args={[size, size, size]} />;
    }
  }, [shape, size]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Evaluate ideal target Y
    const baseVisualY = distanceMm * 0.1;
    let targetY = baseVisualY + size / 2 + 0.5;
    
    // Adjust target based on physics state and add natural animations
    if (status === 'flying') {
      targetY += 10; // Shoot up if uncontrolled levitation
    } else if (status === 'falling') {
      targetY = size / 2 + 0.1; // Fall to ground smoothly
    } else {
      // Natural bobbing physics when perfectly balanced
      targetY += Math.sin(state.clock.elapsedTime * 3) * 0.15;
      
      // Add subtle rotations for realism
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.05;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.8) * 0.05;
    }
    
    // Smooth transitions between states/distances
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 4);
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, 0, 0]} // Initialized at 0, updated by lerp
      castShadow 
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

function BaseMagnet({ themeColor }: { themeColor: string }) {
  return (
    <mesh position={[0, 0.25, 0]} receiveShadow>
      <cylinderGeometry args={[2, 2, 0.5, 32]} />
      <meshStandardMaterial color={themeColor} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function MagneticParticles({ distanceMm, status, themeColor }: { distanceMm: number, status: string, themeColor: string }) {
  const particlesCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.random() * 1.8;
        pos[i * 3] = r * Math.cos(theta); 
        pos[i * 3 + 1] = Math.random() * (distanceMm * 0.1); 
        pos[i * 3 + 2] = r * Math.sin(theta); 
    }
    return pos;
  }, [distanceMm]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
        const time = clock.getElapsedTime();
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for(let i = 0; i < particlesCount; i++) {
             // Smooth sinusoidal particle flux
             positions[i * 3 + 1] += Math.sin(time + i) * 0.02;
             if(positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 0;
             if(positions[i * 3 + 1] > distanceMm * 0.1) positions[i * 3 + 1] = distanceMm * 0.1;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleColor = status === 'balanced' ? '#10b981' : (status === 'flying' ? '#f43f5e' : themeColor);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
            attach="attributes-position" 
            count={particlesCount} 
            array={positions} 
            itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={particleColor} transparent opacity={0.6} />
    </points>
  )
}

export default function Simulator3D({ massKg, distanceMm, setDistanceMm, status, themeColor, shape }: Simulator3DProps) {
  return (
    <div className="w-full h-full min-h-[400px] absolute inset-0">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
           position={[10, 10, 5]} 
           intensity={2} 
           castShadow 
           shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color={themeColor} />

        <BaseMagnet themeColor={themeColor} />
        <LevitatingObject massKg={massKg} distanceMm={distanceMm} shape={shape} status={status} />
        <MagneticParticles distanceMm={distanceMm} status={status} themeColor={themeColor} />

        <Grid infiniteGrid fadeDistance={40} sectionColor="rgba(255,255,255,0.05)" cellColor="rgba(255,255,255,0.02)" />
        <Environment preset="city" />
        
        <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            maxDistance={20}
        />
      </Canvas>
      <div className="absolute top-4 left-4 text-[10px] mono text-white/40 bg-black/40 px-2 py-1 flex items-center justify-center border border-white/5 rounded backdrop-blur">
        3D View Interactive
      </div>
    </div>
  );
}
