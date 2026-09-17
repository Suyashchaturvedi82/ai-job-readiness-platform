import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} />
        <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#6366f1" wireframe />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}