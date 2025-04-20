import type { Metadata } from "next"
import TestFunctionsClient from "./TestFunctionsClient"

export const metadata: Metadata = {
  title: "BLK BOX - Function Testing",
  description: "Test all functions of the BLK BOX platform",
}

export default function TestFunctionsPage() {
  return <TestFunctionsClient />
}
