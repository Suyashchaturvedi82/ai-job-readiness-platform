import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useMemo } from 'react';

function SkillNode({ position }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  const nodes = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 2.5;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 1.5];
  }), []);

  return (
    <div style={{ height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.3} />
        </mesh>
        {nodes.map((pos, i) => <SkillNode key={i} position={pos} />)}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}