import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, ArrowRight, Sparkles, CheckCircle2, Shield, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import manual from '../../../SYSTEM_USER_MANUAL.md?raw';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from '../ui/separator';

const roleSections: Record<string, { id: string; label: string; match: (line: string) => boolean }> = {
  admin: {
    id: 'admin',
    label: 'Admin manual',
    match: () => true, // admin sees full manual
  },
  teacher: {
    id: 'teacher',
    label: 'Teacher manual',
    match: (line) =>
      line.includes('Teachers can now log in') ||
      line.includes('Teacher Dashboard') ||
      line.includes('teachers can') ||
      line.includes('Teacher ') ||
      line.includes('10.1 Assignments') ||
      line.includes('10.2 Attendance'),
  },
  student: {
    id: 'student',
    label: 'Student manual',
    match: (line) =>
      line.includes('Students will now see') ||
      line.includes('Student Dashboard') ||
      line.includes('Student ') ||
      line.includes('Student To‑Do') ||
      line.includes('10.1 Assignments'),
  },
  parent: {
    id: 'parent',
    label: 'Parent manual',
    match: (line) =>
      line.includes('Parents can now log in') ||
      line.includes('Parent Dashboard') ||
      line.includes('parents see') ||
      line.includes('Parent '),
  },
};

export function UserManualPage() {
  const { user } = useApp();
  const role = user?.role ?? 'admin';
  const current = roleSections[role] ?? roleSections.admin;

  const raw = manual as string;
  const lines = raw.split('\n');

  const filtered = useMemo(() => {
    // Simple filter for non-admin roles: keep intro + role matches
    return role === 'admin'
      ? raw
      : lines
          .filter((line, idx) => idx < 25 || current.match(line))
          .join('\n');
  }, [lines, raw, role, current]);

  const toc = useMemo(() => {
    const src = role === 'admin' ? raw : filtered;
    return src
      .split('\n')
      .filter((l) => l.startsWith('### '))
      .map((l) => l.replace(/^###\s+/, '').trim())
      .slice(0, 40);
  }, [raw, filtered, role]);

  const roleMeta = useMemo(() => {
    if (role === 'teacher') return { label: 'Teacher', icon: <Shield className="w-4 h-4" /> };
    if (role === 'student') return { label: 'Student', icon: <GraduationCap className="w-4 h-4" /> };
    if (role === 'parent') return { label: 'Parent', icon: <Users className="w-4 h-4" /> };
    return { label: 'Admin', icon: <Sparkles className="w-4 h-4" /> };
  }, [role]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sap-accent text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">User manual</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Clear steps, role‑based guidance, and best practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    {roleMeta.icon}
                    {roleMeta.label} view
                  </span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Follow the arrows in order. If something is missing, it’s usually because your account isn’t linked yet.
                </CardDescription>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2">
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Recommended order</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <ArrowRight className="w-4 h-4 text-sap-accent" />
                    Subjects → Classes → Users → Links
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Tip</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Use dropdowns, avoid manual IDs
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Tabs defaultValue={current.id} className="space-y-3">
              <TabsList className="w-full justify-start flex-wrap">
                {Object.values(roleSections)
                  .filter((section) => section.id === current.id || role === 'admin')
                  .map((section) => (
                    <TabsTrigger key={section.id} value={section.id}>
                      {section.label}
                    </TabsTrigger>
                  ))}
              </TabsList>

              <TabsContent value={current.id}>
                <ScrollArea className="h-[70vh] rounded-xl border bg-background">
                  <div className="p-5">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children, ...props }) => (
                          <h2 className="mt-6 scroll-mt-24 text-xl font-bold" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children, ...props }) => (
                          <h3 className="mt-6 scroll-mt-24 text-lg font-semibold" {...props}>
                            {children}
                          </h3>
                        ),
                        hr: () => <Separator className="my-6" />,
                        ul: ({ children, ...props }) => (
                          <ul className="my-3 space-y-2 pl-5" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children, ...props }) => (
                          <ol className="my-3 space-y-2 pl-5" {...props}>
                            {children}
                          </ol>
                        ),
                        li: ({ children, ...props }) => (
                          <li className="relative" {...props}>
                            <span className="absolute -left-5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                              <ArrowRight className="h-3 w-3 text-sap-accent" />
                            </span>
                            <span className="text-sm leading-relaxed">{children}</span>
                          </li>
                        ),
                        p: ({ children, ...props }) => (
                          <p className="my-3 text-sm leading-relaxed text-foreground/90" {...props}>
                            {children}
                          </p>
                        ),
                        strong: ({ children, ...props }) => (
                          <strong className="font-semibold text-foreground" {...props}>
                            {children}
                          </strong>
                        ),
                        code: ({ children, ...props }) => (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs" {...props}>
                            {children}
                          </code>
                        ),
                        a: ({ children, ...props }) => (
                          <a className="text-sap-accent underline underline-offset-4" {...props}>
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {filtered}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </TabsContent>

              {role === 'admin' &&
                Object.values(roleSections)
                  .filter((section) => section.id !== 'admin')
                  .map((section) => (
                    <TabsContent key={section.id} value={section.id}>
                      <ScrollArea className="h-[70vh] rounded-xl border bg-background">
                        <div className="p-5">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {lines
                              .filter((line, idx) => idx < 25 || section.match(line))
                              .join('\n')}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="hidden lg:block h-fit sticky top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">On this page</CardTitle>
            <CardDescription>Jump to a section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {toc.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sections found.</p>
            ) : (
              <ul className="space-y-2">
                {toc.map((t) => (
                  <li key={t} className="text-sm">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="w-4 h-4 text-sap-accent" />
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

