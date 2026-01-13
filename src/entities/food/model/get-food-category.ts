// 음식 이름으로 카테고리 매핑
export function getFoodCategory(foodName: string): string {
  const lowerFood = foodName.toLowerCase();

  // 1. 한식
  if (
    lowerFood.includes("비빔밥") ||
    lowerFood.includes("김치") ||
    lowerFood.includes("된장") ||
    lowerFood.includes("순두부") ||
    lowerFood.includes("부대찌개") ||
    lowerFood.includes("삼겹살") ||
    lowerFood.includes("불고기") ||
    lowerFood.includes("제육") ||
    lowerFood.includes("오징어볶음") ||
    lowerFood.includes("갈비찜") ||
    lowerFood.includes("닭볶음탕") ||
    lowerFood.includes("닭갈비") ||
    lowerFood.includes("김치볶음밥") ||
    lowerFood.includes("잡채") ||
    lowerFood.includes("육회") ||
    lowerFood.includes("냉면") ||
    lowerFood.includes("칼국수") ||
    lowerFood.includes("수제비") ||
    lowerFood.includes("설렁탕") ||
    lowerFood.includes("곰탕") ||
    lowerFood.includes("갈비탕") ||
    lowerFood.includes("떡국") ||
    lowerFood.includes("죽") ||
    lowerFood.includes("전") ||
    lowerFood.includes("국밥") ||
    lowerFood.includes("백반") ||
    lowerFood.includes("쌈밥") ||
    lowerFood.includes("보쌈") ||
    lowerFood.includes("족발")
  ) {
    return "한식";
  }

  // 2. 중식
  if (
    lowerFood.includes("짜장") ||
    lowerFood.includes("짬뽕") ||
    lowerFood.includes("탕수육") ||
    lowerFood.includes("깐풍") ||
    lowerFood.includes("유린기") ||
    lowerFood.includes("마파두부") ||
    lowerFood.includes("마라") ||
    lowerFood.includes("훠궈") ||
    lowerFood.includes("양장피") ||
    lowerFood.includes("팔보채") ||
    lowerFood.includes("고추잡채") ||
    lowerFood.includes("동파육") ||
    lowerFood.includes("중국")
  ) {
    return "중식";
  }

  // 3. 일식
  if (
    lowerFood.includes("초밥") ||
    lowerFood.includes("사시미") ||
    lowerFood.includes("덮밥") ||
    lowerFood.includes("돈카츠") ||
    lowerFood.includes("라멘") ||
    lowerFood.includes("우동") ||
    lowerFood.includes("소바") ||
    lowerFood.includes("나베") ||
    lowerFood.includes("오코노미") ||
    lowerFood.includes("타코야키") ||
    lowerFood.includes("가라아게") ||
    lowerFood.includes("장어덮밥") ||
    lowerFood.includes("규동")
  ) {
    return "일식";
  }

  // 4. 양식
  if (
    lowerFood.includes("스테이크") ||
    lowerFood.includes("파스타") ||
    lowerFood.includes("리조또") ||
    lowerFood.includes("피자") ||
    lowerFood.includes("햄버거") ||
    lowerFood.includes("샌드위치") ||
    lowerFood.includes("브런치") ||
    lowerFood.includes("그라탕") ||
    lowerFood.includes("오믈렛")
  ) {
    return "양식";
  }

  // 5. 아시안 / 세계요리
  if (
    lowerFood.includes("쌀국수") ||
    lowerFood.includes("베트남") ||
    lowerFood.includes("태국") ||
    lowerFood.includes("팟타이") ||
    lowerFood.includes("똠얌") ||
    lowerFood.includes("월남") ||
    lowerFood.includes("분짜") ||
    lowerFood.includes("반미") ||
    lowerFood.includes("인도") ||
    lowerFood.includes("커리") ||
    lowerFood.includes("카레") ||
    lowerFood.includes("난") ||
    lowerFood.includes("탄두리") ||
    lowerFood.includes("비리야니") ||
    lowerFood.includes("인도네시아") ||
    lowerFood.includes("중동") ||
    lowerFood.includes("케밥")
  ) {
    return "아시안";
  }

  // 6. 패스트푸드
  if (
    lowerFood.includes("치킨") ||
    lowerFood.includes("핫도그") ||
    lowerFood.includes("감자튀김") ||
    lowerFood.includes("토스트") ||
    lowerFood.includes("컵밥") ||
    lowerFood.includes("주먹밥")
  ) {
    return "패스트푸드";
  }

  // 7. 분식 / 길거리 음식
  if (
    lowerFood.includes("떡볶이") ||
    lowerFood.includes("순대") ||
    lowerFood.includes("김밥") ||
    lowerFood.includes("튀김") ||
    lowerFood.includes("라볶이") ||
    lowerFood.includes("핫바") ||
    lowerFood.includes("어묵") ||
    lowerFood.includes("계란빵") ||
    lowerFood.includes("호떡") ||
    lowerFood.includes("붕어빵") ||
    lowerFood.includes("만두")
  ) {
    return "분식";
  }

  // 8. 해산물
  if (
    lowerFood.includes("회") ||
    lowerFood.includes("매운탕") ||
    lowerFood.includes("해물탕") ||
    lowerFood.includes("해물찜") ||
    lowerFood.includes("조개구이") ||
    lowerFood.includes("생선구이") ||
    lowerFood.includes("장어구이") ||
    lowerFood.includes("게") ||
    lowerFood.includes("해산물")
  ) {
    return "해산물";
  }

  // 9. 고기 전문
  if (
    lowerFood.includes("소고기구이") ||
    lowerFood.includes("돼지고기구이") ||
    lowerFood.includes("양고기") ||
    lowerFood.includes("차돌박이") ||
    lowerFood.includes("우삼겹") ||
    lowerFood.includes("항정살") ||
    lowerFood.includes("오리") ||
    lowerFood.includes("갈비") ||
    lowerFood.includes("고기")
  ) {
    return "고기";
  }

  // 10. 샐러드 / 건강식
  if (lowerFood.includes("샐러드") || lowerFood.includes("포케")) {
    return "샐러드";
  }

  // 11. 기타
  if (lowerFood.includes("도시락") || lowerFood.includes("정식")) {
    return "기타";
  }

  return "기타";
}
