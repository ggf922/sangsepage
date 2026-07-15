// ============================================================
// Korean (한국어) Dictionary
// ============================================================

export interface Dictionary {
  common: Record<string, string>;
  brand: Record<string, string>;
  auth: Record<string, string>;
  nav: Record<string, string>;
  points: Record<string, string>;
  charge: Record<string, string>;
  products: Record<string, string>;
  generate: Record<string, string>;
  pages: {
    title: string;
    subtitle: string;
    empty: string;
    createFirst: string;
    status: {
      draft: string;
      generating: string;
      completed: string;
      failed: string;
    };
    pointsUsed: string;
    editCount: string;
    imageCount: string;
    shareId: string;
    downloadHtml: string;
    editPage: string;
    editRemaining: string;
    editModeCopy: string;
    editModeImages: string;
    editModeAll: string;
  };
  admin: Record<string, string>;
  templates: {
    A: { name: string; description: string };
    B: { name: string; description: string };
    C: { name: string; description: string };
    D: { name: string; description: string };
    E: { name: string; description: string };
  };
}

export const ko: Dictionary = {
  // Common
  common: {
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "수정",
    confirm: "확인",
    close: "닫기",
    back: "돌아가기",
    next: "다음",
    previous: "이전",
    submit: "제출",
    loading: "불러오는 중...",
    processing: "처리 중...",
    success: "성공",
    error: "오류",
    warning: "경고",
    info: "안내",
    yes: "예",
    no: "아니오",
    search: "검색",
    filter: "필터",
    all: "전체",
    none: "없음",
    optional: "선택",
    required: "필수",
    copy: "복사",
    copied: "복사됨",
    download: "다운로드",
    upload: "업로드",
    preview: "미리보기",
    share: "공유",
    logout: "로그아웃",
    login: "로그인",
    signup: "회원가입",
    home: "홈",
    dashboard: "대시보드",
    admin: "관리자",
    mypage: "마이페이지",
    settings: "설정",
    help: "도움말",
    contact: "문의",
    language: "언어",
  },

  // Brand
  brand: {
    name: "상세페이지",
    fullName: "SangSePage",
    tagline: "AI로 완성하는 한국형 상세페이지",
    description:
      "5가지 스타일 템플릿, 4개국어 지원. 30P부터 시작하는 프로급 상세페이지 자동 생성 서비스",
  },

  // Auth
  auth: {
    email: "이메일",
    password: "비밀번호",
    passwordConfirm: "비밀번호 확인",
    name: "이름",
    loginTitle: "로그인",
    loginSubtitle: "상세페이지 서비스에 오신 것을 환영합니다",
    signupTitle: "회원가입",
    signupSubtitle: "가입 즉시 100P 무료 지급",
    signupBonus: "가입 축하 100P 즉시 지급",
    forgotPassword: "비밀번호를 잊으셨나요?",
    dontHaveAccount: "아직 계정이 없으신가요?",
    alreadyHaveAccount: "이미 계정이 있으신가요?",
    loginButton: "로그인",
    signupButton: "회원가입 하고 100P 받기",
    logoutConfirm: "로그아웃 하시겠습니까?",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다",
  },

  // Navigation (Dashboard)
  nav: {
    dashboard: "홈",
    products: "상품 관리",
    generate: "페이지 생성",
    pages: "내 페이지",
    mypage: "마이페이지",
    charge: "포인트 충전",
    history: "이용 내역",
    admin: "관리자",
  },

  // Points
  points: {
    balance: "보유 포인트",
    unit: "P",
    used: "사용",
    charged: "충전",
    refunded: "환불",
    bonus: "보너스",
    generatePage: "페이지 생성",
    editPage: "페이지 수정",
    languageAdd: "언어 추가",
    signupBonus: "가입 축하 보너스",
    perPage: "페이지당 30P",
    perEdit: "수정당 5~10P (최대 3회)",
    perLanguage: "언어당 20P",
    insufficientPoints: "포인트가 부족합니다",
    chargeNow: "지금 충전하기",
  },

  // Charge (무통장입금)
  charge: {
    title: "포인트 충전",
    subtitle: "무통장 입금 후 관리자 승인 시 즉시 반영됩니다",
    bankInfo: "입금 계좌 안내",
    bankName: "은행",
    accountNumber: "계좌번호",
    accountHolder: "예금주",
    copyAccount: "계좌번호 복사",
    selectPackage: "패키지 선택",
    customAmount: "직접 금액 입력",
    depositorName: "입금자명",
    depositorNamePlaceholder: "실제 입금자 성함을 입력하세요",
    contact: "연락처",
    contactPlaceholder: "010-0000-0000 (선택)",
    memo: "메모",
    memoPlaceholder: "관리자에게 전달할 메모 (선택)",
    agreement: "무통장 입금 방식 및 관리자 승인 후 포인트가 지급됨을 확인합니다",
    submitButton: "충전 신청",
    pendingList: "대기 중인 충전 신청",
    noPending: "대기 중인 신청이 없습니다",
    warningTitle: "입금 시 주의사항",
    warning1: "입금자명을 반드시 정확히 입력해 주세요",
    warning2: "입금 확인 후 관리자 승인까지 영업일 기준 1일 소요됩니다",
    warning3: "미입금 상태로 3일 경과 시 자동 취소됩니다",
    maxPending: "대기 중인 신청은 최대 3건까지 가능합니다",
  },

  // Products
  products: {
    title: "상품 관리",
    subtitle: "상세페이지를 생성할 상품 정보를 관리하세요",
    newProduct: "새 상품",
    productName: "상품명",
    productDescription: "상품 설명",
    price: "가격",
    salesChannels: "판매 채널",
    images: "이미지",
    ingredients: "원재료",
    features: "특징",
    empty: "등록된 상품이 없습니다",
    createFirst: "첫 상품 등록하기",
  },

  // Generate
  generate: {
    title: "상세페이지 생성",
    subtitle: "AI가 30초 안에 프로급 상세페이지를 완성합니다",
    step1: "상품 선택",
    step2: "템플릿 선택",
    step3: "언어 및 옵션",
    step4: "확인 및 생성",
    selectProduct: "생성할 상품을 선택하세요",
    selectTemplate: "스타일 템플릿을 선택하세요",
    selectLanguage: "생성할 언어를 선택하세요",
    imageQuality: "이미지 품질",
    nanoBanana: "Nano Banana (기본)",
    nanoBananaPro: "Nano Banana Pro (고품질)",
    generateButton: "생성하기",
    generating: "생성 중...",
    generatingCopy: "카피 문구 작성 중...",
    generatingImages: "이미지 생성 중...",
    finalizing: "마무리 중...",
    successTitle: "생성 완료!",
    failTitle: "생성 실패",
    refundNotice: "사용하신 포인트는 자동으로 환불되었습니다",
  },

  // Pages
  pages: {
    title: "내 페이지",
    subtitle: "생성한 상세페이지 목록",
    empty: "아직 생성한 페이지가 없습니다",
    createFirst: "첫 페이지 만들기",
    status: {
      draft: "임시저장",
      generating: "생성 중",
      completed: "완료",
      failed: "실패",
    },
    pointsUsed: "사용 포인트",
    editCount: "수정 횟수",
    imageCount: "이미지 수",
    shareId: "공유 ID",
    downloadHtml: "HTML 다운로드",
    editPage: "페이지 수정",
    editRemaining: "남은 수정 횟수",
    editModeCopy: "카피만 재생성",
    editModeImages: "이미지만 재생성",
    editModeAll: "전체 재생성",
  },

  // Admin
  admin: {
    title: "관리자 대시보드",
    users: "회원 관리",
    templates: "템플릿 관리",
    pages: "페이지 모니터링",
    charges: "충전 승인",
    analytics: "통계",
    points: "포인트 패키지",
    pendingCharges: "대기 중인 충전 승인",
    approve: "승인",
    reject: "반려",
    adminMemo: "관리자 메모",
    revenueTotal: "누적 매출",
  },

  // Templates
  templates: {
    A: { name: "김치·오가미", description: "따뜻하고 정겨운 한국 전통 식품 스타일" },
    B: { name: "생활용품", description: "실용적이고 깔끔한 생활용품 스타일" },
    C: { name: "전자제품", description: "모던하고 세련된 IT/전자제품 스타일" },
    D: { name: "건강식품", description: "믿음직스러운 건강기능식품 스타일" },
    E: { name: "화장품", description: "우아하고 감성적인 뷰티 스타일" },
  },
};
