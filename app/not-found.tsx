import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0C0C0C]">
      <div className="flex flex-col items-center text-center max-w-md px-4">
        <AlertTriangle className="h-16 w-16 text-[#E57676] mb-6" />
        <h1 className="text-4xl font-bold font-syne mb-2">404</h1>
        <h2 className="text-2xl font-syne mb-4">Page Not Found</h2>
        <p className="text-[#707070] mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Button
          asChild
          className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return to BLK BOX
          </Link>
        </Button>
      </div>
    </div>
  )
}
