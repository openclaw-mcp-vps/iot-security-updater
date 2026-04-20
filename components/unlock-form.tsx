"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter the billing email used at checkout.")
});

type FormData = z.infer<typeof schema>;

export function UnlockForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      setMessage("");

      const response = await fetch("/api/auth/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        setMessage(data.error ?? "Unable to unlock access.");
        return;
      }

      setMessage("Access granted. Redirecting to dashboard...");
      window.location.href = "/dashboard";
    });
  };

  return (
    <Card className="mx-auto mt-16 max-w-lg space-y-4">
      <div>
        <CardTitle>Unlock Paid Dashboard Access</CardTitle>
        <CardDescription>
          Enter the billing email that completed checkout. Once verified, we issue a secure access cookie for this browser.
        </CardDescription>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Billing Email</Label>
          <Input id="email" type="email" placeholder="security-team@yourcompany.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.email.message}</p> : null}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Verifying..." : "Unlock Dashboard"}
        </Button>
      </form>

      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
    </Card>
  );
}
