import type { ReactNode } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingBag className="h-8 w-8" />
          <span className="text-2xl">Cozy Himalayan</span>
        </Link>
      </div>
      {children}
    </div>
  )
}

