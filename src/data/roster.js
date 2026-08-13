export const ROSTER = [
  { team: 1, name: "김선웅", dept: "크리에이티브팀", title: "과장" },
  { team: 1, name: "김윤회", dept: "IMC 3팀", title: "대리" },
  { team: 1, name: "남정현", dept: "IMC 4팀", title: "주임" },
  { team: 1, name: "권민영", dept: "IMC 1팀", title: "주임" },
  { team: 1, name: "이지원", dept: "경영관리팀", title: "사원" },
  { team: 2, name: "김주영", dept: "크리에이티브팀", title: "팀장" },
  { team: 2, name: "유중익", dept: "BX팀", title: "팀장" },
  { team: 2, name: "김현지", dept: "IMC 4팀", title: "사원" },
  { team: 2, name: "조희원", dept: "브랜드그로스팀", title: "사원" },
  { team: 3, name: "우석환", dept: "IMC 1그룹", title: "그룹장" },
  { team: 3, name: "김병주", dept: "크리에이티브팀", title: "과장" },
  { team: 3, name: "전다솜", dept: "IMC 4팀", title: "대리" },
  { team: 3, name: "김성윤", dept: "IMC 1팀", title: "사원" },
  { team: 3, name: "조혜수", dept: "IMC 3팀", title: "사원" },
  { team: 4, name: "김보령", dept: "IMC 1팀", title: "팀장" },
  { team: 4, name: "박한별", dept: "경영관리팀", title: "과장" },
  { team: 4, name: "홍연진", dept: "크리에이티브팀", title: "대리" },
  { team: 4, name: "전민지", dept: "IMC 3팀", title: "사원" },
  { team: 4, name: "이시형", dept: "IMC 2팀", title: "사원" },
  { team: 5, name: "이유진", dept: "IMC 2그룹", title: "그룹장" },
  { team: 5, name: "에네렐", dept: "IMC 3팀", title: "대리" },
  { team: 5, name: "정채린", dept: "크리에이티브팀", title: "주임" },
  { team: 5, name: "류지호", dept: "IMC 1팀", title: "주임" },
  { team: 5, name: "손유정", dept: "IMC 2팀", title: "사원" },
  { team: 6, name: "황세진", dept: "경영관리팀", title: "팀장" },
  { team: 6, name: "김은지", dept: "브랜드그로스팀", title: "대리" },
  { team: 6, name: "구현경", dept: "크리에이티브팀", title: "주임" },
  { team: 6, name: "정서희", dept: "IMC 4팀", title: "주임" },
  { team: 6, name: "장윤미", dept: "IMC 1팀", title: "사원" },
  { team: 7, name: "윤승한", dept: "브랜드그로스팀", title: "팀장" },
  { team: 7, name: "박예린", dept: "IMC 1팀", title: "대리" },
  { team: 7, name: "이대윤", dept: "크리에이티브팀", title: "주임" },
  { team: 7, name: "노혜리", dept: "IMC 2팀", title: "사원" },
  { team: 7, name: "유현규", dept: "IMC 3팀", title: "사원" },
  { team: 8, name: "장지현", "dept": "IMC 3팀", title: "팀장" },
  { team: 8, name: "이예슬", "dept": "IMC 2팀", title: "대리" },
  { team: 8, name: "권소정", "dept": "경영관리팀", title: "주임" },
  { team: 8, name: "김현주", "dept": "크리에이티브팀", title: "주임" },
  { team: 8, name: "강현경", "dept": "BX팀", title: "사원" },
  { team: 9, name: "장현제", "dept": "IMC 2팀", title: "팀장" },
  { team: 9, name: "오창협", "dept": "크리에이티브팀", title: "대리" },
  { team: 9, name: "심아영", "dept": "BX팀", title: "대리" },
  { team: 9, name: "강모세", "dept": "브랜드그로스팀", title: "주임" },
  { team: 9, name: "이예진", "dept": "IMC 4팀", title: "사원" }
];

export const TOTAL_PARTICIPANTS = ROSTER.length; // 44

export function getParticipantKey(p) {
  return `${p.team}_${p.name}`;
}

export function findParticipant(name, team) {
  return ROSTER.find(p => p.name === name && (team ? p.team === Number(team) : true));
}
