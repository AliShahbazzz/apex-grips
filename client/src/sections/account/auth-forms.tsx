import { useState, type FormEvent } from "react"
import { Button, Field, FormMessage, SegmentedControl } from "@/components"
import { MIN_PASSWORD_LENGTH, requestPasswordReset } from "@/api/auth"
import { useAuth } from "@/auth/use-auth"
import { useAsyncAction } from "@/lib/use-async-action"
import { useStore } from "@/store/store"

type Mode = "signIn" | "signUp" | "forgot"

const MODE_OPTIONS: { value: Exclude<Mode, "forgot">; label: string }[] = [
  { value: "signIn", label: "Sign In" },
  { value: "signUp", label: "Create Account" },
]

/** Reads a text field from a submitted form, trimmed */
function readField(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim()
}

function SignInForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { signIn } = useAuth()
  const { dispatch } = useStore()
  const { pending, error, run } = useAsyncAction()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const signedIn = await run(() =>
      signIn(readField(form, "email"), String(form.get("password")))
    )
    if (signedIn) dispatch({ type: "showToast", message: "Signed in. Welcome back!" })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field id="sign-in-email" label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        id="sign-in-password"
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {error && <FormMessage>{error}</FormMessage>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
      <Button variant="link" size="inline" onClick={onForgotPassword}>
        Forgot password?
      </Button>
    </form>
  )
}

function SignUpForm() {
  const { signUp } = useAuth()
  const { dispatch } = useStore()
  const { pending, error, run } = useAsyncAction()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const phone = readField(form, "phone")
    const signedUp = await run(() =>
      signUp({
        email: readField(form, "email"),
        password: String(form.get("password")),
        first_name: readField(form, "firstName"),
        last_name: readField(form, "lastName"),
        phone: phone || undefined,
      })
    )
    if (signedUp) dispatch({ type: "showToast", message: "Account created. You're signed in!" })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field id="sign-up-first-name" label="First Name" name="firstName" required autoComplete="given-name" />
        <Field id="sign-up-last-name" label="Last Name" name="lastName" required autoComplete="family-name" />
      </div>
      <Field id="sign-up-email" label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        id="sign-up-phone"
        label="Mobile Number (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91 98765 43210"
      />
      <Field
        id="sign-up-password"
        label={`Password (min ${MIN_PASSWORD_LENGTH} characters)`}
        name="password"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
      />
      {error && <FormMessage>{error}</FormMessage>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { pending, error, run } = useAsyncAction()
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = readField(new FormData(event.currentTarget), "email")
    setSent(await run(() => requestPasswordReset(email)))
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs font-bold uppercase text-foreground/60">
        Enter your email and we'll send you a link to set a new password.
      </p>
      <Field id="forgot-email" label="Email" name="email" type="email" required autoComplete="email" />
      {error && <FormMessage>{error}</FormMessage>}
      {sent && (
        <FormMessage tone="success">
          If an account exists for that email, a reset link is on its way.
        </FormMessage>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send Reset Link"}
      </Button>
      <Button variant="link" size="inline" onClick={onBack}>
        ← Back to sign in
      </Button>
    </form>
  )
}

/** Sign in, create account and forgot password, for a signed-out customer */
export function AuthForms() {
  const [mode, setMode] = useState<Mode>("signIn")

  return (
    <div className="space-y-5">
      {mode === "forgot" ? (
        <ForgotPasswordForm onBack={() => setMode("signIn")} />
      ) : (
        <>
          <SegmentedControl
            label="Account"
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
            itemClassName="flex-1"
          />
          {mode === "signIn" ? (
            <SignInForm onForgotPassword={() => setMode("forgot")} />
          ) : (
            <SignUpForm />
          )}
        </>
      )}
    </div>
  )
}
