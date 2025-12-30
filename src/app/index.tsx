import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { HomeScreen } from "@/pages/home";
import { MapScreen } from "@/pages/map";
import { RestaurantDetail } from "@/widgets/restaurant-detail";
import { Toast } from "@/shared/ui/toast";
import { PatternBackground } from "@/shared/ui/pattern-background";
import type { Restaurant } from "@/entities/restaurant";

// 한국에서 파는 다양한 음식 종류
const FOOD_ITEMS = [
  // 한식
  "김치찌개",
  "된장찌개",
  "비빔밥",
  "불고기",
  "삼겹살",
  "갈비",
  "냉면",
  "설렁탕",
  "순대",
  "족발",
  "보쌈",
  "김밥",
  "라면",
  "떡볶이",
  "순두부찌개",
  "육개장",
  "갈비탕",
  "삼계탕",
  "쌈밥",
  "백반",

  // 중식
  "짜장면",
  "짬뽕",
  "탕수육",
  "양장피",
  "마라탕",
  "마라샹궈",
  "깐풍기",
  "유산슬",
  "중국집 볶음밥",

  // 일식
  "초밥",
  "라멘",
  "돈카츠",
  "우동",
  "카레",
  "오코노미야키",
  "타코야키",
  "규동",
  "회",

  // 양식
  "스테이크",
  "파스타",
  "피자",
  "리조또",
  "샐러드",
  "샌드위치",
  "햄버거",
  "스프",

  // 아시안
  "쌀국수",
  "팟타이",
  "분짜",
  "카오팟",
  "반미",
  "월남쌈",
  "똠얌꿍",
  "인도 커리",
  "난",
  "탄두리 치킨",
  "비리야니",

  // 패스트푸드/치킨
  "치킨",
  "피자",
  "햄버거",
  "핫도그",
  "감자튀김",
  "치킨너겟",

  // 분식
  "떡볶이",
  "순대",
  "튀김",
  "김밥",
  "라면",
  "어묵",
  "만두",

  // 기타
  "타코",
  "부리또",
  "케밥",
  "쌀국수",
  "냉면",
  "막국수",
  "칼국수",
  "수제비",
  "찜닭",
  "닭갈비",
  "곱창",
  "막창",
  "대창",
  "양",
  "닭발",
  "오뎅",
];

