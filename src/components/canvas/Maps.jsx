import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// Canvas is an empty canvas allowing us to place something on it. 
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';
import { Text } from '@react-three/drei';



const Maps = () => {
  // const map = useGLTF('./HSW.gltf')
  const map = useGLTF('./HSW.gltf')
  
  // State for zones
  const [zones, setZones] = useState([]);

  const ZONE_COORDINATES = {
    Z1: [3, 4, -26],  
    Z2: [10, 4, -31.1],  
    Z3: [10, 4, -21],  
    Z4: [10, 4, -13],      
    Z5: [3, 4, -8]   // Replace with the actual coordinates for Z5
  };

  useEffect(() => {
    map.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });


    const fetchZones = () => {
      fetch('https://run.mocky.io/v3/954d0232-c6aa-4595-95af-af3ac8f90814')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const mappedData = data.zones.map(zone => ({
            ...zone,
            position: ZONE_COORDINATES[zone.name]
          }));
          setZones(mappedData);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error.message);
        });
  };

      fetchZones(); // fetch immediately on mount
      const interval = setInterval(fetchZones, 1000); // fetch every 1 seconds
  
      return () => clearInterval(interval); // clear the interval when the component unmounts
}, [map]);

  return (
    // when creating threejs elements, dont start with div, but start with Mesh
    <mesh>
      {/* Displaying zone numbers */}
      {zones.map(zone => (
        <Text position={zone.position} fontSize={5} key={zone.name} rotation={[Math.PI / -2, -1.5, -1.55]}>
          {zone.count}
        </Text>
      ))}


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