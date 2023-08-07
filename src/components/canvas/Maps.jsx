import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// Canvas is an empty canvas allowing us to place something on it. 
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';

const Maps = () => {
  // const map = useGLTF('./HSW.gltf')
  const map = useGLTF('./HSW.gltf')


  return (
    // when creating threejs elements, dont start with div, but start with Mesh
    <mesh>
      {/* Inside mesh, create light at a height*/}
      <ambientLight intensity={0.1} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <pointLight intensity={1} />
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
      camera={{ position: [100, 3, 5], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls  
          enableZoom={true} 
          // maxPolarAngle={Math.PI}
          minPolarAngle={Math.PI / 999}
        />
        {/* Render the map components here */}
        <Maps />
      </Suspense>

      <Preload all />
    </Canvas>
  )
}

export default MapsCanvas