'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

// --- [타입 정의] ---
type RecordType = {
  id: number;
  situation: string;
  metaphor: string;
  score: number;
  comment: string;
};

// --- [데이터: 문제 리스트] ---
const questions = [
// 🎮 챕터 1: 게임 & IT
  "2D 비주얼이 최고라고 자랑한 게임이 알고 보니 AI를 사용해서 일러스트를 그림",
  "무료로 저퀄리티 웹게임 하러 왔는데 개발자가 후원해달라면서 바짓가랑이 붙잡음",
  "확률형 아이템 확률을 '영업 비밀'이라며 공개 거부하다가 0%인 게 걸림",
  "서버 안정화 점검한다고 했는데 점검 끝나니 렉이 더 심해짐",
  "10년 동안 키운 캐릭터가 밸런스 패치 한 방에 쓰레기가 됨",
  "신규 유저 유입시킨다며 기존 유저가 힘들게 얻은 장비를 공짜로 뿌림",
  "자유도 높은 오픈월드라고 광고했는데 갈 수 있는 곳이 일자형 통로밖에 없음",
  "환불해달라고 문의 넣었더니 '이미 사용한 재화(로그인함)'라며 거절당함",
  "모바일 게임 광고 보고 설치했는데, 광고랑 아예 다른 퍼즐 게임임",
  "무료 게임이라고 해서 샀는데 부품 조립하는 것 마냥 유료 DLC 여러 개를 사야 함",
  "게임 속 재화 가치가 폭락해서 사과 보상으로 휴지 조각 같은 아이템 줌",
  "업데이트 로드맵 발표했는데 1년째 '준비 중' 페이지만 떠 있음",
  "내 계정이 해킹당해서 복구 신청했는데 '본인 확인 불가'라며 영구 정지 때림",
  "콘솔 게임기 신제품 샀는데 조이패드가 3일 만에 고장 남 (A/S 불가)",
  "버그 제보해주시면 사례함 써놓고 제보하니까 내 계정 정지시킴 (악용 의심)",
  "강화 확률 99%에서 5연속 실패함",
  "게임 용량이 200GB인데 내용은 텍스처 복붙이라 최적화 개판임",
  "한정판 스킨이라 30만 원 주고 샀는데 다음 달에 이벤트로 공짜로 풀림",
  "게임 삭제하려고 보니 삭제 버튼이 숨겨져 있어서 레지스트리 건드려야 함",
  "롤(LoL) 승급전에서 넥서스 깨기 직전인데, '선불 시간 종료'라며 컴퓨터가 툭 꺼져버린 상황",

  // 💸 챕터 2: 경제 & 소비
  "친구가 무조건 오르는 주식 종목이라고 해서 샀는데 수익률 -50% 찍음",
  "전 품목 50% '창고 대방출' 할인이라더니 어제 가격표를 2배로 올려둠",
  "헬스장 1년 치 현금 할인받아 결제했는데 다음 날 헬스장이 야반도주함",
  "택시 기사가 '지름길로 가겠다'더니 동네 두 바퀴 돌아서 요금 2배 나옴",
  "중고 거래로 닌텐도 샀는데 벽돌이 옴 (근데 착불임)",
  "월 구독 서비스 해지하려고 보니 '해지 버튼'이 찾을 수 없는 곳에 있음",
  "당첨! 최신폰 무료 교체 전화받고 갔더니 48개월 할부 계약서 내밈",
  "배달비 아까워서 포장 주문했는데 포장 용기 값을 따로 받음",
  "무한리필 고기집 갔는데 리필 고기가 대패 삼겹살 찌꺼기임",
  "미용실에서 '다듬어만 주세요' 했는데 삭발 수준으로 잘라놓음",
  "로또 1등 당첨된 꿈꾸고 샀는데 번호 하나 차이로 다 빗나감",
  "최저가 항공권 예약했는데 수하물 추가 비용이 비행기 표보다 비쌈",
  "오늘만 이 가격 홈쇼핑 보고 샀는데 인터넷 최저가가 더 쌈",
  "워터파크 개장해서 갔는데 물 반 사람 반이라 물에 몸도 못 담그고 옴",
  "편의점 1+1 행사 상품 집었는데 계산할 때 보니 '행사 종료' 상품임",
  "인형 뽑기 기계 집게 힘이 너무 약해서 인형을 쓰다듬기만 함",
  "유명 맛집 줄 서서 2시간 기다렸는데 내 앞에서 재료 소진됨",
  "렌터카 반납하려는데 있지도 않은 기스 트집 잡아서 수리비 청구함",
  "영화관 팝콘 라지 사이즈 시켰는데 통의 절반이 비어있음",

  // 🏢 챕터 3: 학교 & 회사
  "조별 과제 자료조사하겠다는 팀원이 자료를 나무위키 링크 하나 보냄",
  "가족 같은 회사라고 해서 들어갔더니 진짜 내 집처럼 야근시킴 (돈 안 줌)",
  "상사가 자기 실수해놓고 나한테 '왜 미리 체크 안 했냐'며 뒤집어씌움",
  "금요일 오후 5시 50분에 부장님이 '간단한 업무'라며 일 던져줌",
  "교수님이 '오픈북 시험'이라더니 교재에 없는 내용만 문제로 냄",
  "연봉 협상 때 '회사가 어렵다'며 동결하더니 사장님 차가 바뀜",
  "휴가 결재 다 받았는데 출발 당일에 '급한 일 생겼다'며 복귀 명령 떨어짐",
  "인턴한테 '배우는 과정'이라며 정직원 업무량 떠넘기고 월급은 식대만 줌",
  "점심 회식하자고 해서 좋아했는데 메뉴가 구내식당임",
  "자율 복장이라더니 청바지 입고 가니까 '예의가 없다'고 꼽줌",
  "퇴사 통보하니까 '업계 좁다'면서 협박함",
  "엘리베이터 수리 중이라 15층까지 계단으로 올라갔는데 마스크 두고 옴",
  "팀장님이 'MZ세대는 이해가 안 가'라며 2시간 동안 훈계함",
  "회사 컴퓨터가 10년 전 모델이라 엑셀 하나 켜는데 5분 걸림",
  "칼퇴 보장 공고 보고 왔는데 6시에 퇴근하면 눈치 줌",
  "탕비실 간식 믹스커피밖에 없는데 사장님은 스타벅스 마시고 있음",
  "질문 있는 사람? 해서 질문했더니 '수업 안 들었냐'고 혼남",
  "주말에 등산 가자고 하는 부장님 (거절 시 인사고과 반영 느낌)",
  "월급날 통장 봤는데 세금 떼고 나니 스쳐 지나감",
  "공모전 수상작 없다고 상금 안 주고 아이디어만 가져감",
  "예비군 훈련 갔는데 식비 8천 원 주고 도시락은 3천 원짜리 줌",
  "취업 박람회 갔는데 상담하는 사람이 다단계 권유함",

  // 💔 챕터 4: 일상 & 기타
  "소개팅 나갔는데 상대방이 주선자 욕만 1시간 하다가 집에 감",
  "친구비 입금 안 했다고 단톡방에서 강퇴당함",
  "생일 선물로 기프티콘 받았는데 유효기간 지난 거였음",
  "짝사랑하던 상대가 내 제일 친한 친구랑 사귐",
  "10년 만에 연락 온 동창이 결혼식 사회 봐달라고 함 (축의금도 내라 함)",
  "미용실에서 머리 망쳤는데 디자이너가 '손님 이건 고데기예요' 시전",
  "비 오는 날 우산 썼는데 구멍 나서 비 다 맞음",
  "다이어트한다고 닭가슴살 10kg 샀는데 3일 만에 치킨 시킴",
  "버스 놓쳐서 택시 탔는데 택시가 막혀서 버스보다 늦게 도착함",
  "화장실 급해서 들어갔는데 휴지가 없음",
  "맛집 블로그 믿고 갔는데 주인이 블로거한테 돈 주고 쓴 글이었음",
  "중고차 샀는데 침수차였음 (딜러 연락 두절)",
  "헬스장 트레이너가 PT 안 받는다고 인사도 안 받아줌",
  "비싼 돈 주고 퍼스널 컬러 진단받았는데 '그냥 다 잘 어울려요' 소리 들음",
  "지하철 옆자리 사람이 내 어깨를 베개로 씀 (깨워도 다시 잠)",
  "이어폰 한쪽 잃어버려서 새로 샀는데 반대쪽 잃어버림",
  "배달 음식 시켰는데 문 앞에 두지 말고 벨 누르지 말고 노크해달라는 요청 무시당함",
  "여름 휴가 때 태풍 와서 숙소 안에만 갇혀 있음",
  "모기가 귓가에서 앵앵거리는데 불 켜면 안 보임",
  "공중화장실 줄 서 있는데 새치기하는 할머니 ('노인네가 급해서 그래!')",
  "아파트 층간소음 항의하러 갔더니 '우리 집엔 애 없어요'라는데 쿵쿵거림",
  "개 산책에 목줄 안하고 다니는 견주가 '우리 개는 안 물어요' 시전함",
  "당근마켓 무료 나눔 하러 나갔는데 상대방이 '차비 좀 주세요' 함",
  "길 가다가 도를 아십니까 만나서 30분 잡혀있음",
  "1년 동안 짝사랑한 상대에게 고백했는데 '너 게이 아니었어?' 소리 들음"
];

