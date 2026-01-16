import { useState, useCallback, lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { Toast } from "@/shared/ui/toast";
import { PatternBackground } from "@/shared/ui/pattern-background";

// Vercel Best Practice: bundle-dynamic-imports - 페이지 컴포넌트를 lazy loading으로 변경
const HomeScreen = lazy(() =>
  import("@/pages/home").then((m) => ({ default: m.HomeScreen }))
);
const MapScreen = lazy(() =>
  import("@/pages/map").then((m) => ({ default: m.MapScreen }))
);

function App() {
  // Toast 전역 상태 관리
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type, visible: true });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 1800);
    },
    []
  );

  return (
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
              <Route
                path="/"
                element={<HomeScreen onShowToast={showToast} />}
              />
              <Route
                path="/map"
                element={<MapScreen onShowToast={showToast} />}
              />
            </Routes>
          </Suspense>
        </div>

        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
        />
      </div>
    </div>
  );
}

export default App;
