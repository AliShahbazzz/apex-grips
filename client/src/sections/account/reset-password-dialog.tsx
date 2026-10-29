import type { FormEvent } from "react"
import { Badge, Button, Dialog, DialogContent, DialogTitle, Field, FormMessage, Heading } from "@/components"
import { MIN_PASSWORD_LENGTH } from "@/api/auth"
import { useAuth } from "@/auth/use-auth"
import { MedusaError } from "@/lib/medusa"
import { useAsyncAction } from "@/lib/use-async-action"
import { useStore } from "@/store/store"

/** Opens when the page is loaded from a password reset link */
export function ResetPasswordDialog() {
  const { resetToken, completePasswordReset, dismissPasswordReset } = useAuth()
  const { dispatch } = useStore()
  const { pending, error, run } = useAsyncAction()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    const updated = await run(async () => {
      if (password !== form.get("confirmPassword")) {
        throw new Error("Passwords don't match")
      }
      try {
        await completePasswordReset(password)
      } catch (caught) {
        if (caught instanceof MedusaError && caught.status === 401) {
          throw new Error("This reset link has expired or was already used. Request a new one.")
        }
        throw caught
      }
    })
    if (updated) {
      dispatch({ type: "showToast", message: "Password updated. Sign in with your new password" })
      dispatch({ type: "openOverlay", overlay: "account" })
    }
  }

  return (
    <Dialog open={resetToken !== null} onOpenChange={(open) => !open && dismissPasswordReset()}>
      <DialogContent aria-describedby={undefined} className="max-w-md sm:p-6">
        <div className="mb-4 border-b-2 border-border pb-3">
          <Badge>Account</Badge>
          <DialogTitle asChild>
            <Heading as="h3" highlight="Password" className="mt-1">
              Set a new
            </Heading>
          </DialogTitle>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field
            id="reset-password"
            label={`New Password (min ${MIN_PASSWORD_LENGTH} characters)`}
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
          <Field
            id="reset-password-confirm"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
          {error && <FormMessage>{error}</FormMessage>}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
