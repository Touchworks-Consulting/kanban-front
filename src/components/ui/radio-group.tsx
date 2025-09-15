import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <div
    className={cn("grid gap-2", className)}
    role="radiogroup"
    ref={ref}
    {...props}
  />
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)

  return (
    <input
      ref={ref}
      type="radio"
      id={id}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      checked={context?.value === props.value}
      onChange={(e) => {
        if (e.target.checked && context?.onValueChange) {
          context.onValueChange(props.value as string)
        }
      }}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
} | null>(null)

const RadioGroupProvider = ({
  children,
  value,
  onValueChange
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}) => (
  <RadioGroupContext.Provider value={{ value, onValueChange }}>
    {children}
  </RadioGroupContext.Provider>
)

// Override RadioGroup to use context
const RadioGroupWithContext = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, children, ...props }, ref) => (
  <RadioGroupProvider value={value} onValueChange={onValueChange}>
    <div
      className={cn("grid gap-2", className)}
      role="radiogroup"
      ref={ref}
      {...props}
    >
      {children}
    </div>
  </RadioGroupProvider>
))
RadioGroupWithContext.displayName = "RadioGroup"

export { RadioGroupWithContext as RadioGroup, RadioGroupItem }