import type { Metadata } from "next"
import TestFunctionsClient from "./TestFunctionsClient"

export const metadata: Metadata = {
  title: "BHAWT - Function Testing",
  description: "Test all functions of the BHAWT platform",
}

export default function TestFunctionsPage() {
  return <TestFunctionsClient />
}
