import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft } from 'lucide-react'

const PLANS = [
  {
    name: '無料',
    price: '¥0',
    period: '',
    description: 'まず試してみたい方へ',
    color: 'border-gray-200',
    buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    features: [
      '出来事の記録（月5件まで）',
      'ワンタップ録音',
      '心身チェック',
      'ぽちぽち簡易入力',
    ],
    missing: [
      'AI整理・感情分離',
      'PDF出力',
      'リスクグラフ',
      '証拠強度スコア',
      '服薬・通院記録',
    ],
    priceId: null,
  },
  {
    name: 'スタンダード',
    price: '¥480',
    period: '/月',
    description: '相談資料を作りたい方へ',
    color: 'border-indigo-400 ring-2 ring-indigo-400',
    buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
    badge: 'おすすめ',
    features: [
      '出来事の記録（無制限）',
      'ワンタップ録音',
      '心身チェック',
      'AI整理・感情分離',
      'リスクグラフ',
      '証拠強度スコア',
      'PDF出力（社内相談・人事用）',
    ],
    missing: [
      '服薬・通院記録',
      '弁護士・産業医用レポート',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
  },
  {
    name: 'プレミアム',
    price: '¥980',
    period: '/月',
    description: '専門家相談まで備えたい方へ',
    color: 'border-violet-400',
    buttonStyle: 'bg-violet-600 text-white hover:bg-violet-700',
    features: [
      'スタンダードの全機能',
      '服薬・通院記録（二重ロック）',
      '弁護士用時系列レポート',
      '産業医・医療機関用レポート',
      '証拠強度スコア詳細分析',
    ],
    missing: [],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
  },
]

export default async function PricingPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">料金プラン</h1>
          <p className="text-xs text-gray-500">いつでもキャンセル可能</p>
        </div>
      </div>

      <div className="grid gap-4">
        {PLANS.map(plan => (
          <div key={plan.name} className={`bg-white rounded-2xl border-2 p-6 ${plan.color} relative`}>
            {plan.badge && (
              <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">{plan.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={14} className="text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
              {plan.missing.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                  <Check size={14} className="text-gray-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.priceId ? (
              <form action="/api/stripe/create-checkout" method="POST">
                <input type="hidden" name="priceId" value={plan.priceId} />
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.buttonStyle}`}
                >
                  {plan.name}プランを始める
                </button>
              </form>
            ) : (
              <Link
                href="/"
                className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${plan.buttonStyle}`}
              >
                無料で始める
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
        サブスクリプションはいつでもキャンセルできます。<br />
        決済はStripeにより安全に処理されます。
      </p>
    </main>
  )
}
