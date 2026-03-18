'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../src/components/ui/card';
import { Badge } from '../src/components/ui/badge';
import { Separator } from '../src/components/ui/separator';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  CalendarClock,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-sap-shell">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sapBrandColor)] text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Aero School</div>
              <div className="text-xs text-muted-foreground">Learning. Discipline. Growth.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button className="min-h-[44px] bg-[var(--sapBrandColor)] hover:bg-[var(--sapBrandColor)]/90">
                Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-10 pb-8 sm:pt-14 sm:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <Badge className="w-fit bg-[var(--sapBrandColor)]/10 text-[var(--sapBrandColor)] hover:bg-[var(--sapBrandColor)]/10">
              Aero School Management System
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              A modern, role‑based school platform for Aero School.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              One system for admins, teachers, students, and parents—attendance, learning hub, messages, finance, and reports—
              designed mobile‑first with a clean SAP‑inspired UI.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full min-h-[44px] bg-[var(--sapBrandColor)] hover:bg-[var(--sapBrandColor)]/90">
                  Enter Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full min-h-[44px]">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-3">
                <span>What you get</span>
                <Badge variant="outline">All roles</Badge>
              </CardTitle>
              <CardDescription>Fast setup, secure access, real‑time updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4 text-[var(--sapPositiveColor)]" />
                    Role-based access
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Admin/Teacher/Student/Parent views with scoped data.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarClock className="h-4 w-4 text-[var(--sapBrandColor)]" />
                    Learning hub & schedule
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Classes, timetable, assignments and progress.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <MessageSquare className="h-4 w-4 text-[var(--module-messages)]" />
                    Messaging & notices
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Announcements and internal messages.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <TrendingUp className="h-4 w-4 text-[var(--module-reports)]" />
                    Reports & analytics
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Attendance, finance, and operational insights.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  Already a member of Aero School?
                </div>
                <Link href="/login">
                  <Button variant="secondary" className="min-h-[44px]">
                    Login now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Key modules</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Everything Aero School needs to manage academics and operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-[var(--role-admin)]" />
                Administration
              </CardTitle>
              <CardDescription>Users, students, parents, HR and settings.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create accounts, assign roles, link parents to students, and keep school data consistent.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-[var(--module-scheduling)]" />
                Timetable
              </CardTitle>
              <CardDescription>Class schedule built for mobile.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Teachers and students see their schedules instantly. Admin can manage slots from Learning Hub.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-[var(--module-finance)]" />
                Finance & fees
              </CardTitle>
              <CardDescription>Track payments per student.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Record individual student payments, view fee status, and give parents a clear fee dashboard.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sapBrandColor)] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="font-semibold">Aero School</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                A unified portal for Aero School—built for clarity, speed, and real operations.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Contact</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Aero School, Pakistan
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +92 (your number)
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                info@aeroschool.pk
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Portal</div>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full min-h-[44px]">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                If you don’t have an account, contact the school admin to be added.
              </p>
            </div>
          </div>

          <Separator className="my-6" />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aero School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

