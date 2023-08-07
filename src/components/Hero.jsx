import { motion } from 'framer-motion';
import { styles } from '../styles';
import { MapsCanvas } from './canvas';

const Hero = () => {
  return (
    <section className="relative w-full h-screen mx-auto">
      {/* Text above 3D rendering */}
      <div className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5`}>
        <div className="flex flex-col justify-center items-center mt-5">
        </div>
      
      <div>
        <h1 className={`${styles.heroHeadText}
        text-white`}>Demo Map <span className="text-[#915eff]">hard&softWERK GmbH</span></h1>
      </div>
    </div>
    
      <MapsCanvas />
    </section>
  )
}

export default Hero