export default function Home() {
  // 탭 상태: 'game' | 'rank'
  const [activeTab, setActiveTab] = useState<'game' | 'rank'>('game');
  
  // 게임 관련 상태
  const [question, setQuestion] = useState(questions[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; comment: string } | null>(null);

  const [copied, setCopied] = useState(false);

  // 2. 본인 계좌번호 (여기를 수정하세요!)
  const ACCOUNT_NUMBER = "토스뱅크 1908-8697-9909 안*회"; 

  // 3. 복사 기능 함수
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER); // 클립보드에 복사
    setCopied(true); // "복사됨!" 상태로 변경
    setTimeout(() => setCopied(false), 2000); // 2초 뒤에 다시 원래대로 복구
  };
  
  
  // 명예의 전당 데이터 (전체)
  const [allRanks, setAllRanks] = useState<Record<string, RecordType[]>>({});

  // 1. 명예의 전당 탭 누르면 데이터 가져오기
  useEffect(() => {
    if (activeTab === 'rank') {
      fetchAllRankings();
    }
  }, [activeTab]);

  // 2. 전체 랭킹 가져와서 문제별로 그룹화하는 함수
  const fetchAllRankings = async () => {
    // 점수 높은 순으로 90점 이상만 싹 긁어옴
    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('*')
      .gte('score', 90)
      .order('score', { ascending: false });

    if (error) {
      console.error("랭킹 로딩 실패:", error);
      return;
    }

    // 데이터를 문제(Situation)별로 묶기
    const grouped: Record<string, RecordType[]> = {};
    
    // 문제 리스트 순서대로 초기화 (순서 보장용)
    questions.forEach(q => grouped[q] = []);

    // 데이터 채워넣기
    data?.forEach((item: RecordType) => {
      if (!grouped[item.situation]) grouped[item.situation] = [];
      // 각 문제당 상위 3개만 저장
      if (grouped[item.situation].length < 3) {
        grouped[item.situation].push(item);
      }
    });

    setAllRanks(grouped);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return alert('입력해라 쌀숭아!');
    setLoading(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        body: JSON.stringify({ situation: question, metaphor: input }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('오류 발생!');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    const random = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(random);
    setResult(null);
    setInput('');
  };
  
  const handleRetry = () => {
    setResult(null); // 결과창 닫기 (문제는 그대로 유지됨)
    setInput('');    // 입력창 비우기 (새로 쓰게)
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      
      {/* 🟢 [헤더] */}
      <header className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-md z-10 border-b border-gray-800 p-4">
        <h1 className="text-2xl font-black text-center text-yellow-400 tracking-tighter drop-shadow-md">
          신창섭의 비유 고사
        </h1>
      </header>

      {/* 🟢 [메인 컨텐츠 영역] */}
      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto min-h-screen">
        
        {/* === 탭 1: 게임 플레이 === */}
        {activeTab === 'game' && (
          <div className="animate-fade-in">
            {/* 문제 카드 */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-6 relative overflow-hidden group">
              
              {/* 상단 뱃지 & 타이틀 */}
              <div className="flex flex-col items-start mb-4">
                <span className="bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  MISSION
                </span>
                
                {/* 👇 [추가됨] 친절한 가이드 멘트 (식당, 교실 비유 추천) */}
                <div className="w-full bg-gray-900/60 border border-gray-600/50 p-3 rounded-xl flex items-start gap-3 mb-4">
                  <span className="text-xl">💡</span>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-yellow-400 font-bold">Tip.</span> 식당 등에 빗대어 <span className="text-white font-bold underline decoration-yellow-500">풍자</span>해보세요!
                  </div>
                </div>

                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 ml-1">
                  다음 상황을 비유해라
                </p>
              </div>

              {/* 문제 텍스트 */}
              <p className="text-xl font-bold leading-relaxed text-gray-100 min-h-[3rem] pl-1">
                {question}
              </p>
              
              {/* 다른 문제 풀기 버튼 */}
              <button 
                onClick={resetGame} 
                className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-500 active:scale-95"
              >
                <span>🎲</span>
                <span>이 문제 말고 다른 거 (랜덤)</span>
              </button>
            </div>

            {/* 결과창 */}
            {result ? (
              <div className="bg-white text-black p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,255,0,0.3)] border-4 border-yellow-400 animate-pop-in">
                
                {/* 👇 [수정됨] 내가 쓴 답안 (검은 바탕 + 흰 글씨) */}
                <div className="mb-6 bg-gray-900 p-5 rounded-xl border-l-4 border-yellow-400 text-left shadow-inner">
                  <p className="text-xs text-yellow-500 font-bold mb-2 tracking-wider">
                    📄 내가 제출한 답안
                  </p>
                  <p className="text-white font-medium text-lg whitespace-pre-wrap break-keep leading-relaxed">
                    "{input}"
                  </p>
                </div>
                {/* 👆 여기까지 수정됨 */}

                <div className="text-center">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Score</p>
                  <span className="text-8xl font-black text-red-600 leading-none">{result.score}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-800 italic break-keep">
                    "{result.comment}"
                  </p>
                </div>
                
                {/* 명예의 전당 유도 버튼 */}
                <button 
                  onClick={() => setActiveTab('rank')}
                  className="w-full mt-6 bg-black text-yellow-400 font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg"
                >
                  🏆 남들은 몇 점일까? (명예의 전당 가기)
                </button>

                <button 
                  onClick={handleRetry}
                  className="w-full mt-3 bg-gray-800 border-2 border-yellow-400 text-yellow-400 font-bold py-3 rounded-xl transition-all hover:bg-gray-700 active:scale-95 flex items-center justify-center gap-2"
                >
                  🔄 아쉬운가? 이 문제 재도전하기
                </button>
              </div>

            ) : (
              /* 입력창 */
              <div className="mb-6">
                <div className="relative">
                  <textarea
                    className="w-full p-4 rounded-xl bg-gray-800 text-white h-40 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500 text-lg shadow-inner"
                    placeholder="예시: 식당에 갔는데 종업원이..."
                    value={input}
                    maxLength={100}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                  />
                  {/* 글자수 카운터 */}
                  <div className={`absolute bottom-4 right-4 text-sm font-bold ${input.length >= 100 ? 'text-red-500' : 'text-gray-500'}`}>
                    {input.length} / 100자
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || input.length === 0}
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '채점 중... (정상화)' : '제출하고 평가받기'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* === 탭 2: 명예의 전당 (스크롤 뷰) === */}
        {activeTab === 'rank' && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-1">🏆 명예의 전당</h2>
              <p className="text-gray-400 text-sm">신창섭이 인정한 상위 1%의 드립들</p>
            </div>

            {/* 각 문제별 랭킹 리스트 */}
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
                {/* 문제 제목 */}
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-start gap-2">
                  <span className="text-yellow-500">Q.</span>
                  {q}
                </h3>

                {/* 해당 문제의 랭킹 (있으면 표시, 없으면 안내) */}
                <div className="space-y-3">
                  {allRanks[q] && allRanks[q].length > 0 ? (
                    allRanks[q].map((item, idx) => (
                      <div key={item.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex gap-3">
                        {/* 등수 뱃지 */}
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm 
                          ${idx === 0 ? 'bg-yellow-500 text-black' : 
                            idx === 1 ? 'bg-gray-400 text-black' : 
                            'bg-orange-700 text-white'}`}>
                          {idx + 1}
                        </div>
                        {/* 내용 */}
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1 break-keep">"{item.metaphor}"</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">└ 신창섭: {item.comment}</span>
                            <span className="text-red-400 font-bold text-sm">{item.score}점</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-600 text-sm bg-gray-900/50 rounded-lg">
                      아직 레전드(95점+)가 없습니다.<br/>도전해서 박제되세요!
                    </div>
                  )}
                </div>
                
                {/* 이 문제 풀러 가기 버튼 */}
                <button 
                  onClick={() => {
                    setQuestion(q); // 해당 문제로 설정
                    setResult(null); // 결과 초기화
                    setInput('');
                    setActiveTab('game'); // 게임 탭으로 이동
                  }}
                  className="w-full mt-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  👉 나도 이 문제 도전하기
                </button>
              </div>
            ))}

            <div className="mt-12 mb-6 p-6 bg-blue-950/50 rounded-2xl border border-blue-500/30 text-center relative overflow-hidden group">
              
              {/* 배경 장식 (은은한 광원) */}
              <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

              <h3 className="text-blue-300 font-bold text-lg mb-2 relative z-10">
                💰 서버비 납부 고지서
              </h3>
              <p className="text-gray-400 text-sm mb-5 break-keep relative z-10">
                "재밌게 즐겼나? 세상에 공짜는 없다.<br/>
                <span className="text-blue-200 font-bold">서버비 정상화</span>에 동참해라."
              </p>
              
              <button 
                onClick={handleCopyAccount}
                className={`relative z-10 w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-xl transition-all shadow-lg active:scale-95 border
                  ${copied 
                    ? 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105' 
                    : 'bg-[#3182F6] hover:bg-[#1b64da] border-blue-400 text-white shadow-[0_0_15px_rgba(49,130,246,0.3)]'
                  }`}
              >
                <span className="text-xl">
                  {copied ? '✅' : '💸'}
                </span>
                <span>
                  {copied ? '계좌번호가 복사되었다! (정상화 완료)' : '계좌번호 복사하고 돈 보내기'}
                </span>
              </button>
              
              <p className="text-xs text-gray-500 mt-3 relative z-10">
                * 누르면 계좌번호가 복사됩니다. (토스뱅크)
              </p>
            </div>
            
            <div className="h-10 text-center text-gray-600 text-xs">
              모든 데이터는 실시간으로 '정상화' 됩니다.
            </div>
          </div>
        )}

      </main>

      {/* 🟢 [하단 내비게이션 바] */}
      <nav className="fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around items-center h-16 z-50 safe-area-bottom">
        <button 
          onClick={() => setActiveTab('game')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'game' ? 'text-yellow-400' : 'text-gray-500'}`}
        >
          <span className="text-xl mb-1">🎮</span>
          <span className="text-xs font-bold">문제 풀기</span>
        </button>
        <button 
          onClick={() => setActiveTab('rank')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'rank' ? 'text-yellow-400' : 'text-gray-500'}`}
        >
          <span className="text-xl mb-1">🏆</span>
          <span className="text-xs font-bold">명예의 전당</span>
        </button>
      </nav>

    </div>
  );
}