import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "framer-motion";
import { SlotMachineIcon } from "@/widgets/slot-machine/ui/SlotMachineIcon";
import { useFoodList } from "@/features/manage-food-list";

// Vercel Best Practice: bundle-dynamic-imports - 무거운 모달/위젯을 lazy loading
const SlotMachine = lazy(() =>
  import("@/widgets/slot-machine/ui/SlotMachine").then((m) => ({
    default: m.SlotMachine,
  }))
);
const FoodResultModal = lazy(() =>
  import("@/widgets/food-result-modal").then((m) => ({
    default: m.FoodResultModal,
  }))
);
const FoodListModal = lazy(() =>
  import("@/features/manage-food-list").then((m) => ({
    default: m.FoodListModal,
  }))
);
import {
  IconMapPin,
  IconSettings,
  IconList,
  IconMenu2,
} from "@tabler/icons-react";
import { FOOD_ITEMS } from "@/shared/config";
import { useLocalStorage } from "@/shared/hooks";

interface HomeScreenProps {
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function HomeScreen({ onShowToast }: HomeScreenProps) {
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [useCustomList, setUseCustomList] = useLocalStorage(
    "use-custom-list",
    false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { foods: customFoods } = useFoodList();

  // Compute active food items
  const activeFoodItems = useMemo(() => {
    if (useCustomList && customFoods.length > 0) {
      return customFoods;
    }
    return FOOD_ITEMS;
  }, [useCustomList, customFoods]);

  // Show toast when toggle is ON but list is empty
  useEffect(() => {
    if (useCustomList && customFoods.length === 0 && onShowToast) {
      onShowToast("목록이 비어있어 기본 메뉴로 검색합니다", "info");
    }
  }, [useCustomList, customFoods.length, onShowToast]);

  const handlePickFood = () => {
    if (isRolling) return;

    setIsRolling(true);
    setShowResult(false);

    // 랜덤 음식 선택 (activeFoodItems 사용)
    const randomIndex = Math.floor(Math.random() * activeFoodItems.length);
    const selectedFood = activeFoodItems[randomIndex];
    setResult(selectedFood);
  };

  const handleSlotComplete = () => {
    // 슬롯머신 애니메이션이 완료되면 결과 모달 표시
    setIsRolling(false);
    setShowResult(true);
  };

  const handlePickAgain = () => {
    setShowResult(false);
    setResult(null);
    setTimeout(() => {
      handlePickFood();
    }, 200);
  };

  const handleFindNearby = () => {
    if (result) {
      // URL에 음식 정보를 포함하여 맵 페이지로 이동
      navigate(`/map?food=${encodeURIComponent(result)}`);
    }
  };

  const handleShowNearbyRestaurants = () => {
    // 내 주위 음식점 보기 (검색 없이)
    navigate("/map");
  };

  const handleClose = () => {
    setShowResult(false);
    setResult(null);
    setIsRolling(false);
  };

  return (
    <div className="flex flex-col h-full px-6 pt-12 pb-24 relative">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl" style={{ animationDuration: "2s" }}>
            🍽️
          </span>
          <h1
            className="text-4xl tablet:text-5xl font-bold animate-gradient"
            style={{
              background:
                "linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #4F46E5 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            오늘 뭐 먹지?
          </h1>
          <span
            className="text-4xl"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          >
            🤔
          </span>
        </div>
        <p className="text-muted-foreground text-base tablet:text-lg">
          음식을 랜덤으로 추천받아보세요
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* 슬롯머신 아이콘 - 초기 상태 */}
        {!isRolling && !showResult && (
          <button
            onClick={handlePickFood}
            className="mb-12 animate-bounce cursor-pointer active:scale-95 transition-transform"
            aria-label="음식 뽑기"
          >
            <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200">
              <SlotMachineIcon className="w-24 h-24" />
            </div>
          </button>
        )}

        {/* Empty State Message */}
        {!isRolling && !showResult && (
          <div className="text-center text-muted-foreground mb-8">
            <p>음식 뽑기를 시작해보세요!</p>
            <p className="text-sm mt-2">
              100가지 이상의 음식 중 랜덤으로 추천해드려요
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-3">
        {/* Compact Segment Control - Vercel Best Practice: rendering-conditional-render */}
        <div className="flex items-center gap-2">
          {/* iOS-style Segment Control */}
          <div className="flex-1 bg-gray-100 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setUseCustomList(false)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                !useCustomList
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <IconMenu2 size={14} />
                <span>기본 목록</span>
              </div>
            </button>
            <button
              onClick={() => setUseCustomList(true)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                useCustomList
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <IconList size={14} />
                <span>
                  내 목록 {customFoods.length > 0 && `(${customFoods.length})`}
                </span>
              </div>
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="내 목록 관리"
          >
            <IconSettings size={18} className="text-gray-700" />
          </button>
        </div>

        <button
          onClick={handlePickFood}
          disabled={isRolling}
          className="relative w-full py-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer text-white rounded-2xl transition-all duration-150 flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg"
        >
          <div className="w-6 h-6 flex items-center justify-center bg-white rounded-lg">
            <SlotMachineIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">
              {isRolling ? "음식 뽑는 중..." : "음식 뽑기"}
            </span>
            {/* Current list indicator - Vercel Best Practice: rendering-conditional-render */}
            {!isRolling && (
              <span className="text-xs opacity-80 mt-0.5">
                {useCustomList
                  ? `내 목록 ${customFoods.length}개에서`
                  : "기본 97가지 메뉴에서"}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={handleShowNearbyRestaurants}
          className="w-full py-5 bg-white hover:bg-gray-50 active:bg-gray-100 text-indigo-600 border-2 border-indigo-600 rounded-2xl transition-all duration-150 flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg cursor-pointer"
        >
          <IconMapPin className="w-6 h-6" />
          <span className="text-lg">내 주위 음식점 보기</span>
        </button>
      </div>

      {/* Slot Machine Animation */}
      {isRolling && result && (
        <Suspense fallback={null}>
          <SlotMachine
            isRolling={isRolling}
            foodItems={activeFoodItems}
            result={result}
            onComplete={handleSlotComplete}
            isCustomList={useCustomList}
          />
        </Suspense>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && (
          <Suspense fallback={null}>
            <FoodResultModal
              foodName={result}
              onFindNearby={handleFindNearby}
              onPickAgain={handlePickAgain}
              onClose={handleClose}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Food List Management Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Suspense fallback={null}>
            <FoodListModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onShowToast={onShowToast}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
