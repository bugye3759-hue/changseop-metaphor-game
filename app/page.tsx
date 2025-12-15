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
  "군대 월급 올랐다고 군마트(PX) 가격 올리는 상황",
  "게임 아이템 확률 조작하다 걸렸는데 '오류 수정'이라고 우기는 상황",
  "조별과제 하는데 자료조사만 하겠다는 놈이 자료를 나무위키 링크로 보낸 상황",
  "친구비 입금 안 했다고 단톡방 강퇴당하는 상황",
  "소개팅 나갔는데 상대방이 주선자 욕만 1시간 하다가 집에 간 상황",
  "게임 캐릭터 성능을 너프(하향)시키고 밸런스 패치라고 하는 상황",
  "전 품목 50% 할인이라고 써 붙여 놓고, 전날 밤에 가격표를 3배로 올려버린 상황"
];

export default function Home() {
  // 탭 상태: 'game' | 'rank'
  const [activeTab, setActiveTab] = useState<'game' | 'rank'>('game');
  
  // 게임 관련 상태
  const [question, setQuestion] = useState(questions[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; comment: string } | null>(null);
  
  
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
                      아직 레전드(90점+)가 없습니다.<br/>도전해서 박제되세요!
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