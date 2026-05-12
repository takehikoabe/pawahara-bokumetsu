import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '特定商取引法に基づく表記 | パワハラ撲滅',
}

const ITEMS = [
  { label: '販売事業者名',     value: 'Leon企画' },
  { label: '運営責任者',       value: '（準備中）' },
  { label: '所在地',           value: '（準備中）' },
  { label: '電話番号',         value: 'メールにてお問い合わせください' },
  { label: 'メールアドレス',   value: '（準備中）' },
  { label: 'サービス名',       value: 'パワハラ撲滅' },
  { label: 'サービスURL',      value: 'https://pawahara-bokumetsu.vercel.app' },
  { label: '販売価格',         value: 'スタンダードプラン：¥480/月（税込）\nプレミアムプラン：¥980/月（税込）' },
  { label: '支払い方法',       value: 'クレジットカード（Visa・Mastercard・American Express・JCB）' },
  { label: '支払い時期',       value: 'お申し込み時に即時決済。以降、毎月同日に自動更新' },
  { label: 'サービス提供時期', value: '決済完了後、即時ご利用いただけます' },
  { label: '返品・キャンセル', value: 'サブスクリプションはマイページよりいつでもキャンセル可能です。\nキャンセル後は当該請求期間終了まで引き続きご利用いただけます。\n既にお支払いいただいた料金の返金は承っておりません。' },
  { label: '動作環境',         value: '最新バージョンのGoogle Chrome・Safari・Firefox・Edge（インターネット接続環境が必要）' },
  { label: '個人情報の取扱い', value: 'ご入力いただいた個人情報は、サービス提供・お問い合わせ対応の目的にのみ使用し、第三者への提供は行いません。' },
]

export default function LegalPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-black text-indigo-900">特定商取引法に基づく表記</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <tbody>
            {ITEMS.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-5 py-4 text-sm font-bold text-gray-700 w-40 align-top border-b border-gray-100 whitespace-nowrap">
                  {item.label}
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 border-b border-gray-100 leading-relaxed whitespace-pre-wrap">
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        ※「準備中」の項目は順次更新予定です。お問い合わせはメールにてお願いいたします。
      </p>
    </main>
  )
}
