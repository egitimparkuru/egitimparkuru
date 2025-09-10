import { z } from 'zod'

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'E-posta adresi gerekli')
  .email('Geçerli bir e-posta adresi girin')

export const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalı')
  .max(100, 'Şifre çok uzun')

export const nameSchema = z
  .string()
  .min(1, 'Bu alan gerekli')
  .min(2, 'En az 2 karakter olmalı')
  .max(50, 'Çok uzun')

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^(\+90|0)?[5][0-9]{9}$/.test(val),
    'Geçerli bir telefon numarası girin (örn: 05551234567)'
  )

// User schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional()
})

// Student schemas
export const createStudentSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  registrationDate: z.string().optional(),
  grade: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
})

export const updateStudentSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  grade: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
})

// Teacher schemas
export const createTeacherSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  employeeId: z.string().min(1, 'Personel ID gerekli'),
  department: z.string().optional(),
  specialization: z.string().min(1, 'Uzmanlık alanı gerekli'),
  hireDate: z.string().min(1, 'İşe başlama tarihi gerekli'),
  salary: z.number().positive().optional()
})

// Task schemas
export const createTaskSchema = z.object({
  description: z.string().min(1, 'Görev açıklaması gerekli'),
  startDate: z.string().min(1, 'Başlangıç tarihi gerekli'),
  startTime: z.string().optional(),
  endDate: z.string().min(1, 'Bitiş tarihi gerekli'),
  endTime: z.string().optional(),
  type: z.enum(['konu_anlatimi', 'konu_anlatimi_video', 'soru_cozumu', 'deneme', 'diger'], {
    errorMap: () => ({ message: 'Geçerli bir görev türü seçin' })
  }),
  resourceName: z.string().min(1, 'Kaynak adı gerekli'),
  pageStart: z.number().int().positive().optional(),
  pageEnd: z.number().int().positive().optional(),
  videoCount: z.number().int().min(0).optional(),
  testCount: z.number().int().min(0).optional(),
  subjectId: z.string().optional()
})

export const updateTaskSchema = createTaskSchema.partial()

// Routine Task schemas
export const createRoutineTaskSchema = z.object({
  name: z.string().min(1, 'Görev adı gerekli'),
  description: z.string().optional(),
  type: z.enum(['konu_anlatimi', 'konu_anlatimi_video', 'soru_cozumu', 'deneme', 'diger'], {
    errorMap: () => ({ message: 'Geçerli bir görev türü seçin' })
  }),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Geçerli bir sıklık seçin' })
  }),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı girin (HH:MM)'),
  subjectId: z.string().optional(),
  studentIds: z.array(z.string()).min(1, 'En az bir öğrenci seçin'),
  selectedDays: z.array(z.number()).optional()
})

export const updateRoutineTaskSchema = createRoutineTaskSchema.partial()

// Test schemas
export const createTestSchema = z.object({
  title: z.string().min(1, 'Test başlığı gerekli'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Ders gerekli'),
  grade: z.string().min(1, 'Sınıf gerekli'),
  duration: z.number().int().positive('Süre pozitif bir sayı olmalı'),
  isRandomOrder: z.boolean().default(false),
  showCorrectAnswers: z.boolean().default(true),
  allowRetake: z.boolean().default(false),
  maxAttempts: z.number().int().positive().optional()
})

export const updateTestSchema = createTestSchema.partial()

export const createTestQuestionSchema = z.object({
  question: z.string().min(1, 'Soru metni gerekli'),
  type: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'essay'], {
    errorMap: () => ({ message: 'Geçerli bir soru türü seçin' })
  }),
  points: z.number().int().positive('Puan pozitif bir sayı olmalı'),
  order: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  imageUrl: z.string().url().optional()
})

// Question schemas
export const createQuestionSchema = z.object({
  title: z.string().min(1, 'Soru başlığı gerekli'),
  content: z.string().min(1, 'Soru içeriği gerekli')
})

export const answerQuestionSchema = z.object({
  answer: z.string().min(1, 'Cevap gerekli')
})

// Extension Request schemas
export const createExtensionRequestSchema = z.object({
  reason: z.string().min(1, 'Talep nedeni gerekli'),
  requestedDays: z.number().int().positive('Talep edilen gün sayısı pozitif olmalı')
})

export const respondExtensionRequestSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Geçerli bir durum seçin' })
  }),
  approvedDays: z.number().int().min(0).optional(),
  response: z.string().optional()
})

// Subject schemas
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Ders adı gerekli'),
  classId: z.string().min(1, 'Sınıf seçimi gerekli')
})

export const assignSubjectSchema = z.object({
  studentId: z.string().min(1, 'Öğrenci seçimi gerekli'),
  subjectId: z.string().min(1, 'Ders seçimi gerekli')
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Arama terimi gerekli'),
  filters: z.record(z.any()).optional()
})

// Utility function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => err.message).join(', ')
      throw new Error(`Validation error: ${errorMessages}`)
    }
    throw error
  }
}

// Utility function to get validation errors
export function getValidationErrors<T>(schema: z.ZodSchema<T>, data: unknown): string[] {
  try {
    schema.parse(data)
    return []
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message)
    }
    return ['Validation error occurred']
  }
}

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateRoutineTaskInput = z.infer<typeof createRoutineTaskSchema>
export type UpdateRoutineTaskInput = z.infer<typeof updateRoutineTaskSchema>
export type CreateTestInput = z.infer<typeof createTestSchema>
export type UpdateTestInput = z.infer<typeof updateTestSchema>
export type CreateTestQuestionInput = z.infer<typeof createTestQuestionSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type AnswerQuestionInput = z.infer<typeof answerQuestionSchema>
export type CreateExtensionRequestInput = z.infer<typeof createExtensionRequestSchema>
export type RespondExtensionRequestInput = z.infer<typeof respondExtensionRequestSchema>
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
