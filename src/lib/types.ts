// Shared types between API and frontend

export type Lang = "en" | "ur" | "hi" | "ar"

export interface LocalizedText {
  en: string
  ur: string
  hi: string
  ar: string
}

export interface CategoryDTO {
  id: string
  slug: string
  name: LocalizedText
  description: LocalizedText
  icon: string | null
  color: string | null
  order: number
}

export interface LessonListItemDTO {
  id: string
  categoryId: string
  categorySlug: string
  categoryColor: string | null
  categoryIcon: string | null
  title: LocalizedText
  summary: LocalizedText
  imageUrl: string | null
  durationMin: number
  order: number
  orderInCategory: number
  isPublished: boolean
  hasQuiz: boolean
  passed: boolean
  completed: boolean
  bookmarked: boolean
}

export interface LessonDetailDTO {
  id: string
  categoryId: string
  category: CategoryDTO
  title: LocalizedText
  summary: LocalizedText
  content: LocalizedText
  imageUrl: string | null
  durationMin: number
  order: number
  orderInCategory: number
  totalInCategory: number
  isPublished: boolean
  locked: boolean
  nextLessonId: string | null
  bookmarked: boolean
  passed: boolean
  completed: boolean
}

// Public question shown to the learner — answers are NOT included (security).
export interface PublicQuestionDTO {
  id: string
  type: "MCQ" | "TF"
  prompt: LocalizedText
  options: LocalizedText[] // length 2 (TF) or 2-4 (MCQ)
}

export interface PublicQuizDTO {
  id: string
  lessonId: string
  passMark: number
  questions: PublicQuestionDTO[]
}

// Full question (admin editor) — includes the correct answer + explanation.
export interface QuestionDTO {
  id: string
  type: "MCQ" | "TF"
  prompt: LocalizedText
  options: LocalizedText[]
  correctIndex: number
  explanation: LocalizedText
}

export interface QuizDTO {
  id: string
  lessonId: string
  passMark: number
  questions: QuestionDTO[]
}

export interface QuizSubmitResult {
  lessonId: string
  score: number
  total: number
  passMark: number
  passed: boolean
  correctFlags: boolean[]
  correctIndices: number[]
  explanations: LocalizedText[]
  nextLessonId: string | null
  unlockedNext: boolean
  // AdMob interstitial cadence: show only every 2 newly-completed lessons.
  showInterstitial: boolean
  // If passing this lesson completed the whole level, a certificate is issued.
  certificateId: string | null
  certificateSlug: string | null
}

export interface CertificateDTO {
  id: string
  categorySlug: string
  userName: string
  lessonsPassed: number
  totalLessons: number
  scoreSum: number
  scoreTotal: number
  verificationId: string
  issuedAt: string
}
