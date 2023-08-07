import { BrowserRouter } from 'react-router-dom';
import { Hero, Navbar, About } from './components';

const App = () => {
  return (
//  Wrap everything in a browser wrapper component
    <BrowserRouter>
      <div className="relative z-0 bg-primary">
        <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
          <Navbar />
          <Hero />
        </div>
      </div>
      <About />


    </BrowserRouter>
  )
}

export default App
