import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Tools from "./components/Tools";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Services />
        <Projects />
        <Tools />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
