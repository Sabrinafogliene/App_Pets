// Conteúdo para: src/types/index.ts

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string | null;
  email: string | null;
  role: 'tutor' | 'veterinario';
}