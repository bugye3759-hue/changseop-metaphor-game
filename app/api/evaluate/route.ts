import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/app/lib/supabase'; // 👈 DB 연결 도구 가져오기

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("API 키가 없습니다.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const { situation, metaphor } = await request.json();

    console.log(`[요청] 상황: ${situation}`);

    const prompt = `
      [페르소나 정의]
      너는 메이플스토리의 디렉터 '신창섭(김창섭)'이다.
      너의 특징:
      1. 극도로 오만하고 뻔뻔하다.
      2. 유저들의 불만은 무조건 '쌀숭이(돈 안 쓰는 유저)'들의 징징거림으로 치부한다.
      3. 말도 안 되는 논리를 '팩트', '건강', '정상화'라는 단어로 포장해서 합리화한다.
      4. 말투: "~해라", "~다", "~군" 같은 짧고 거만한 반말을 쓴다. (절대 존댓말 금지)

      [입력 정보]
      - 상황: ${situation}
      - 유저의 비유: ${metaphor}

      [임무]
      유저의 비유를 평가하고 점수를 매겨라.
      말투는 거만하게, "팩트", "정상화", "건강" 단어를 섞어서 조롱해라.
      
      [채점 기준 - 매우 중요]
      0.말이 이상하거나 앞뒤가 전혀 맞지 않고 완성된 문장이 아니면 10점, 20점을 주고 가차 없이 깎아내려라.
        -"국어 공부부터 다시 하고 와라. 이래서 리부트 서버가 망한 거야."라며 비난해라.
      1. **점수 짜게 줘라.** : 기본 점수는 30~60점 사이로 줘라. 웬만하면 70점 이하를 주고 웃긴 경우에만 80점 이상을 줘라.
      2. **90점의 벽** : 웬만큼 웃기거나 논리적이지 않으면 절대 90점을 넘기지 마라. (상위 1%만 90점대)
      - 비유가 상황이랑 딱 맞으면: "오... 정확한 팩트군. 네 지능이 쌀숭이치곤 꽤 높네?"라며 칭찬(조롱)해라.
      3. **100점 금지** : 네 마음에 쏙 드는 완벽한 비유라도 98점까지만 줘라. (신에게 도전하지 마라)
      4. 만약 비유가 노잼이거나 억지라면 10점, 20점을 주고 가차 없이 깎아내려라.
      - 비유가 이상하면: "국어 공부부터 다시 하고 와라. 이래서 리부트 서버가 망한 거야."라며 비난해라.

      [출력 형식 (JSON)]
      {
        "score": 숫자,
        "comment": "신창섭 말투의 평가 (2문장 이내로 짧고 강하게)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

    const jsonResult = JSON.parse(text);
    console.log("✅ 점수 산출 완료:", jsonResult.score);

    // 👇 [NEW] DB에 저장하는 코드 추가!
    const { error } = await supabase
      .from('hall_of_fame')
      .insert([
        {
          situation: situation,
          metaphor: metaphor,
          score: jsonResult.score,
          comment: jsonResult.comment
        }
      ]);

    if (error) {
      console.error("DB 저장 실패:", error);
      // DB 저장은 실패해도 게임은 진행되게 에러는 무시함
    } else {
      console.log("💾 DB 저장 성공!");
    }

    return NextResponse.json(jsonResult);

  } catch (error: any) {
    console.error("❌ 에러 발생:", error);
    return NextResponse.json(
      { score: 0, comment: `서버 오류: ${error.message}` }, 
      { status: 500 }
    );
  }
}