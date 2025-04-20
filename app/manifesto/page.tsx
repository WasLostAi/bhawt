import type { Metadata } from "next"
import ManifestoClientPage from "./ManifestoClientPage"

export const metadata: Metadata = {
  title: "BLK BOX - Manifesto",
  description: "Comprehensive overview of BLK BOX's functionality",
}

export default function ManifestoPage() {
  return <ManifestoClientPage />
}
