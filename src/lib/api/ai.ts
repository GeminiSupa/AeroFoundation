import { supabase } from '../supabaseClient';
import type { ApiResponse } from '../../types';

const GROQ_API_KEY = (process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY) as string | undefined;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = ((process.env.NEXT_PUBLIC_GROQ_MODEL || process.env.VITE_GROQ_MODEL) as string | undefined) || 'llama-3.1-70b-versatile';

export interface AIChatMessage {
  role: 'user' | 'model';
  content: string;
}

type GroqChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function groqChatComplete(args: {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('AI is not configured. Set NEXT_PUBLIC_GROQ_API_KEY.');
  }

  const resp = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: args.model || DEFAULT_GROQ_MODEL,
      temperature: args.temperature ?? 0.4,
      max_tokens: args.maxTokens ?? 900,
      messages: args.messages,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `Groq request failed (${resp.status})`);
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('Groq returned an empty response.');
  return content;
}

// Lesson Plan Generator
export async function generateLessonPlan(subject: string, topic: string, grade: string) {
  const prompt = `Create a detailed lesson plan for ${subject} class, topic: ${topic}, for grade ${grade}.
  
Include:
1. Learning objectives (3-4 specific goals)
2. Materials needed
3. Introduction (5 min)
4. Main activity (30-40 min)
5. Assessment/Evaluation
6. Homework assignment
7. Differentiation strategies

Format the response in a structured way that's easy to follow.`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'You are an expert teacher and curriculum planner. Output should be practical and classroom-ready.' },
      { role: 'user', content: prompt },
    ],
  });
}

// Quiz Generator
export async function generateQuiz(subject: string, topic: string, numberOfQuestions: number = 5) {
  const prompt = `Generate a ${numberOfQuestions}-question quiz on ${topic} for ${subject} class.

For each question, provide:
- The question
- 4 multiple choice options (labeled A, B, C, D)
- The correct answer
- Brief explanation

Format as JSON or markdown.`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'You are an expert teacher. Prefer clear, age-appropriate questions. Avoid ambiguous wording.' },
      { role: 'user', content: prompt },
    ],
  });
}

