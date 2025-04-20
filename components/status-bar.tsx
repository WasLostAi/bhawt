import { Card, CardContent } from "@/components/ui/card"
import { CircleOff, Zap, CheckCircle2, Wallet } from "lucide-react"

interface StatusBarProps {
  activeTargets: number
  pendingTxs: number
  successfulSnipes: number
}

export default function StatusBar({ activeTargets, pendingTxs, successfulSnipes }: StatusBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#707070]">Active Targets</p>
            <p className="text-2xl font-bold font-syne">{activeTargets}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#22CCEE] to-[#2ED3B7] flex items-center justify-center">
            <CircleOff className="h-5 w-5 text-[#0C0C0C]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#707070]">Pending Transactions</p>
            <p className="text-2xl font-bold font-syne">{pendingTxs}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00B6E7] to-[#A4D756] flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#0C0C0C]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#707070]">Successful Snipes</p>
            <p className="text-2xl font-bold font-syne">{successfulSnipes}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2ED3B7] to-[#C8F284] flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-[#0C0C0C]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#707070]">Wallet Balance</p>
            <p className="text-2xl font-bold font-syne">12.45 SOL</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#30302e] flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
