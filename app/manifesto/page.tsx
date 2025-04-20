import type { Metadata } from "next"
import ManifestoClientPage from "./ManifestoClientPage"

export const metadata: Metadata = {
  title: "BHAWT - Manifesto",
  description: "Comprehensive overview of BHAWT's functionality",
}

export default function ManifestoPage() {
  return <ManifestoClientPage />
}
