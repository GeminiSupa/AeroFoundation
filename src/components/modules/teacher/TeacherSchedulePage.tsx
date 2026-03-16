import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getTimetableEntries } from '../../../lib/api/timetable';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TeacherSchedulePage() {
  const { user } = useApp();

  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['teacherSchedule', user?.id],
    queryFn: async () => {
      const r = await getTimetableEntries({ teacherId: user!.id });
      if (!r.success) throw new Error(r.error || 'Failed to load schedule');
      return r.data || [];
    },
    enabled: !!user?.id,
  });

  const scheduleByDay = useMemo(() => {
    const grouped = new Map<number, any[]>();
    DAYS.forEach((_, index) => grouped.set(index, []));
    (schedule || []).forEach((entry: any) => {
      const dayEntries = grouped.get(entry.day_of_week) || [];
      dayEntries.push(entry);
      dayEntries.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
      grouped.set(entry.day_of_week, dayEntries);
    });
    return grouped;
  }, [schedule]);

  const totalClasses = schedule?.length || 0;
  const today = new Date().getDay(); // JS: 0=Sunday..6=Saturday
  const adjustedToday = today === 0 ? 6 : today - 1; // Timetable: 0=Monday..6=Sunday
  const todayClasses = scheduleByDay.get(adjustedToday) || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-role-teacher">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-role-teacher" />
          My Teaching Schedule
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">Your weekly timetable</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">Weekly Classes</p>
            <h2 className="mt-2 text-2xl font-semibold">{isLoading ? '—' : totalClasses}</h2>
            <Badge className="mt-2" variant="secondary">Total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">Today&apos;s Classes</p>
            <h2 className="mt-2 text-2xl font-semibold">{isLoading ? '—' : todayClasses.length}</h2>
            <Badge className="mt-2">Today</Badge>
          </CardContent>
        </Card>
      </div>

      {todayClasses.length > 0 && (
        <Card className="border-sap-brand border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today&apos;s Classes - {DAYS[adjustedToday]}
            </CardTitle>
            <CardDescription>What you are teaching today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayClasses.map((entry: any) => (
                <div key={entry.id} className="border rounded-lg p-4 bg-sap-brand/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {entry.start_time} - {entry.end_time}
                      </p>
                      <p className="font-medium mt-1">{entry.subject_name}</p>
                      <p className="text-sm text-muted-foreground">{entry.class_name}</p>
                      {entry.room && <p className="text-xs text-muted-foreground mt-1">📍 {entry.room}</p>}
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {DAYS[entry.day_of_week]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>All scheduled teaching sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Failed to load schedule</span>
            </div>
          ) : totalClasses === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No timetable entries yet</p>
              <p className="text-sm text-muted-foreground mt-2">Ask an admin to create timetable entries for your classes.</p>
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
                                <p className="text-xs text-muted-foreground">{entry.class_name}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Schedule List</CardTitle>
          <CardDescription>Simple list view</CardDescription>
        </CardHeader>
        <CardContent>
          {schedule && schedule.length > 0 ? (
            <div className="space-y-2">
              {schedule.map((entry: any) => (
                <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-sap-brand p-3 rounded-lg text-white shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{entry.subject_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.class_name} {entry.room && `• ${entry.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium">{DAYS[entry.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">{entry.start_time} - {entry.end_time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No classes scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

