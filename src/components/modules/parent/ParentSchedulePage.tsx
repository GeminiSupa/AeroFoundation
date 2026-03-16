import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { getClassSchedule } from '../../../lib/api/timetable';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type Child = {
  id: string;
  class_id: string | null;
  full_name: string | null;
  roll_number: string;
};

export function ParentSchedulePage() {
  const { user } = useApp();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const childrenQuery = useQuery({
    queryKey: ['parent-children', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, class_id, roll_number, profile:profiles(full_name)')
        .eq('parent_id', user!.id)
        .order('roll_number', { ascending: true });
      if (error) throw error;

      const children: Child[] = (data || []).map((r: any) => ({
        id: r.id,
        class_id: r.class_id ?? null,
        roll_number: r.roll_number,
        full_name: r.profile?.full_name ?? null,
      }));
      return children;
    },
    enabled: !!user?.id,
  });

  const children = childrenQuery.data || [];
  const selectedChild = useMemo(() => {
    const id = selectedChildId ?? children[0]?.id ?? null;
    return children.find(c => c.id === id) ?? null;
  }, [children, selectedChildId]);

  const scheduleQuery = useQuery({
    queryKey: ['parent-child-schedule', selectedChild?.id, selectedChild?.class_id],
    queryFn: async () => {
      if (!selectedChild?.class_id) return [];
      const res = await getClassSchedule(selectedChild.class_id);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!selectedChild?.id,
  });

  const schedule = scheduleQuery.data || [];

  const scheduleByDay = useMemo(() => {
    const grouped = new Map<number, any[]>();
    DAYS.forEach((_, index) => grouped.set(index, []));
    schedule.forEach((entry: any) => {
      const dayEntries = grouped.get(entry.day_of_week) || [];
      dayEntries.push(entry);
      dayEntries.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
      grouped.set(entry.day_of_week, dayEntries);
    });
    return grouped;
  }, [schedule]);

  const totalClasses = schedule.length;
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  const todayClasses = scheduleByDay.get(adjustedToday) || [];

  const loading = childrenQuery.isLoading || scheduleQuery.isLoading;
  const hasChildren = children.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-role-parent">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-role-parent" />
          Child Schedule
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">View your child&apos;s weekly timetable</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select child
          </CardTitle>
          <CardDescription>Schedules are shown per child</CardDescription>
        </CardHeader>
        <CardContent>
          {childrenQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : !hasChildren ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              No students are linked to your parent account yet.
            </div>
          ) : (
            <Select value={selectedChild?.id ?? ''} onValueChange={(v) => setSelectedChildId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.full_name || 'Student')} • {c.roll_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">Weekly Classes</p>
            <h2 className="mt-2 text-2xl font-semibold">{loading ? '—' : totalClasses}</h2>
            <Badge className="mt-2" variant="secondary">Total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">Today&apos;s Classes</p>
            <h2 className="mt-2 text-2xl font-semibold">{loading ? '—' : todayClasses.length}</h2>
            <Badge className="mt-2">Today</Badge>
          </CardContent>
        </Card>
      </div>

      {todayClasses.length > 0 && (
        <Card className="border-sap-brand border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today&apos;s Schedule - {DAYS[adjustedToday]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayClasses.map((entry: any) => (
                <div key={entry.id} className="border rounded-lg p-4 bg-sap-brand/5">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {entry.start_time} - {entry.end_time}
                  </p>
                  <p className="font-medium mt-1">{entry.subject_name}</p>
                  <p className="text-sm text-muted-foreground">{entry.teacher_name}</p>
                  {entry.room && <p className="text-xs text-muted-foreground mt-1">📍 {entry.room}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>
            {selectedChild ? `${selectedChild.full_name || 'Student'} • ${selectedChild.roll_number}` : 'Select a child to view schedule'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : scheduleQuery.error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Failed to load schedule</span>
            </div>
          ) : !selectedChild?.class_id ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No class assigned yet</p>
              <p className="text-sm text-muted-foreground mt-2">An admin needs to assign a class to this student.</p>
            </div>
          ) : totalClasses === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No classes scheduled yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day, dayIndex) => {
                const daySchedule = scheduleByDay.get(dayIndex) || [];
                const isToday = dayIndex === adjustedToday;
                return (
                  <Card key={day} className={daySchedule.length === 0 ? 'opacity-50' : isToday ? 'border-sap-brand border-2' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {day}
                        {isToday && <Badge variant="default">Today</Badge>}
                        {!isToday && daySchedule.length > 0 && <Badge variant="secondary">{daySchedule.length}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {daySchedule.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No classes</p>
                      ) : (
                        <div className="space-y-3">
                          {daySchedule.map((entry: any) => (
                            <div key={entry.id} className={`border rounded-lg p-3 space-y-2 ${isToday ? 'bg-sap-brand/5' : ''}`}>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{entry.start_time} - {entry.end_time}</span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{entry.subject_name}</p>
                                <p className="text-xs text-muted-foreground">{entry.teacher_name}</p>
                                {entry.room && <p className="text-xs text-muted-foreground mt-1">📍 {entry.room}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

