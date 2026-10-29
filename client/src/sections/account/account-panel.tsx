import type { FormEvent } from "react"
import { Button, Card, Field, FormMessage } from "@/components"
import { useAuth } from "@/auth/use-auth"
import { useAsyncAction } from "@/lib/use-async-action"
import { useStore } from "@/store/store"
import { OrderHistory } from "./order-history"

function ProfileForm() {
  const { customer, updateProfile } = useAuth()
  const { dispatch } = useStore()
  const { pending, error, run } = useAsyncAction()
  if (!customer) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? "").trim()
    const saved = await run(() =>
      updateProfile({
        first_name: field("firstName"),
        last_name: field("lastName"),
        phone: field("phone"),
      })
    )
    if (saved) dispatch({ type: "showToast", message: "Profile saved" })
  }

  return (
    <section aria-labelledby="profile-title" className="space-y-3">
      <h3 id="profile-title" className="text-sm font-black uppercase">
        Profile
      </h3>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="profile-first-name"
            label="First Name"
            name="firstName"
            required
            autoComplete="given-name"
            defaultValue={customer.first_name ?? ""}
          />
          <Field
            id="profile-last-name"
            label="Last Name"
            name="lastName"
            required
            autoComplete="family-name"
            defaultValue={customer.last_name ?? ""}
          />
        </div>
        <Field
          id="profile-phone"
          label="Mobile Number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          defaultValue={customer.phone ?? ""}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <Button type="submit" variant="dark" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save Profile"}
        </Button>
      </form>
    </section>
  )
}

/** Signed-in view: who's logged in, their profile and their orders */
export function AccountPanel() {
  const { customer, signOut } = useAuth()
  const { dispatch } = useStore()
  if (!customer) return null

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")

  const handleSignOut = () => {
    signOut()
    dispatch({ type: "showToast", message: "Signed out" })
  }

  return (
    <div className="space-y-6">
      <Card tone="muted" weight="thin" className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="truncate text-base font-black uppercase">{name || "Apex Athlete"}</div>
          <div className="truncate text-xs font-bold text-foreground/60">{customer.email}</div>
        </div>
        <Button variant="neutral" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Card>

      <OrderHistory />
      <ProfileForm />
    </div>
  )
}
