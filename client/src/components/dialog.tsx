import * as DialogPrimitive from "@radix-ui/react-dialog"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string
  hideClose?: boolean
}

export function DialogContent({
  className,
  overlayClassName,
  hideClose = false,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-fade-in",
          overlayClassName
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-base border-4 border-border bg-background p-6 text-foreground shadow-shadow focus:outline-none data-[state=open]:animate-fade-in sm:p-8",
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-4 top-4 cursor-pointer text-xl font-black text-foreground hover:text-main"
          >
            ✕
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
