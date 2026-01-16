import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { PatternBackground } from "@/shared/ui/pattern-background";
import { ToastProvider } from "@/shared/contexts";

// Vercel Best Practice: bundle-dynamic-imports - 페이지 컴포넌트를 lazy loading으로 변경
const HomeScreen = lazy(() =>
  import("@/pages/home").then((m) => ({ default: m.HomeScreen }))
);
const MapScreen = lazy(() =>
  import("@/pages/map").then((m) => ({ default: m.MapScreen }))
);

function App() {

  return (
    <ToastProvider>
      <div className="relative w-full h-dvh overflow-hidden bg-pastel">
        {/* Pattern Background for Desktop/Tablet */}
        <div className="hidden tablet:block">
          <PatternBackground />
        </div>

        {/* Content Container */}
        <div className="mx-auto h-full w-full tablet:max-w-tablet bg-background relative z-10">
          {/* Main Content */}
          <div className="h-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/map" element={<MapScreen />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
