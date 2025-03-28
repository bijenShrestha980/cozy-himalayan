"use client"

import type React from "react"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuantitySelectorProps {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export function QuantitySelector({ defaultValue = 1, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(defaultValue)

  const increment = () => {
    if (quantity < max) {
      const newValue = quantity + 1
      setQuantity(newValue)
      if (onChange) onChange(newValue)
    }
  }

  const decrement = () => {
    if (quantity > min) {
      const newValue = quantity - 1
      setQuantity(newValue)
      if (onChange) onChange(newValue)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= min && value <= max) {
      setQuantity(value)
      if (onChange) onChange(value)
    }
  }

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={decrement}
        disabled={quantity <= min}
      >
        <Minus className="h-3 w-3" />
        <span className="sr-only">Decrease</span>
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleChange}
        min={min}
        max={max}
        className="h-8 w-12 text-center mx-2"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={increment}
        disabled={quantity >= max}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  )
}