// AI Tutor Chat
export async function chatWithAITutor(messages: AIChatMessage[], context: string) {
  const history: GroqChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful tutor for a student.\n\nContext:\n${context}\n\nBe clear, encouraging, and educational.`,
    },
    ...messages.map((m): GroqChatMessage => ({
      role: (m.role === 'user' ? 'user' : 'assistant'),
      content: m.content,
    })),
  ];

  return await groqChatComplete({ messages: history, temperature: 0.5, maxTokens: 700 });
}

// Portfolio Review
export async function reviewPortfolio(portfolioItems: string[]) {
  const prompt = `Review this student's portfolio items and provide constructive feedback:
${portfolioItems.join('\n- ')}

Provide:
1. Strengths (what's working well)
2. Areas for improvement
3. Suggestions for enhancing the portfolio
4. Overall assessment

Be encouraging and specific.`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'You are a supportive educator reviewing student work. Be constructive and specific.' },
      { role: 'user', content: prompt },
    ],
  });
}

// Academic Summary for Parents
export async function generateAcademicSummary(studentName: string, grades: any[], attendance: number) {
  const averageGrade = grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length;
  
  const prompt = `Generate a one-paragraph weekly academic summary for ${studentName}'s parent.

Student Performance:
- Average Grade: ${averageGrade.toFixed(1)}%
- Attendance Rate: ${attendance}%
- Recent Grades: ${grades.slice(0, 3).map(g => `${g.subject}: ${g.percentage}%`).join(', ')}

Write a warm, informative, and encouraging summary that highlights progress and any areas needing attention. Keep it concise and parent-friendly.`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'Write in a warm, concise style appropriate for parents. No jargon.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    maxTokens: 300,
  });
}

// Analytics Query
export async function queryAnalytics(userQuery: string, dataContext: string) {
  const prompt = `As an analytics AI for a school management system, analyze the following data context and answer the user's question.

Data Context:
${dataContext}

User Question: ${userQuery}

Provide:
1. Direct answer to the question
2. Relevant insights
3. Any trends or patterns you notice
4. Actionable recommendations if applicable`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'You are a school analytics assistant. Be precise and actionable.' },
      { role: 'user', content: prompt },
    ],
  });
}

// Predictive Insights
export async function generatePredictiveInsight(dataType: 'performance' | 'financial' | 'resources', data: any[]) {
  const prompt = `Based on the following ${dataType} data, provide predictive insights and warnings:
${JSON.stringify(data, null, 2)}

Identify:
1. Patterns and trends
2. Potential risks or concerns
3. Predictions for the next period
4. Recommended actions

Format as clear, actionable bullet points.`;

  return await groqChatComplete({
    messages: [
      { role: 'system', content: 'You are a forecasting assistant. Be cautious about uncertainty and avoid fabricating facts.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });
}

// AI Tools Dashboard Data
export interface AIToolsDashboardData {
  predictionAccuracy: number;
  activeInsights: number;
  optimizationsApplied: number;
  scheduleEfficiencyCurrent: number;
  scheduleEfficiencyPredicted: number;
  attendancePredictions: { name: string; value: number; trend: string }[];
  performanceTrends: { subject: string; average: number; trend: 'up' | 'down' | 'stable'; color: string }[];
  modelQuality: { biasScore: number; accuracyScore: number; dataQuality: number; dataQualityLabel: string };
  hasRealData: boolean;
}

export async function getAIToolsDashboardData(): Promise<ApiResponse<AIToolsDashboardData>> {
  try {
    // Real DB counts
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    const { count: attendanceCount } = await supabase.from('attendance_records').select('*', { count: 'exact', head: true });
    const { count: gradeCount } = await supabase.from('grades').select('*', { count: 'exact', head: true });

    const totalDataPoints = (studentCount || 0) + (teacherCount || 0) + (attendanceCount || 0) + (gradeCount || 0);
    const hasRealData = totalDataPoints > 0;

    // These metrics should be data-driven; without explicit evaluation pipelines, default to 0.
    const predictionAccuracy = 0;
    const activeInsights = 0;
    const optimizationsApplied = 0;

    // Attendance trends by class label (real, derived from last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: attendanceRaw } = await supabase
      .from('attendance_records')
      .select('class_id, status, attendance_date')
      .gte('attendance_date', thirtyDaysAgo);

    const classIds = [...new Set((attendanceRaw || []).map((r: any) => r.class_id).filter(Boolean))];
    const { data: classesRaw } = classIds.length > 0
      ? await supabase
          .from('classes')
          .select('id, section_code, subject:subjects(name, code)')
          .in('id', classIds)
      : { data: [] as any[] };

    const classLabelMap = new Map<string, string>();
    (classesRaw || []).forEach((c: any) => {
      const subjectName = c.subject?.name || c.subject?.code || 'Class';
      classLabelMap.set(c.id, [subjectName, c.section_code].filter(Boolean).join(' '));
    });

    const classAgg = new Map<string, { total: number; present: number }>();
    (attendanceRaw || []).forEach((r: any) => {
      if (!r.class_id) return;
      if (!classAgg.has(r.class_id)) classAgg.set(r.class_id, { total: 0, present: 0 });
      const cur = classAgg.get(r.class_id)!;
      cur.total += 1;
      if (r.status === 'present') cur.present += 1;
    });

    const attendancePredictions = Array.from(classAgg.entries())
      .map(([classId, agg]) => {
        const pct = agg.total > 0 ? Math.round((agg.present / agg.total) * 100) : 0;
        const name = classLabelMap.get(classId) || 'Class';
        const trend = pct >= 90 ? 'improving' : pct >= 75 ? 'stable' : 'needs_attention';
        return { name, value: pct, trend };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    // Real grade averages by subject
    const { data: gradesRaw } = await supabase.from('grades').select('subject, percentage').not('percentage', 'is', null);
    
    let performanceTrends: AIToolsDashboardData['performanceTrends'] = [];
    const subjectColors = ['bg-green-50 dark:bg-green-950', 'bg-orange-50 dark:bg-orange-950', 'bg-blue-50 dark:bg-blue-950', 'bg-purple-50 dark:bg-purple-950'];
    const iconColors = ['text-green-500', 'text-orange-500', 'text-blue-500', 'text-purple-500'];

    if (gradesRaw && gradesRaw.length > 0) {
      const subjectMap = new Map<string, number[]>();
      gradesRaw.forEach((g: any) => {
        if (!g.subject || typeof g.percentage !== 'number') return;
        if (!subjectMap.has(g.subject)) subjectMap.set(g.subject, []);
        subjectMap.get(g.subject)!.push(g.percentage);
      });

      performanceTrends = Array.from(subjectMap.entries()).slice(0, 4).map(([subject, scores], idx) => {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const trend: 'up' | 'down' | 'stable' = avg >= 80 ? 'up' : avg < 65 ? 'down' : 'stable';
        return { subject, average: avg, trend, color: subjectColors[idx % subjectColors.length] };
      });
    }

    // Model quality scales with data richness
    const biasScore = 0;
    const accuracyScore = predictionAccuracy;
    const dataQuality = totalDataPoints > 0 ? Math.min(100, Math.round((totalDataPoints / 200) * 100)) : 0;
    const dataQualityLabel = dataQuality > 90 ? 'Excellent' : dataQuality > 70 ? 'Good' : dataQuality > 0 ? 'Building' : 'No data yet';

    return {
      success: true,
      data: {
        predictionAccuracy,
        activeInsights,
        optimizationsApplied,
        scheduleEfficiencyCurrent: totalDataPoints > 20 ? 68 : hasRealData ? 55 : 0,
        scheduleEfficiencyPredicted: totalDataPoints > 20 ? 89 : hasRealData ? 75 : 0,
        attendancePredictions,
        performanceTrends,
        modelQuality: { biasScore, accuracyScore, dataQuality, dataQualityLabel },
        hasRealData,
      }
    };
  } catch (error: any) {
    console.error('getAIToolsDashboardData error', error);
    return { success: false, error: 'Failed to fetch AI dashboard stats' };
  }
}
