"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter the same email used at checkout.")
});

type FormValues = z.infer<typeof schema>;

const checkoutHref = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

export function UnlockAccessForm() {
  const [serverMessage, setServerMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage("");
    setServerMessage("");

    const response = await fetch("/api/access/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setErrorMessage(payload.error || "Unable to verify purchase right now.");
      return;
    }

    setServerMessage(payload.message || "Access granted.");
    window.location.assign("/dashboard");
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lock className="h-5 w-5 text-[var(--info)]" />
          Unlock Your Security Console
        </CardTitle>
        <CardDescription>
          Enter the checkout email to activate your access cookie. This keeps the workspace behind a
          paid gate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email Used for Purchase</Label>
            <Input id="email" placeholder="security.manager@company.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-[var(--critical)]">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          {errorMessage ? <p className="text-sm text-[var(--critical)]">{errorMessage}</p> : null}
          {serverMessage ? <p className="text-sm text-[var(--success)]">{serverMessage}</p> : null}

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify Purchase and Enter
          </Button>
        </form>

        <div className="mt-6 rounded-md border border-[var(--border)] bg-black/20 p-4 text-sm text-[var(--muted)]">
          <p>
            Need access first? Complete checkout, then return here to unlock. Webhook confirmation can
            take up to 20 seconds.
          </p>
          <a
            className="mt-3 inline-flex rounded-md border border-[var(--info)] bg-[var(--info)]/10 px-3 py-2 text-[var(--foreground)] hover:bg-[var(--info)]/20"
            href={checkoutHref}
            rel="noreferrer"
            target="_blank"
          >
            Open Stripe Checkout
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