const CATEGORIES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "카페/디저트",
  "치킨",
  "피자",
  "버거",
  "베트남/태국",
  "인도/네팔",
  "멕시칸",
];

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "맛있는 한식당",
    category: "한식",
    distanceText: "350m",
    priceLevel: "₩₩",
    rating: 4.5,
    isOpen: true,
    menuItems: ["김치찌개", "된장찌개", "비빔밥", "불고기"],
    isBookmarked: false,
  },
  {
    id: "2",
    name: "중화요리 전문점",
    category: "중식",
    distanceText: "520m",
    priceLevel: "₩₩₩",
    rating: 4.3,
    isOpen: true,
    menuItems: ["짜장면", "짬뽕", "탕수육", "양장피"],
    isBookmarked: false,
  },
  {
    id: "3",
    name: "스시 바",
    category: "일식",
    distanceText: "780m",
    priceLevel: "₩₩₩₩",
    rating: 4.8,
    isOpen: false,
    menuItems: ["초밥", "회", "우동", "돈카츠"],
    isBookmarked: false,
  },
  {
    id: "4",
    name: "파스타 하우스",
    category: "양식",
    distanceText: "420m",
    priceLevel: "₩₩₩",
    rating: 4.2,
    isOpen: true,
    menuItems: ["파스타", "스테이크", "리조또", "샐러드"],
    isBookmarked: false,
  },
  {
    id: "5",
    name: "떡볶이 천국",
    category: "분식",
    distanceText: "180m",
    priceLevel: "₩",
    rating: 4.6,
    isOpen: true,
    menuItems: ["떡볶이", "순대", "튀김", "김밥"],
    isBookmarked: false,
  },
  {
    id: "6",
    name: "달콤 카페",
    category: "카페/디저트",
    distanceText: "290m",
    priceLevel: "₩₩",
    rating: 4.4,
    isOpen: true,
    menuItems: ["커피", "케이크", "마카롱", "빙수"],
    isBookmarked: false,
  },
  {
    id: "7",
    name: "치킨 마스터",
    category: "치킨",
    distanceText: "640m",
    priceLevel: "₩₩",
    rating: 4.7,
    isOpen: true,
    menuItems: ["치킨", "양념치킨", "후라이드치킨"],
    isBookmarked: false,
  },
  {
    id: "8",
    name: "피자 플래닛",
    category: "피자",
    distanceText: "450m",
    priceLevel: "₩₩₩",
    rating: 4.1,
    isOpen: true,
    menuItems: ["피자", "파스타", "샐러드"],
    isBookmarked: false,
  },
  {
    id: "9",
    name: "버거킹덤",
    category: "버거",
    distanceText: "330m",
    priceLevel: "₩₩",
    rating: 4.3,
    isOpen: true,
    menuItems: ["햄버거", "감자튀김", "치킨너겟"],
    isBookmarked: false,
  },
  {
    id: "10",
    name: "쌀국수 하우스",
    category: "베트남/태국",
    distanceText: "570m",
    priceLevel: "₩₩",
    rating: 4.6,
    isOpen: false,
    menuItems: ["쌀국수", "분짜", "반미", "월남쌈"],
    isBookmarked: false,
  },
  {
    id: "11",
    name: "인도 커리",
    category: "인도/네팔",
    distanceText: "820m",
    priceLevel: "₩₩",
    rating: 4.4,
    isOpen: true,
    menuItems: ["인도 커리", "난", "탄두리 치킨", "비리야니"],
    isBookmarked: false,
  },
  {
    id: "12",
    name: "타코 벨",
    category: "멕시칸",
    distanceText: "720m",
    priceLevel: "₩₩₩",
    rating: 4.2,
    isOpen: true,
    menuItems: ["타코", "부리또", "케밥"],
    isBookmarked: false,
  },
  {
    id: "13",
    name: "라면 천국",
    category: "한식",
    distanceText: "410m",
    priceLevel: "₩",
    rating: 4.0,
    isOpen: true,
    menuItems: ["라면", "김밥", "떡볶이"],
    isBookmarked: false,
  },
  {
    id: "14",
    name: "삼겹살 명가",
    category: "한식",
    distanceText: "630m",
    priceLevel: "₩₩₩",
    rating: 4.9,
    isOpen: true,
    menuItems: ["삼겹살", "갈비", "냉면", "된장찌개"],
    isBookmarked: false,
  },
  {
    id: "15",
    name: "마라탕 천국",
    category: "중식",
    distanceText: "380m",
    priceLevel: "₩₩",
    rating: 4.5,
    isOpen: true,
    menuItems: ["마라탕", "마라샹궈", "깐풍기"],
    isBookmarked: false,
  },
  {
    id: "16",
    name: "라멘집",
    category: "일식",
    distanceText: "550m",
    priceLevel: "₩₩",
    rating: 4.6,
    isOpen: true,
    menuItems: ["라멘", "돈카츠", "규동", "카레"],
    isBookmarked: false,
  },
  {
    id: "17",
    name: "냉면 명가",
    category: "한식",
    distanceText: "470m",
    priceLevel: "₩₩",
    rating: 4.7,
    isOpen: true,
    menuItems: ["냉면", "막국수", "칼국수", "만두"],
    isBookmarked: false,
  },
  {
    id: "18",
    name: "족발 보쌈",
    category: "한식",
    distanceText: "690m",
    priceLevel: "₩₩₩",
    rating: 4.4,
    isOpen: true,
    menuItems: ["족발", "보쌈", "쌈밥"],
    isBookmarked: false,
  },
  {
    id: "19",
    name: "찜닭 골목",
    category: "한식",
    distanceText: "510m",
    priceLevel: "₩₩",
    rating: 4.3,
    isOpen: true,
    menuItems: ["찜닭", "닭갈비"],
    isBookmarked: false,
  },
  {
    id: "20",
    name: "똠얌꿍",
    category: "베트남/태국",
    distanceText: "840m",
    priceLevel: "₩₩",
    rating: 4.5,
    isOpen: true,
    menuItems: ["똠얌꿍", "팟타이", "카오팟"],
    isBookmarked: false,
  },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "map">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [searchedFood, setSearchedFood] = useState<string | null>(null);
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

  const handleFindNearby = (foodItem: string) => {
    // 선택된 음식을 파는 식당 찾기
    setSearchedFood(foodItem);
    setSelectedCategory(null);
    setCurrentScreen("map");
  };

  const handleShowNearbyRestaurants = () => {
    // 내 주위 음식점 보기
    setSearchedFood(null);
    setSelectedCategory(null);
    setCurrentScreen("map");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setSearchedFood(null);
    setSelectedCategory(null);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleBookmark = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId ? { ...r, isBookmarked: !r.isBookmarked } : r
      )
    );
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant?.isBookmarked) {
      showToast("즐겨찾기에서 제거되었습니다.", "info");
    } else {
      showToast("즐겨찾기에 추가되었습니다.");
    }
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
          {currentScreen === "home" && (
            <HomeScreen
              foodItems={FOOD_ITEMS}
              onFindNearby={handleFindNearby}
              onShowNearbyRestaurants={handleShowNearbyRestaurants}
            />
          )}

          {currentScreen === "map" && (
            <MapScreen
              categories={CATEGORIES}
              restaurants={restaurants}
              initialCategory={selectedCategory}
              searchedFood={searchedFood}
              onRestaurantClick={handleRestaurantClick}
              hasLocationPermission={true}
              onClearSearch={() => setSearchedFood(null)}
              onBackToHome={handleBackToHome}
            />
          )}
        </div>

        {/* Restaurant Detail Modal */}
        <AnimatePresence>
          {selectedRestaurant && (
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
              onBookmark={() => handleBookmark(selectedRestaurant.id)}
            />
          )}
        </AnimatePresence>

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
