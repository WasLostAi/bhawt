"use client"

// This file exports all UI components to avoid import path issues

import { Button as ButtonOriginal } from "@/components/ui/button"
import {
  Card as CardOriginal,
  CardContent as CardContentOriginal,
  CardDescription as CardDescriptionOriginal,
  CardFooter as CardFooterOriginal,
  CardHeader as CardHeaderOriginal,
  CardTitle as CardTitleOriginal,
} from "@/components/ui/card"
import { Input as InputOriginal } from "@/components/ui/input"
import { Label as LabelOriginal } from "@/components/ui/label"
import {
  Select as SelectOriginal,
  SelectContent as SelectContentOriginal,
  SelectItem as SelectItemOriginal,
  SelectTrigger as SelectTriggerOriginal,
  SelectValue as SelectValueOriginal,
} from "@/components/ui/select"
import { Switch as SwitchOriginal } from "@/components/ui/switch"
import {
  Tabs as TabsOriginal,
  TabsContent as TabsContentOriginal,
  TabsList as TabsListOriginal,
  TabsTrigger as TabsTriggerOriginal,
} from "@/components/ui/tabs"
import {
  Dialog as DialogOriginal,
  DialogContent as DialogContentOriginal,
  DialogDescription as DialogDescriptionOriginal,
  DialogFooter as DialogFooterOriginal,
  DialogHeader as DialogHeaderOriginal,
  DialogTitle as DialogTitleOriginal,
  DialogTrigger as DialogTriggerOriginal,
} from "@/components/ui/dialog"
import { Slider as SliderOriginal } from "@/components/ui/slider"
import { Textarea as TextareaOriginal } from "@/components/ui/textarea"
import { Separator as SeparatorOriginal } from "@/components/ui/separator"

// Re-export all components
export const Button = ButtonOriginal
export const Card = CardOriginal
export const CardContent = CardContentOriginal
export const CardDescription = CardDescriptionOriginal
export const CardFooter = CardFooterOriginal
export const CardHeader = CardHeaderOriginal
export const CardTitle = CardTitleOriginal
export const Input = InputOriginal
export const Label = LabelOriginal
export const Select = SelectOriginal
export const SelectContent = SelectContentOriginal
export const SelectItem = SelectItemOriginal
export const SelectTrigger = SelectTriggerOriginal
export const SelectValue = SelectValueOriginal
export const Switch = SwitchOriginal
export const Tabs = TabsOriginal
export const TabsContent = TabsContentOriginal
export const TabsList = TabsListOriginal
export const TabsTrigger = TabsTriggerOriginal
export const Dialog = DialogOriginal
export const DialogContent = DialogContentOriginal
export const DialogDescription = DialogDescriptionOriginal
export const DialogFooter = DialogFooterOriginal
export const DialogHeader = DialogHeaderOriginal
export const DialogTitle = DialogTitleOriginal
export const DialogTrigger = DialogTriggerOriginal
export const Slider = SliderOriginal
export const Textarea = TextareaOriginal
export const Separator = SeparatorOriginal

// Create a StatusBadge component that was used in multiple files
export function StatusBadge({ status }: { status: string }) {
  const text = status.charAt(0).toUpperCase() + status.slice(1)

  switch (status) {
    case "success":
    case "completed":
      return <span className="text-[#A4D756]">{text}</span>
    case "running":
    case "pending":
      return <span className="text-[#F9CB40]">{text}</span>
    case "failed":
      return <span className="text-[#E57676]">{text}</span>
    default:
      return <span>{text}</span>
  }
}
