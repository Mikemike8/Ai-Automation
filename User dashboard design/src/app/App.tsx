import { Navbar } from "./components/Navbar";
import { HeroPanel } from "./components/HeroPanel";
import { SummaryCards } from "./components/SummaryCards";
import { DataTable } from "./components/DataTable";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <HeroPanel />
          <SummaryCards />
          <DataTable />
        </div>
      </main>
    </div>
  );
}