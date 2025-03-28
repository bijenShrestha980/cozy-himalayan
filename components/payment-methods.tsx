export function PaymentMethods() {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Accepted Payment Methods</h3>
      <div className="flex flex-wrap gap-2">
        <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
          <span className="text-xs font-medium">Visa</span>
        </div>
        <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
          <span className="text-xs font-medium">MC</span>
        </div>
        <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
          <span className="text-xs font-medium">Amex</span>
        </div>
        <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
          <span className="text-xs font-medium">PayPal</span>
        </div>
      </div>
    </div>
  )
}

