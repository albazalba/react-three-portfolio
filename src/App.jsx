import "./index.css";
import Dark from "./components/organisms/Dark";
import Header from "./components/molecules/Header";
import Hero from "./components/organisms/Hero";
import WhatIDo from "./components/organisms/WhatIDo";
import Experience from "./components/organisms/Experience";
import Projects from "./components/organisms/Projects";
import Contact from "./components/organisms/Contact";

function App() {
  return (
    <div className="bg-primary relative">
      {/* Dark 3D background */}
      <div className="fixed top-0 left-0 h-screen w-screen z-0">
        <Dark />
      </div>

      {/* Content layers */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <WhatIDo />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </div>
  );
}

export default App;
