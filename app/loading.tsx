import { Loader2, Zap } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0C0C0C]">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#22CCEE] to-[#2ED3B7] flex items-center justify-center mb-4">
          <Zap className="h-6 w-6 text-[#0C0C0C]" />
        </div>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 text-[#22CCEE] animate-spin" />
          <p className="text-lg font-syne">Loading BLK BOX...</p>
        </div>
      </div>
    </div>
  )
}
