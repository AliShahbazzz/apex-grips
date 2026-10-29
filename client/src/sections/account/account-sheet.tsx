import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components"
import { useAuth } from "@/auth/use-auth"
import { useStore } from "@/store/store"
import { AccountPanel } from "./account-panel"
import { AuthForms } from "./auth-forms"

export function AccountSheet() {
  const { state, dispatch } = useStore()
  const { status } = useAuth()

  return (
    <Sheet
      open={state.overlay === "account"}
      onOpenChange={(open) => !open && dispatch({ type: "closeOverlay" })}
    >
      <SheetContent aria-describedby={undefined}>
        <div className="flex items-center justify-between border-b-4 border-border bg-inverse p-5 text-inverse-foreground">
          <div className="flex items-center gap-2">
            <span className="text-xl text-main">👤</span>
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              {status === "signedIn" ? (
                <>
                  Your <span className="text-main">Account</span>
                </>
              ) : (
                <>
                  Apex <span className="text-main">Account</span>
                </>
              )}
            </SheetTitle>
          </div>
          <SheetClose
            aria-label="Close account"
            className="cursor-pointer text-xl font-black hover:text-main"
          >
            ✕
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {status === "loading" && (
            <p className="py-12 text-center text-xs font-bold uppercase text-foreground/60">
              Loading your account…
            </p>
          )}
          {status === "signedOut" && <AuthForms />}
          {status === "signedIn" && <AccountPanel />}
        </div>
      </SheetContent>
    </Sheet>
  )
}
