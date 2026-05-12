import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#f5f4ff]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-indigo-900">パワハラ撲滅</h1>
        <p className="text-sm text-gray-500 mt-1">無料で始める</p>
      </div>
      <SignUp />
    </main>
  )
}
