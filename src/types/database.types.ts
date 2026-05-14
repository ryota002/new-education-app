export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'trainee' | 'manager'
          level: number
          xp: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'trainee' | 'manager'
          level?: number
          xp?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'trainee' | 'manager'
          level?: number
          xp?: number
          created_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          youtube_url: string
          skill_id: string | null
          required_level: number
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          youtube_url: string
          skill_id?: string | null
          required_level?: number
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          youtube_url?: string
          skill_id?: string | null
          required_level?: number
          order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courses_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          question: string
          options: Json
          correct_answer_index: number
          xp_reward: number
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          question: string
          options: Json
          correct_answer_index: number
          xp_reward?: number
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          question?: string
          options?: Json
          correct_answer_index?: number
          xp_reward?: number
          order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quizzes_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          }
        ]
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          answers?: Json
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quiz_attempts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quiz_attempts_quiz_id_fkey'
            columns: ['quiz_id']
            isOneToOne: false
            referencedRelation: 'quizzes'
            referencedColumns: ['id']
          }
        ]
      }
      user_skills: {
        Row: {
          user_id: string
          skill_id: string
          score: number
        }
        Insert: {
          user_id: string
          skill_id: string
          score?: number
        }
        Update: {
          user_id?: string
          skill_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: 'user_skills_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
