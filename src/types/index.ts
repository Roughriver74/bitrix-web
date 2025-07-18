export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Test {
  id: number;
  course_id: number;
  lesson_id?: number;
  title: string;
  description?: string;
  created_at: string;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export interface UserProgress {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number;
  completed: boolean;
  score?: number;
  completed_at?: string;
  created_at: string;
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  max_score: number;
  answers: number[];
  completed_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}