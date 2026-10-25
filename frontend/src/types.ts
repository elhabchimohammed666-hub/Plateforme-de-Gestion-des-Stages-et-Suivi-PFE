export type Role = 'admin' | 'formateur' | 'stagiaire' | 'entreprise'
export type ConventionStatus =
  | 'brouillon'
  | 'soumise'
  | 'acceptee_entreprise'
  | 'validee'
  | 'refusee'
  | 'terminee'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  phone?: string | null
  stagiaire?: { id: number; cef: string; groupe?: string; filiere?: { nom: string } }
  formateur?: { id: number; specialite?: string }
  entreprise?: { id: number; raison_sociale: string; ville?: string }
}

export interface Filiere {
  id: number
  code: string
  nom: string
}

export interface Entreprise {
  id: number
  raison_sociale: string
  ville?: string
}

export interface Formateur {
  id: number
  user: { id: number; name: string }
  specialite?: string
}

export interface Convention {
  id: number
  numero: string
  type: 'stage' | 'pfe'
  sujet: string
  description?: string | null
  date_debut: string
  date_fin: string
  statut: ConventionStatus
  motif_refus?: string | null
  stagiaire: {
    id: number
    cef: string
    groupe?: string
    user: { id: number; name: string; email: string }
    filiere?: { id: number; code: string; nom: string }
  }
  entreprise: { id: number; raison_sociale: string; ville?: string; user?: { name: string } }
  formateur?: { id: number; user: { name: string } } | null
  suivis: Array<{
    id: number
    date_visite: string
    type: 'visite' | 'appel' | 'reunion'
    commentaire: string
    avancement: number
    formateur?: { user: { name: string } }
  }>
  rapports: Array<{
    id: number
    titre: string
    type: 'intermediaire' | 'final'
    version: number
    statut: 'depose' | 'a_corriger' | 'valide'
    commentaire_formateur?: string | null
  }>
  evaluations: Array<{
    id: number
    type: 'formateur' | 'entreprise'
    note_technique: number
    note_autonomie: number
    note_communication: number
    note_rapport: number
    note_soutenance: number
    commentaire?: string | null
  }>
}

export interface Page<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export interface AdminStats {
  utilisateurs: Record<string, number>
  conventions: Record<string, number>
  rapports_a_corriger: number
}
