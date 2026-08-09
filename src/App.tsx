import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Services from "./components/Services";
import Projects from "./components/Projects";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ToolPage from "./components/ToolPage";
import ToolsIndex from "./components/ToolsIndex";
import { useHashRoute, toolIdFromHash, isToolsIndex } from "./hooks/useHashRoute";

export default function App() {
  const hash = useHashRoute();
  const toolId = toolIdFromHash(hash);

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {toolId ? (
          <ToolPage id={toolId} />
        ) : isToolsIndex(hash) ? (
          <ToolsIndex />
        ) : (
          <>
            <Hero />
            <Experience />
            <Services />
            <Projects />
            <TechStack />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
