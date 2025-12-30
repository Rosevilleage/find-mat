import { useState } from "react";
import { Routes, Route } from "react-router";
import { HomeScreen } from "@/pages/home";
import { MapScreen } from "@/pages/map";
import { Toast } from "@/shared/ui/toast";
import { PatternBackground } from "@/shared/ui/pattern-background";

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

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 1800);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-pastel">
      {/* Pattern Background for Desktop/Tablet */}
      <div className="hidden tablet:block">
        <PatternBackground />
      </div>

      {/* Content Container */}
      <div className="mx-auto h-full w-full tablet:max-w-tablet bg-background relative z-10">
        {/* Main Content */}
        <div className="h-full">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route
              path="/map"
              element={<MapScreen onShowToast={showToast} />}
            />
          </Routes>
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
