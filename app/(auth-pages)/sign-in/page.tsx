import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
<form className="flex flex-col gap-4">
  <h1 className="text-2xl font-semibold">Sign in</h1>
  <p className="text-sm text-muted-foreground">
    Don't have an account?{" "}
    <Link className="text-primary underline" href="/sign-up">
      Sign up
    </Link>
  </p>

  <Label htmlFor="email">Email</Label>
  <Input name="email" placeholder="you@example.com" required />

  <div className="flex justify-between items-center">
    <Label htmlFor="password">Password</Label>
    <Link href="/forgot-password" className="text-xs underline">
      Forgot password?
    </Link>
  </div>
  <Input type="password" name="password" required placeholder="Your password" />

  <SubmitButton pendingText="Signing in..." formAction={signInAction}>
    Sign in
  </SubmitButton>

  <FormMessage message={searchParams} />
</form>

  );
}
