import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// Canvas is an empty canvas allowing us to place something on it. 
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';



const Maps = () => {
  // const map = useGLTF('./HSW.gltf')
  const map = useGLTF('./HSW.gltf')
  
  useEffect(() => {
    map.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}, [map]);

  return (
    // when creating threejs elements, dont start with div, but start with Mesh
    <mesh>
      {/* Inside mesh, create light at a height*/}
      {/* <ambientLight intensity={1} /> */}
      <hemisphereLight intensity={0.8} groundColor="black" />
      {/* <pointLight  */}
      {/*<directionalLight */}
      {/*    intensity={0.8}*/}
      <spotLight 
          intensity={400}
          position={[-10, 40, -25]} 
          castShadow={true}
          shadow-mapSize-width={2200} 
          shadow-mapSize-height={2200}
          shadow-bias={0.0000005}
          />
      <primitive
        object={map.scene}
      />
    </mesh> 
  )
}

const MapsCanvas = () => {
  return (
    <Canvas
      frameloop="demand"
      shadows
      camera={{ position: [-50, 50, -20], fov: 30 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls  
          enableZoom={true} 
          // maxPolarAngle={Math.PI}
          minPolarAngle={Math.PI / 999}
          target = {[20, -5, -20]}
        />
        {/* Render the map components here */}
        <Maps />
      </Suspense>

      <Preload all />
    </Canvas>
  )
}

export default MapsCanvas