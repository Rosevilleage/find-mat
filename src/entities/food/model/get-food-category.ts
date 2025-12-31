// 음식 이름으로 카테고리 매핑
export function getFoodCategory(foodName: string): string {
  const lowerFood = foodName.toLowerCase();

  // 한식
  if (
    lowerFood.includes("김치") ||
    lowerFood.includes("된장") ||
    lowerFood.includes("비빔밥") ||
    lowerFood.includes("불고기") ||
    lowerFood.includes("삼겹살") ||
    lowerFood.includes("갈비") ||
    lowerFood.includes("설렁탕") ||
    lowerFood.includes("육개장") ||
    lowerFood.includes("삼계탕") ||
    lowerFood.includes("순두부") ||
    lowerFood.includes("백반") ||
    lowerFood.includes("쌈밥") ||
    lowerFood.includes("보쌈") ||
    lowerFood.includes("족발")
  ) {
    return "한식";
  }

  // 중식
  if (
    lowerFood.includes("짜장") ||
    lowerFood.includes("짬뽕") ||
    lowerFood.includes("탕수육") ||
    lowerFood.includes("양장피") ||
    lowerFood.includes("마라") ||
    lowerFood.includes("깐풍") ||
    lowerFood.includes("유산슬") ||
    lowerFood.includes("중국") ||
    lowerFood.includes("볶음밥")
  ) {
    return "중식";
  }

  // 일식
  if (
    lowerFood.includes("초밥") ||
    lowerFood.includes("라멘") ||
    lowerFood.includes("돈카츠") ||
    lowerFood.includes("우동") ||
    lowerFood.includes("오코노미") ||
    lowerFood.includes("타코야키") ||
    lowerFood.includes("규동") ||
    lowerFood.includes("회") ||
    lowerFood.includes("사시미")
  ) {
    return "일식";
  }

  // 양식
  if (
    lowerFood.includes("스테이크") ||
    lowerFood.includes("리조또") ||
    lowerFood.includes("샐러드") ||
    lowerFood.includes("스프") ||
    lowerFood.includes("파스타")
  ) {
    return "양식";
  }

  // 치킨
  if (
    lowerFood.includes("치킨") ||
    lowerFood.includes("닭") ||
    lowerFood.includes("탄두리")
  ) {
    return "치킨";
  }

  // 피자
  if (lowerFood.includes("피자")) {
    return "피자";
  }

  // 햄버거/버거
  if (
    lowerFood.includes("햄버거") ||
    lowerFood.includes("버거") ||
    lowerFood.includes("샌드위치")
  ) {
    return "버거";
  }

  // 분식
  if (
    lowerFood.includes("떡볶이") ||
    lowerFood.includes("순대") ||
    lowerFood.includes("튀김") ||
    lowerFood.includes("김밥") ||
    lowerFood.includes("어묵") ||
    lowerFood.includes("만두")
  ) {
    return "분식";
  }

  // 면 요리 (베트남/태국)
  if (
    lowerFood.includes("라면") ||
    lowerFood.includes("쌀국수") ||
    lowerFood.includes("팟타이") ||
    lowerFood.includes("냉면") ||
    lowerFood.includes("막국수") ||
    lowerFood.includes("칼국수") ||
    lowerFood.includes("수제비") ||
    lowerFood.includes("분짜")
  ) {
    return "베트남/태국";
  }

  // 커리 (인도/네팔)
  if (
    lowerFood.includes("커리") ||
    lowerFood.includes("카레") ||
    lowerFood.includes("비리야니") ||
    lowerFood.includes("난")
  ) {
    return "인도/네팔";
  }

  // 멕시칸
  if (
    lowerFood.includes("타코") ||
    lowerFood.includes("부리또") ||
    lowerFood.includes("케밥")
  ) {
    return "멕시칸";
  }

  // 카페/디저트
  if (
    lowerFood.includes("카페") ||
    lowerFood.includes("디저트") ||
    lowerFood.includes("케이크") ||
    lowerFood.includes("커피") ||
    lowerFood.includes("음료")
  ) {
    return "카페/디저트";
  }

  return "기타";
}

