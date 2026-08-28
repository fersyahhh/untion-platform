const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_BASE_URL = import.meta.env.VITE_GROQ_BASE_URL;

export interface EvaluationInput {
  transcript: string;
  description: string;
  targetDurationMinutes: number;
  actualDurationSeconds: number;
  fillerWordCount: number;
  fillerBreakdown: Record<string, number>;
  longPauses: number;
  totalSlides: number;
}

export interface AspectScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface EvaluationResult {
  overallScore: number;
  aspects: AspectScore[];
  summary: string;
  strengths: string[];
  improvements: string[];
  wordCount: number;
  wpm: number;
}

export async function evaluatePresentation(
  input: EvaluationInput,
): Promise<EvaluationResult> {
  const wordCount = input.transcript.split(/\s+/).filter(Boolean).length;
  const durationMinutes = input.actualDurationSeconds / 60;
  const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

  const prompt = `You are a STRICT but FAIR academic presentation coach at a top university in Indonesia. Evaluate the following student presentation practice session objectively.
The presentation is in Indonesian language. ALL YOUR FEEDBACK AND RESPONSES MUST BE WRITTEN IN INDONESIAN.

**CRITICAL GRADING PHILOSOPHY - READ CAREFULLY:**
- The transcript is from speech-to-text (STT) and may contain typos - be lenient on spelling
- However, be STRICT on actual content quality, structure, and delivery
- DO NOT inflate scores - most students should score 45-65 range if average effort
- Score 70+ only for genuinely GOOD presentations with clear structure and good delivery
- Score 80+ ONLY for EXCELLENT presentations with professional quality
- Score below 45 for poor effort, incoherent rambling, or minimal content
- BE HONEST and CRITICAL - students need real feedback to improve

## Context
- **Presentation Topic:** "${input.description}"
- **Target Duration:** ${input.targetDurationMinutes} minutes
- **Actual Duration:** ${Math.floor(input.actualDurationSeconds / 60)}m ${input.actualDurationSeconds % 60}s
- **Total Slides:** ${input.totalSlides}
- **Words Spoken:** ${wordCount}
- **Words Per Minute (WPM):** ${wpm}
- **Filler Words Used:** ${input.fillerWordCount} times (${JSON.stringify(input.fillerBreakdown)})
- **Long Pauses (>3 seconds):** ${input.longPauses}

## Student's Transcript (STT-generated, may have typos)
"${input.transcript}"

## STRICT Grading Rubric (Be critical and realistic)

1. **Content Accuracy (25 pts)** 
   - Does content actually match the topic description?
   - Are there clear key points and logical arguments?
   - Is there sufficient depth and detail?
   - Scoring: 20-25 = Excellent depth | 15-19 = Good content | 10-14 = Basic/surface level | 5-9 = Weak/off-topic | 0-4 = No relevant content

2. **Structure & Flow (15 pts)**
   - Clear intro, body sections, conclusion?
   - Smooth transitions between ideas?
   - Logical progression throughout?
   - Scoring: 12-15 = Well-structured | 9-11 = Decent structure | 6-8 = Weak structure | 0-5 = No clear structure

3. **Vocabulary & Terminology (15 pts)**
   - Professional and appropriate vocabulary?
   - Correct use of technical/academic terms?
   - Variety in expression?
   - Scoring: 12-15 = Strong vocabulary | 9-11 = Adequate | 6-8 = Basic/repetitive | 0-5 = Poor/inappropriate

4. **Filler Words & Hesitation (15 pts)**
   - Filler count: ${input.fillerWordCount}
   - STRICT Scoring: 
     * 0-3 fillers = 15 pts (Excellent)
     * 4-8 fillers = 12 pts (Good)
     * 9-15 fillers = 9 pts (Fair)
     * 16-25 fillers = 6 pts (Poor)
     * 26+ fillers = 3 pts (Very poor)

5. **Pacing & Time Management (15 pts)**
   - Current WPM: ${wpm} (Ideal: 100-130 for Indonesian)
   - Time accuracy vs target ${input.targetDurationMinutes} min
   - STRICT Scoring:
     * Perfect pacing + timing = 15 pts
     * Good pacing, slightly off time = 11-14 pts
     * Okay pacing OR off time = 8-10 pts
     * Too fast/slow + wrong time = 4-7 pts
     * Very poor pacing = 0-3 pts

6. **Clarity & Confidence (15 pts)**
   - Complete sentences and clear expression?
   - Confident tone (not too many pauses/hesitations)?
   - Easy to follow and understand?
   - Scoring: 12-15 = Very clear & confident | 9-11 = Mostly clear | 6-8 = Somewhat unclear | 0-5 = Confusing/mumbling

**QUALITY BENCHMARKS:**
- Random rambling with no structure = 20-35 points
- Basic attempt, weak delivery = 36-50 points
- Average student, decent effort = 51-65 points
- Good presentation, clear structure = 66-75 points
- Very good, professional quality = 76-85 points
- Excellent, near-perfect = 86-95 points
- Perfect presentation = 96-100 points

**BE STRICT:** Most casual practice sessions should score 45-60. Don't give high scores unless truly deserved!

## Response Format (STRICT JSON ONLY)
{
  "overallScore": <number 0-100>,
  "aspects": [
    {"name": "Content Accuracy", "score": <number>, "maxScore": 25, "feedback": "<honest, critical feedback in Indonesian>"},
    {"name": "Structure & Flow", "score": <number>, "maxScore": 15, "feedback": "<honest feedback in Indonesian>"},
    {"name": "Vocabulary & Terminology", "score": <number>, "maxScore": 15, "feedback": "<honest feedback in Indonesian>"},
    {"name": "Filler Words & Hesitation", "score": <number>, "maxScore": 15, "feedback": "<honest feedback in Indonesian>"},
    {"name": "Pacing & Time Management", "score": <number>, "maxScore": 15, "feedback": "<honest feedback in Indonesian>"},
    {"name": "Clarity & Confidence", "score": <number>, "maxScore": 15, "feedback": "<honest feedback in Indonesian>"}
  ],
  "summary": "<2-3 sentence HONEST assessment in Indonesian - be constructive but realistic>",
  "strengths": ["<actual strength 1>", "<actual strength 2>", "<actual strength 3>"],
  "improvements": ["<critical improvement 1>", "<critical improvement 2>", "<critical improvement 3>"]
}`;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 45000); // 45 second timeout

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are an academic presentation evaluator. Respond only with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      
      // Handle specific error codes
      if (response.status === 429) {
        throw new Error('Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.');
      } else if (response.status === 503) {
        throw new Error('Layanan AI sedang sibuk. Silakan coba lagi dalam beberapa saat.');
      } else if (response.status === 401) {
        throw new Error('API key tidak valid. Hubungi administrator.');
      }
      
      throw new Error(
        `AI evaluation failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response (strip any accidental markdown fences)
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    try {
      const parsed = JSON.parse(cleanContent);
      return {
        ...parsed,
        wordCount,
        wpm,
      };
    } catch (err) {
      throw new Error("AI mengembalikan format data yang tidak valid. Silakan coba lagi.");
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    
    // Handle AbortError (timeout)
    if (err.name === 'AbortError') {
      throw new Error('AI evaluation timeout setelah 45 detik. Silakan coba lagi dengan transkrip yang lebih pendek.');
    }
    
    // Handle network errors
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Gagal terhubung ke server AI. Periksa koneksi internet Anda.');
    }
    
    // Re-throw other errors
    throw err;
  }
}
