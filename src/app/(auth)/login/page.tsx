"use client"


import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { GoogleIcon } from "~/components/icons/google"
import { ContinueButton } from "~/components/pages/auth/continue-button"
import { PasswordInput } from "~/components/shared/password-input"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { loginSchema } from "~/lib/schema/auth"


export default function LoginPage() {
  // Here the idea is to divide the screen in the middle …, having the maximun contrast, in one half whe would put the login form, and in the other, we will put some phrase and image behind to make it look 🌟Luxurious🌟

  return (
    <div className="flex h-full w-full flex-row items-stretch justify-center">
      <section className="flex w-1/2 items-center justify-center bg-background">
        <div className="flex h-full flex-col items-center justify-center">
          <LoginForm />
          <div className="mt-4 flex w-full flex-row items-center justify-center gap-x-2">
            <Separator className="shrink grow !bg-foreground/40" />
            <p className="text-lg text-foreground/70">OR</p>
            <Separator className="shrink grow !bg-foreground/40" />
          </div>
          <div className="mt-4 w-full">
            <ContinueButton
              icon={<GoogleIcon size={120} className="size-[24px] shrink-0" />}
              label="Continue with Google"
            />
          </div>
        </div>
      </section>
      <section className="flex w-1/2 items-center justify-center bg-primary px-6">
        <h1 className="text-balance text-center font-italianno text-9xl font-medium text-white">
          Elegance is the only beauty that never fades.
        </h1>
      </section>

      {/* This button is to change between login and register */}

      <Link
        href="/register"
        className="group absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-[0.8rem] shadow-md shadow-black/50 transition-all hover:scale-110">
        <ChevronRight className="size-32 text-black" size={48} />
      </Link>
    </div>
  )
}

const LoginForm = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**async function onSubmit(data: z.infer<typeof loginSchema>) {
    const error = await login(data)

    if (error) {
      toast.error(error)
      return
    }
  } */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome to Reuse</CardTitle>
        <CardDescription>Please login before continuing. </CardDescription>
      </CardHeader>
      <CardContent className="mb-6 space-y-8">
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps<z.infer<typeof loginSchema>, "email"> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps<z.infer<typeof loginSchema>, "password"> }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
      <Link href={"/register"} className="px-4 flex w-full items-center justify-center gap-x-2 rounded-md bg-background p-4 text-sm text-foreground/70 transition-all hover:bg-foreground/10">
          <Label>
            Don't have an account? Sign Up
          </Label>
        </Link>
      <CardFooter className="flex items-end justify-between gap-x-16">
        <Link href={"/forgot-password"}>
          <Label>
            Forgot your password?
          </Label>
        </Link>
        <Button onClick={()=> toast.error("This is not implemented yet")}>
          Login
        </Button>
      </CardFooter>
    </Card>
  )
}