import { supabase } from '../supabaseClient';
import type { ApiResponse } from '../../types';

export interface ReportsData {
  totalReports: number;
  aiInsights: number;
  dataPoints: number;
  attendanceData: { month: string; attendance: number }[];
  gradeData: { subject: string; average: number }[];
}

export async function getReportsData(): Promise<ApiResponse<ReportsData>> {
  try {
    const { count: reportsCount } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true });
      
    const { count: gradesCount } = await supabase
      .from('grades')
      .select('*', { count: 'exact', head: true });
      
    const dataPoints = (reportsCount || 0) + (gradesCount || 0);

    // Attendance Trends (Group by month)
    const { data: attendanceRaw } = await supabase
      .from('attendance_records')
      .select('attendance_date, status');
      
    // Default empty mock fallback if no data
    let attendanceData = [
      { month: 'Jan', attendance: 0 },
      { month: 'Feb', attendance: 0 },
    ];

    if (attendanceRaw && attendanceRaw.length > 0) {
      const monthMap = new Map<string, { total: number; present: number }>();
      
      attendanceRaw.forEach(record => {
        if (!record.attendance_date) return;
        const dateObj = new Date(record.attendance_date);
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthMap.has(monthName)) {
          monthMap.set(monthName, { total: 0, present: 0 });
        }
        
        const current = monthMap.get(monthName)!;
        current.total += 1;
        if (record.status === 'present') {
          current.present += 1;
        }
      });
      
      if (monthMap.size > 0) {
        attendanceData = Array.from(monthMap.entries()).map(([month, data]) => ({
          month,
          attendance: Math.round((data.present / data.total) * 100)
        }));
        
        // Sort chronologically if possible, simplistic sort for now assuming months
        const monthOrder: Record<string, number> = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        attendanceData.sort((a, b) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0));
      }
    }

    // Grade Averages (Group by subject)
    const { data: gradesRaw } = await supabase
      .from('grades')
      .select('subject, percentage')
      .not('percentage', 'is', null);

    let gradeData: { subject: string; average: number }[] = [];

    if (gradesRaw && gradesRaw.length > 0) {
      const subjectMap = new Map<string, { total: number; count: number }>();
      
      gradesRaw.forEach(record => {
        if (!record.subject || typeof record.percentage !== 'number') return;
        const subj = record.subject;
        
        if (!subjectMap.has(subj)) {
          subjectMap.set(subj, { total: 0, count: 0 });
        }
        
        const current = subjectMap.get(subj)!;
        current.total += record.percentage;
        current.count += 1;
      });
      
      if (subjectMap.size > 0) {
        gradeData = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          average: Math.round(data.total / data.count)
        }));
      }
    }

    // Fallback if grades is totally empty
    if (gradeData.length === 0) {
      gradeData = [
         { subject: 'No Data', average: 0 }
      ];
    }

    return {
      success: true,
      data: {
        totalReports: attendanceData.length + gradeData.length || 0,
        aiInsights: 3,
        dataPoints: dataPoints || 0,
        attendanceData,
        gradeData
      }
    };
  } catch (error: any) {
    console.error('Error fetching reports data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch reports data'
    };
  }
}
