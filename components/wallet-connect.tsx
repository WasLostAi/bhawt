"use client"
import { Button } from "@/components/ui/button"
import { useJupiterContext } from "@/contexts/jupiter-context"
import { Wallet, ExternalLink } from "lucide-react"

export default function WalletConnect() {
  const { walletPublicKey, connectWallet, disconnectWallet, isLoading } = useJupiterContext()

  const handleConnect = async () => {
    if (walletPublicKey) {
      disconnectWallet()
    } else {
      await connectWallet()
    }
  }

  return (
    <div>
      <Button
        variant={walletPublicKey ? "outline" : "default"}
        className={
          walletPublicKey
            ? "w-full bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
            : "w-full bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
        }
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Connecting...
          </>
        ) : walletPublicKey ? (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            {walletPublicKey.substring(0, 4)}...{walletPublicKey.substring(walletPublicKey.length - 4)}
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>

      {walletPublicKey && (
        <div className="mt-2 flex justify-center">
          <a
            href={`https://solscan.io/account/${walletPublicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#707070] hover:text-white flex items-center"
          >
            View on Solscan
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
