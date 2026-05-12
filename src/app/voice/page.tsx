'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { saveEvidenceFile } from '@/lib/db'
import { hashFile } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function VoicePage() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [memo, setMemo] = useState('')
  const [saved, setSaved] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    mediaRecorderRef.current = mr
    chunksRef.current = []
    startTimeRef.current = new Date()

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      stream.getTracks().forEach(t => t.stop())
    }
    mr.start()
    setIsRecording(true)
    setDuration(0)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function handleSave() {
    if (!audioBlob) return
    const buffer = await audioBlob.arrayBuffer()
    const hash = await hashFile(buffer)
    const now = new Date().toISOString()
    const fileName = `録音_${now.replace(/[:.]/g, '-')}.webm`

    await saveEvidenceFile({
      fileType: 'audio',
      fileName,
      fileHash: hash,
      fileData: buffer,
      mimeType: 'audio/webm',
      description: memo || `録音 ${formatDuration(duration)} / ${startTimeRef.current?.toLocaleString('ja-JP') ?? ''}`,
      containsMedical: false,
      createdAt: now,
    })
    setSaved(true)
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">録音する</h1>
          <p className="text-xs text-gray-500">ワンタップで証拠を記録</p>
        </div>
      </div>

      {/* 注意書き */}
      <Card className="border-amber-200 bg-amber-50 mb-6">
        <CardBody>
          <div className="flex gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              録音の取得・利用・第三者提供には法的注意が必要です。<br />
              提出・共有前には専門家への相談をお勧めします。
            </p>
          </div>
        </CardBody>
      </Card>

      {/* 録音ボタン */}
      <div className="flex flex-col items-center gap-6 py-8">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'}`}>
          <Mic size={56} className="text-white" strokeWidth={2} />
        </div>

        {isRecording && (
          <div className="text-center">
            <p className="text-4xl font-mono font-black text-red-600">{formatDuration(duration)}</p>
            <p className="text-sm text-red-500 font-medium mt-1">録音中...</p>
          </div>
        )}

        {!isRecording && !audioBlob && (
          <Button size="xl" className="bg-red-500 hover:bg-red-600 w-48" onClick={startRecording}>
            <Mic size={20} className="mr-2" /> 録音開始
          </Button>
        )}

        {isRecording && (
          <Button size="xl" variant="outline" className="border-red-500 text-red-500 w-48" onClick={stopRecording}>
            <Square size={20} className="mr-2" /> 録音停止
          </Button>
        )}
      </div>

      {/* 録音済み */}
      {audioBlob && !saved && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">録音時間</span>
              <span className="font-bold">{formatDuration(duration)}</span>
            </div>
            <audio controls className="w-full rounded-xl" src={URL.createObjectURL(audioBlob)} />
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="メモ（何の録音か、任意）..."
              className="w-full min-h-[80px] resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl border border-gray-200 p-3"
            />
            <Button className="w-full" onClick={handleSave}>
              <Save size={16} className="mr-2" /> 証拠として保存する
            </Button>
            <Button variant="ghost" className="w-full text-gray-500" onClick={() => { setAudioBlob(null); setDuration(0) }}>
              録り直す
            </Button>
          </CardBody>
        </Card>
      )}

      {saved && (
        <Card className="border-green-300 bg-green-50 text-center">
          <CardBody className="space-y-3">
            <p className="font-bold text-green-800">録音を保存しました</p>
            <p className="text-xs text-green-700">ハッシュ値を生成し、証拠として記録しました。</p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>ホームに戻る</Button>
          </CardBody>
        </Card>
      )}
    </main>
  )
}
