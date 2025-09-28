import * as React from "react"
import { cn } from "../../lib/utils"

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Collapsible({ open, onOpenChange, className, ...props }: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false)

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      onOpenChange?.(next)
      return next
    })
  }

  return (
    <div className={cn("collapsible", className)} {...props} data-state={isOpen ? "open" : "closed"}>
      {props.children &&
        React.Children.map(props.children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, { isOpen, onToggle: handleToggle })
            : child
        )}
    </div>
  )
}

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  onToggle?: () => void
}

export function CollapsibleTrigger({ isOpen, onToggle, className, ...props }: CollapsibleTriggerProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={props["aria-controls"]}
      className={cn("collapsible-trigger", className)}
      onClick={onToggle}
      {...props}
    >
      {props.children}
    </button>
  )
}

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

export function CollapsibleContent({ isOpen, className, ...props }: CollapsibleContentProps) {
  return (
    <div
      className={cn(
        "collapsible-content transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        className
      )}
      hidden={!isOpen}
      {...props}
    />
  )
}
