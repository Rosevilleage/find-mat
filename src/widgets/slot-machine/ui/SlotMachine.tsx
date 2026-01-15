import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlotMachineIcon } from "./SlotMachineIcon";
import {
  getFoodCategory,
  getCategoryIcon,
  KoreanFoodIcon,
  ChineseFoodIcon,
  JapaneseFoodIcon,
  WesternFoodIcon,
  ChickenIcon,
  PizzaIcon,
  BurgerIcon,
  StreetFoodIcon,
  NoodleIcon,
  CurryIcon,
  TacoIcon,
  DessertIcon,
  DefaultIcon,
} from "@/entities/food";

// Vercel Best Practice: rendering-hoist-jsx - 아이콘 배열을 모듈 레벨에서 정의
const ALL_FOOD_ICONS = [
  KoreanFoodIcon,
  ChineseFoodIcon,
  JapaneseFoodIcon,
  WesternFoodIcon,
  ChickenIcon,
  PizzaIcon,
  BurgerIcon,
  StreetFoodIcon,
  NoodleIcon,
  CurryIcon,
  TacoIcon,
  DessertIcon,
];

// 랜덤 아이콘 선택 함수
const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * ALL_FOOD_ICONS.length);
  return ALL_FOOD_ICONS[randomIndex];
};

// 스파클 위치를 미리 정의 (렌더링 시 Math.random() 사용 방지)
const SPARKLE_POSITIONS = [
  { id: 1, left: "25%", top: "30%" },
  { id: 2, left: "75%", top: "35%" },
  { id: 3, left: "50%", top: "55%" },
  { id: 4, left: "80%", top: "50%" },
  { id: 5, left: "20%", top: "60%" },
];

interface SlotMachineProps {
  isRolling: boolean;
  foodItems: string[];
  result: string;
  onComplete: () => void;
  isCustomList?: boolean; // 커스텀 목록 사용 여부
}

interface SlotColumn {
  categories: string[];
  icons: React.ComponentType<{ className?: string }>[];
  foodNames: string[];
  isCustomList: boolean; // 커스텀 목록 여부를 저장
}

