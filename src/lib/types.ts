// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

// Common API Error Types
export interface ApiError {
  success: false
  error: string
  code?: string
  details?: any
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}

// User Types
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: string
  status: string
  createdAt: string
}

export interface TeacherProfile extends UserProfile {
  employeeId: string
  department?: string
  specialization: string
  hireDate: string
  salary?: number
}

export interface StudentProfile extends UserProfile {
  registrationDate?: string
  grade?: string
  city?: string
  notes?: string
  teacherId: string
}

export interface ParentProfile extends UserProfile {
  occupation?: string
  notes?: string
  studentId?: string
  teacherId: string
}

// Task Types
export interface Task {
  id: string
  description: string
  startDate: string
  startTime?: string
  endDate: string
  endTime?: string
  type: string
  resourceName: string
  pageStart?: number
  pageEnd?: number
  videoCount?: number
  testCount?: number
  status: string
  completedAt?: string
  completionNote?: string
  correctAnswers?: number
  wrongAnswers?: number
  blankAnswers?: number
  totalScore?: number
  testResult?: string
  student: {
    id: string
    user: UserProfile
  }
  teacher: {
    id: string
    user: UserProfile
  }
  subject?: {
    id: string
    name: string
    class: {
      name: string
      level: number
    }
  }
  createdAt: string
  updatedAt: string
}

export interface RoutineTask {
  id: string
  name: string
  description?: string
  type: string
  frequency: string
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  isActive: boolean
  lastExecuted?: string
  nextExecution?: string
  subject?: {
    id: string
    name: string
    class: {
      name: string
      level: number
    }
  }
  students: Array<{
    id: string
    user: UserProfile
  }>
  createdAt: string
  updatedAt: string
}

// Subject Types
export interface Subject {
  id: string
  name: string
  class: {
    id: string
    name: string
    level: number
  }
  topics: Array<{
    id: string
    name: string
  }>
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  name: string
  level: number
  subjects: Subject[]
  createdAt: string
  updatedAt: string
}

// Test Types
export interface Test {
  id: string
  title: string
  description?: string
  subject: string
  grade: string
  duration: number
  questionCount: number
  status: string
  isRandomOrder: boolean
  showCorrectAnswers: boolean
  allowRetake: boolean
  maxAttempts?: number
  questions: TestQuestion[]
  createdAt: string
  updatedAt: string
}

export interface TestQuestion {
  id: string
  question: string
  type: string
  points: number
  order: number
  options?: string[]
  correctAnswer?: string
  explanation?: string
  imageUrl?: string
}

export interface TestAttempt {
  id: string
  startedAt: string
  completedAt?: string
  score?: number
  maxScore?: number
  percentage?: number
  status: string
  test: Test
  student: {
    id: string
    user: UserProfile
  }
  answers: TestAnswer[]
  createdAt: string
  updatedAt: string
}

export interface TestAnswer {
  id: string
  answer?: string
  isCorrect: boolean
  points: number
  question: TestQuestion
  createdAt: string
  updatedAt: string
}

// Question Types
export interface Question {
  id: string
  title: string
  content: string
  status: string
  answer?: string
  answeredAt?: string
  student: {
    id: string
    user: UserProfile
  }
  teacher: {
    id: string
    user: UserProfile
  }
  createdAt: string
  updatedAt: string
}

// Extension Request Types
export interface ExtensionRequest {
  id: string
  reason: string
  status: string
  requestedDays?: number
  approvedDays?: number
  newDueDate?: string
  response?: string
  respondedAt?: string
  task: Task
  student: {
    id: string
    user: UserProfile
  }
  teacher: {
    id: string
    user: UserProfile
  }
  createdAt: string
  updatedAt: string
}

// Form Validation Types
export interface CreateStudentRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  registrationDate?: string
  grade?: string
  city?: string
  notes?: string
}

export interface CreateRoutineTaskRequest {
  name: string
  description?: string
  type: string
  frequency: string
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  subjectId?: string
  studentIds: string[]
}

export interface UpdateRoutineTaskRequest {
  name?: string
  description?: string
  type?: string
  frequency?: string
  dayOfWeek?: number
  dayOfMonth?: number
  time?: string
  subjectId?: string
  studentIds?: string[]
  isActive?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: UserProfile
  accessToken: string
  sessionToken: string
}

// Statistics Types
export interface DashboardStats {
  totalStudents: number
  activeTasks: number
  completedTasks: number
  pendingQuestions: number
  upcomingTests: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    student?: {
      id: string
      user: UserProfile
    }
  }>
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

export interface StudentStats {
  total: number
  active: number
  inactive: number
  averageProgress: number
}
