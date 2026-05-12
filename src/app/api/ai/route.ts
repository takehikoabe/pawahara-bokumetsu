import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import type { AiAnalysis } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const SYSTEM_PROMPT = `あなたは職場ハラスメント相談支援AIです。
ユーザーが入力した文章を、相談窓口・労働局・弁護士に提出できる客観的な資料へ整理します。

以下のルールを必ず守ってください：
- 「パワハラ確定」「有罪」などの断定表現を使わない
- 「該当する可能性がある」「記録上のリスク」などの表現を使う
- 感情的な表現を冷静な事実記述へ変換する
- 欠けている情報（日時・場所・目撃者など）を指摘する
- 必ずJSON形式のみで返答する（前後に説明文を付けない）`

export async function POST(req: NextRequest) {
  const { text, mode } = await req.json()

  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

  try {
    if (mode === 'analyze') {
      const prompt = `${SYSTEM_PROMPT}

以下のテキストを分析し、JSON形式で返してください。

入力テキスト:
"""
${text}
"""

返すJSONの形式：
{
  "fact": "客観的な事実のみを記述（推測・感情を除く）",
  "feeling": "ユーザーが感じた感情・主観的受け止め",
  "inference": "状況から推測される意図・背景（推測であることを明記）",
  "impact": "心身・業務への影響",
  "formalText": "相談窓口・弁護士に提出できる冷静な文章（300字以内）",
  "missingInfo": ["不足している情報1", "不足している情報2"],
  "riskComment": "相談優先度についてのコメント（断定しない）",
  "categories": ["mental", "isolation"], // 該当する類型（physical/mental/isolation/overwork/underwork/privacy/other）
  "powerScore": 7,      // 優越的関係の強さ 0-10
  "necessityScore": 8,  // 業務必要性の逸脱度 0-10
  "envScore": 7,        // 就業環境への影響 0-10
  "riskScore": 72       // 総合リスクスコア 0-100
}`

      const result = await model.generateContent(prompt)
      const raw = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const analysis: AiAnalysis = JSON.parse(raw)
      return NextResponse.json(analysis)
    }

    return NextResponse.json({ error: 'unknown mode' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'AI処理に失敗しました' }, { status: 500 })
  }
}