// Vercel Best Practice: rerender-memo - Extract expensive work into memoized components
const SlotMachineComponent = ({
  isRolling,
  foodItems,
  result,
  onComplete,
  isCustomList = false,
}: SlotMachineProps) => {
  const [showSlot, setShowSlot] = useState(false);
  const [slotColumns, setSlotColumns] = useState<SlotColumn>({
    categories: [],
    icons: [],
    foodNames: [],
    isCustomList: false,
  });

  useEffect(() => {
    if (!isRolling) return;

    let completionTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    // 비동기로 상태 업데이트
    const startAnimation = () => {
      setShowSlot(true);

      // 랜덤하게 표시할 음식들 생성 (30개)
      const randomFoods = Array.from(
        { length: 30 },
        () => foodItems[Math.floor(Math.random() * foodItems.length)]
      );

      // 결과값을 배열의 중간 위치(index 15)에 배치
      const resultIndex = 15;
      randomFoods[resultIndex] = result;

      // Vercel Best Practice: rendering-conditional-render
      // 커스텀 목록과 기본 목록에 따라 다른 레이아웃 사용
      let categories: string[];
      let icons: React.ComponentType<{ className?: string }>[];
      let foodNames: string[];

      if (isCustomList) {
        // 내 목록: 1열 메뉴이름 | 2열 아이콘 | 3열 메뉴이름
        // Vercel Best Practice: js-cache-function-results - 랜덤 아이콘 생성
        categories = randomFoods; // 1열: 메뉴 이름
        icons = randomFoods.map((_, index) => {
          // 결과 위치(index 15)만 기타 아이콘, 나머지는 랜덤 아이콘
          return index === resultIndex ? DefaultIcon : getRandomIcon();
        });
        foodNames = randomFoods; // 3열: 메뉴 이름
      } else {
        // 기본 목록: 1열 카테고리 | 2열 아이콘 | 3열 메뉴 이름
        categories = randomFoods.map((food) => getFoodCategory(food));
        icons = categories.map((category) => getCategoryIcon(category));
        foodNames = randomFoods;
      }

      setSlotColumns({
        categories,
        icons,
        foodNames,
        isCustomList,
      });

      // 슬롯 애니메이션 완료 시간 (3초 - 가장 긴 컬럼 기준)
      completionTimer = setTimeout(() => {
        onComplete();
        hideTimer = setTimeout(() => {
          setShowSlot(false);
        }, 400);
      }, 3000);
    };

    // requestAnimationFrame을 사용하여 다음 프레임에서 실행
    const rafId = requestAnimationFrame(startAnimation);

    return () => {
      cancelAnimationFrame(rafId);
      if (completionTimer) clearTimeout(completionTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isRolling, foodItems, result, onComplete]);

  // 결과 아이템이 화면 중앙에 오도록 계산
  const resultIndex = 15;
  const itemHeight = 80;
  const centerPosition = 128; // 화면 중앙
  const finalY = centerPosition - resultIndex * itemHeight - itemHeight / 2;

  return (
    <AnimatePresence>
      {showSlot && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative max-w-[500px] w-full bg-linear-to-b from-indigo-500 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* 슬롯머신 헤더 */}
            <div className="bg-indigo-700 py-4 px-6 flex items-center justify-center gap-3">
              <SlotMachineIcon className="w-8 h-8" />
              <h3 className="text-white text-xl">음식 뽑기</h3>
            </div>

            {/* 슬롯 디스플레이 영역 */}
            <div className="relative bg-white/10 backdrop-blur-md mx-6 my-6 rounded-2xl overflow-hidden">
              {/* 상단 그라디언트 오버레이 */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-indigo-500 to-transparent z-10 pointer-events-none" />

              {/* 중앙 선택 영역 표시 */}
              <div className="absolute top-1/2 left-0 right-0 h-20 -mt-10 border-y-4 border-yellow-400 bg-yellow-400/10 z-10 pointer-events-none" />

              {/* 하단 그라디언트 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-indigo-500 to-transparent z-10 pointer-events-none" />

              {/* 3개의 슬롯 컬럼 - Vercel Best Practice: rendering-conditional-render */}
              <div className="relative h-64 overflow-hidden flex">
                {/* 컬럼 1: 커스텀이면 메뉴이름, 기본이면 카테고리 */}
                <div className="flex-1 relative overflow-hidden border-r-2 border-white/20">
                  <motion.div
                    className="absolute left-0 right-0 flex flex-col items-center"
                    initial={{ y: 0 }}
                    animate={{
                      y: [0, -100, finalY],
                    }}
                    transition={{
                      duration: 2.0,
                      times: [0, 0.1, 1],
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    {slotColumns.isCustomList
                      ? slotColumns.categories.map((menuName, index) => (
                          <div
                            key={index}
                            className="h-20 flex items-center justify-center text-white text-base font-medium py-2 px-2 text-center"
                            style={{
                              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            }}
                          >
                            {menuName}
                          </div>
                        ))
                      : slotColumns.categories.map((category, index) => (
                          <div
                            key={index}
                            className="h-20 flex items-center justify-center text-white text-base font-medium py-2 px-2 text-center"
                            style={{
                              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            }}
                          >
                            {category}
                          </div>
                        ))}
                  </motion.div>
                </div>

                {/* 컬럼 2: 항상 아이콘 */}
                <div className="flex-1 relative overflow-hidden border-r-2 border-white/20">
                  <motion.div
                    className="absolute left-0 right-0 flex flex-col items-center"
                    initial={{ y: 0 }}
                    animate={{
                      y: [0, -100, finalY],
                    }}
                    transition={{
                      duration: 2.5,
                      times: [0, 0.1, 1],
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    {slotColumns.icons.map((IconComponent, index) => (
                      <div
                        key={index}
                        className="h-20 flex items-center justify-center py-2"
                      >
                        <IconComponent className="w-12 h-12" />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* 컬럼 3: 커스텀이면 메뉴이름, 기본이면 메뉴이름 */}
                <div className="flex-1 relative overflow-hidden">
                  <motion.div
                    className="absolute left-0 right-0 flex flex-col items-center"
                    initial={{ y: 0 }}
                    animate={{
                      y: [0, -100, finalY],
                    }}
                    transition={{
                      duration: 3.0,
                      times: [0, 0.1, 1],
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    {slotColumns.foodNames.map((foodName, index) => (
                      <div
                        key={index}
                        className="h-20 flex items-center justify-center text-white text-lg font-bold py-2 px-2 text-center"
                        style={{
                          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      >
                        {foodName}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 슬롯머신 하단 장식 */}
            <div className="bg-indigo-700 py-4 px-6">
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 사이드 장식 - 왼쪽 */}
            <div className="absolute left-2 top-1/2 -mt-8 w-8 h-16 bg-yellow-400/20 rounded-full blur-sm" />

            {/* 사이드 장식 - 오른쪽 */}
            <div className="absolute right-2 top-1/2 -mt-8 w-8 h-16 bg-yellow-400/20 rounded-full blur-sm" />
          </motion.div>

          {/* 반짝이는 파티클 효과 */}
          {SPARKLE_POSITIONS.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                left: sparkle.left,
                top: sparkle.top,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                y: [0, -30],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: sparkle.id * 0.3,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Vercel Best Practice: rerender-memo - Memoize to prevent unnecessary re-renders
export const SlotMachine = memo(SlotMachineComponent);
