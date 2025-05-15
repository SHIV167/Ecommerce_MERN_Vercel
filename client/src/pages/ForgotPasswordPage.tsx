import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Helmet } from 'react-helmet';

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", values);
      toast({ title: "Password reset link sent", description: "Check your email for the reset link." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Error sending reset link", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | Kama Ayurveda</title>
      </Helmet>
      <div className="bg-neutral-cream py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl text-primary text-center">Forgot Password</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="border border-neutral-sand rounded-md overflow-hidden">
            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary text-white" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
