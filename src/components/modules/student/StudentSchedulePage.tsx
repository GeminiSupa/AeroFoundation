import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { getClassSchedule } from '../../../lib/api/timetable';
import { Skeleton } from '../../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function StudentSchedulePage() {
  const { user } = useApp();

  // First, get the student's class_id
  const { data: studentData } = useQuery({
    queryKey: ['studentData', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Then fetch the schedule for that class
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['studentSchedule', studentData?.class_id],
    queryFn: async () => {
      if (!studentData?.class_id) return [];
      const res = await getClassSchedule(studentData.class_id);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!studentData?.class_id,
  });

  // Group schedule by day
  const scheduleByDay = useMemo(() => {
    const grouped = new Map<number, any[]>();
    DAYS.forEach((_, index) => grouped.set(index, []));
    schedule?.forEach((entry: any) => {
      const dayEntries = grouped.get(entry.day_of_week) || [];
      dayEntries.push(entry);
      dayEntries.sort((a, b) => a.start_time.localeCompare(b.start_time));
      grouped.set(entry.day_of_week, dayEntries);
    });
    return grouped;
  }, [schedule]);

  // Calculate stats
  const totalClasses = schedule?.length || 0;
  const today = new Date().getDay(); // 0 = Sunday, but we use 0 = Monday
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert to our system (0=Monday)
  const todayClasses = scheduleByDay.get(adjustedToday) || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-student">
          <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-role-student" />
          My Class Schedule
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">View your weekly timetable</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Weekly Classes</p>
            <h2 className="mt-2 text-2xl font-bold">{totalClasses}</h2>
            <Badge className="mt-2" variant="secondary">Total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Today's Classes</p>
            <h2 className="mt-2 text-2xl font-bold">{todayClasses.length}</h2>
            <Badge className="mt-2">Today</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule Highlight */}
      {todayClasses.length > 0 && (
        <Card className="border-sap-brand border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule - {DAYS[adjustedToday]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayClasses.map((entry: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 bg-sap-brand/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {entry.start_time} - {entry.end_time}
                        </span>
                      </div>
                      <p className="font-medium text-lg">{entry.subject_name}</p>
                      <p className="text-sm text-muted-foreground">{entry.teacher_name}</p>
                      {entry.room && (
                        <p className="text-sm text-muted-foreground mt-1">
                          📍 {entry.room}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>All classes for this week</CardDescription>
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
              <p className="text-muted-foreground">No classes scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please contact your admin to assign you to a class
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day, dayIndex) => {
                const daySchedule = scheduleByDay.get(dayIndex) || [];
                const isToday = dayIndex === adjustedToday;
                return (
                  <Card 
                    key={day} 
                    className={daySchedule.length === 0 ? 'opacity-50' : isToday ? 'border-sap-brand border-2' : ''}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {day}
                        {isToday && <Badge variant="default">Today</Badge>}
                        {!isToday && daySchedule.length > 0 && (
                          <Badge variant="secondary">{daySchedule.length}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {daySchedule.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No classes</p>
                      ) : (
                        <div className="space-y-3">
                          {daySchedule.map((entry: any, idx: number) => (
                            <div key={idx} className={`border rounded-lg p-3 space-y-2 ${isToday ? 'bg-sap-brand/5' : ''}`}>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {entry.start_time} - {entry.end_time}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{entry.subject_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.teacher_name}
                                </p>
                                {entry.room && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    📍 {entry.room}
                                  </p>
                                )}
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

      {/* List View Alternative */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule List</CardTitle>
          <CardDescription>Simple list view of all your classes</CardDescription>
        </CardHeader>
        <CardContent>
          {schedule && schedule.length > 0 ? (
            <div className="space-y-2">
              {schedule.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-sap-brand p-3 rounded-lg text-white">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{entry.subject_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {entry.teacher_name} {entry.room && `• ${entry.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{DAYS[entry.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.start_time} - {entry.end_time}
                    </p>
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

