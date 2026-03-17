 'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signIn } from '../../lib/api/auth';
import { useApp } from '../../context/AppContext';
import { getDashboardRole } from '../../utils/roles';
import { supabase } from '../../lib/supabaseClient';

// Login form schema with Zod validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession()
      .then(({ error }) => {
        if (cancelled) return;
        if (error) setConnectionError(error.message);
        else setConnectionError(null);
      })
      .catch((err: any) => {
        if (cancelled) return;
        const msg = err?.message || '';
        if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
          setConnectionError(
            'Cannot reach Supabase (ERR_NAME_NOT_RESOLVED). In .env.local set VITE_SUPABASE_URL to the exact Project URL from Supabase Dashboard → your project → Settings → API. Copy "Project URL" and "anon public" key, save, then restart the dev server.'
          );
        } else {
          setConnectionError(msg || 'Connection check failed');
        }
      });
    return () => { cancelled = true; };
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => signIn(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        const userData = {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
          avatar: result.data.avatar,
          class: result.data.class,
        };
        
        setUser(userData as any);
        toast.success('Login successful!');
        const dashboardRole = getDashboardRole(result.data.role);
        router.push(`/${dashboardRole}-dashboard`);
      } else {
        const errorMessage = result.error || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      let errorMessage = error?.message || 'Login failed. Please try again.';
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        errorMessage = 'Cannot reach server. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (from Supabase Dashboard > Settings > API), then restart the dev server.';
      }
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle>AI School Management System</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{connectionError}</span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          className="pl-9"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          className="pl-9 pr-10"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Toggle password visibility"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full min-h-[44px] touch-manipulation bg-[#0D6EFD] hover:bg-[#0D6EFD]/90" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>

              <div className="flex justify-between items-center pt-2">
                <button 
                  type="button" 
                  className="text-sm text-[#0D6EFD] hover:underline"
                  onClick={() => toast.info('Contact your administrator to reset your password')}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
