import { useCallback, useEffect, useMemo, useState } from 'react'
import Activity from 'lucide-react/dist/esm/icons/activity.js'
import ArrowDownToLine from 'lucide-react/dist/esm/icons/arrow-down-to-line.js'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.js'
import BookOpenCheck from 'lucide-react/dist/esm/icons/book-open-check.js'
import BriefcaseBusiness from 'lucide-react/dist/esm/icons/briefcase-business.js'
import Building2 from 'lucide-react/dist/esm/icons/building-2.js'
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days.js'
import Check from 'lucide-react/dist/esm/icons/check.js'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2.js'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.js'
import CircleHelp from 'lucide-react/dist/esm/icons/circle-help.js'
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list.js'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.js'
import FileCheck2 from 'lucide-react/dist/esm/icons/file-check-2.js'
import FileText from 'lucide-react/dist/esm/icons/file-text.js'
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap.js'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.js'
import LogOut from 'lucide-react/dist/esm/icons/log-out.js'
import Menu from 'lucide-react/dist/esm/icons/menu.js'
import Plus from 'lucide-react/dist/esm/icons/plus.js'
import Search from 'lucide-react/dist/esm/icons/search.js'
import Send from 'lucide-react/dist/esm/icons/send.js'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js'
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal.js'
import Star from 'lucide-react/dist/esm/icons/star.js'
import Upload from 'lucide-react/dist/esm/icons/upload.js'
import X from 'lucide-react/dist/esm/icons/x.js'
import { ApiError, api, jsonBody } from './api'
import type {
  AdminStats,
  Convention,
  ConventionStatus,
  Entreprise,
  Formateur,
  Page,
  Role,
  User,
} from './types'

const roleNames: Record<Role, string> = {
  admin: 'Administration',
  formateur: 'Formateur',
  stagiaire: 'Stagiaire',
  entreprise: 'Entreprise',
}

const roleIcons: Record<Role, typeof ShieldCheck> = {
  admin: ShieldCheck,
  formateur: BookOpenCheck,
  stagiaire: GraduationCap,
  entreprise: Building2,
}

const statusNames: Record<ConventionStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'À examiner',
  acceptee_entreprise: 'Acceptée',
  validee: 'En cours',
  refusee: 'Refusée',
  terminee: 'Terminée',
}

const statusStyles: Record<ConventionStatus, string> = {
  brouillon: 'muted',
  soumise: 'amber',
  acceptee_entreprise: 'blue',
  validee: 'green',
  refusee: 'red',
  terminee: 'slate',
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date(value))

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ofppt_token'))
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(Boolean(token))
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  useEffect(() => {
    if (!token) {
      setBooting(false)
      return
    }
    api<User>('/me', {}, token)
      .then(setUser)
      .catch((error: unknown) => {
        setLoginError(error instanceof Error ? error.message : 'La session n’a pas pu être restaurée.')
        sessionStorage.removeItem('ofppt_token')
        setToken(null)
      })
      .finally(() => setBooting(false))
  }, [token])

  async function login(email: string, password: string) {
    setLoginBusy(true)
    setLoginError('')
    try {
      const result = await api<{ token: string; user: User }>('/login', {
        method: 'POST',
        body: jsonBody({ email, password }),
      })
      sessionStorage.setItem('ofppt_token', result.token)
      setToken(result.token)
      setUser(result.user)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Connexion impossible.')
    } finally {
      setLoginBusy(false)
    }
  }

  async function logout() {
    try {
      if (token) await api('/logout', { method: 'POST' }, token)
    } catch (error) {
      setLoginError(error instanceof Error
        ? `La session locale a été fermée, mais la déconnexion serveur a échoué : ${error.message}`
        : 'La session locale a été fermée, mais la déconnexion serveur a échoué.')
    }
    sessionStorage.removeItem('ofppt_token')
    setToken(null)
    setUser(null)
  }

  if (booting) return <div className="loading-screen"><div className="loader" />Chargement de votre espace…</div>
  if (!user || !token) {
    return <LoginScreen onLogin={login} error={loginError} busy={loginBusy} />
  }
  return <Workspace user={user} token={token} onLogout={logout} />
}

function LoginScreen({
  onLogin,
  error,
  busy,
}: {
  onLogin: (email: string, password: string) => void
  error: string
  busy: boolean
}) {
  const [email, setEmail] = useState('admin@ofppt.test')
  const [password, setPassword] = useState('password')

  return (
    <main className="login-page">
      <section className="login-brand">
        <a className="brand-lockup" href="#accueil" aria-label="Stages OFPPT, accueil">
          <span className="brand-mark"><GraduationCap size={25} /></span>
          <span><strong>OFPPT</strong><small>PORTAIL STAGES & PFE</small></span>
        </a>
        <div className="brand-message">
          <span className="eyebrow light"><span /> L’AVENIR SE CONSTRUIT ENSEMBLE</span>
          <h1>Le talent<br />en mouvement.</h1>
          <p>Un seul espace pour accompagner chaque étape du parcours professionnel.</p>
          <div className="brand-stats">
            <div><strong>4</strong><span>espaces dédiés</span></div>
            <div><strong>360°</strong><span>de suivi pédagogique</span></div>
          </div>
        </div>
        <span className="brand-footer">OFFICE DE LA FORMATION PROFESSIONNELLE<br />ET DE LA PROMOTION DU TRAVAIL</span>
      </section>
      <section className="login-panel">
        <div className="login-panel-top"><span>Portail de gestion des stages</span><CircleHelp size={18} /></div>
        <div className="login-form-wrap">
          <span className="eyebrow">BIENVENUE SUR VOTRE ESPACE</span>
          <h2>Connexion</h2>
          <p>Accédez à votre espace de suivi sécurisé.</p>
          <form onSubmit={(event) => {
            event.preventDefault()
            onLogin(email, password)
          }}>
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nom@exemple.ma" required />
            <div className="label-row"><label htmlFor="password">Mot de passe</label><a href="#aide">Besoin d’aide ?</a></div>
            <input id="password" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary button-wide" type="submit" disabled={busy}>
              {busy ? 'Connexion…' : 'Accéder à mon espace'} <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-note"><ShieldCheck size={17} /><span>Connexion sécurisée — vos données restent confidentielles.</span></div>
          <div className="demo-hint">Accès de démonstration : comptes et mot de passe indiqués dans le README.</div>
        </div>
        <div className="login-copyright">© OFPPT · Plateforme de suivi des stages et PFE</div>
      </section>
    </main>
  )
}

function Workspace({ user, token, onLogout }: { user: User; token: string; onLogout: () => void }) {
  const [conventions, setConventions] = useState<Convention[]>([])
  const [companies, setCompanies] = useState<Entreprise[]>([])
  const [trainers, setTrainers] = useState<Formateur[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ConventionStatus | 'toutes'>('toutes')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingConvention, setEditingConvention] = useState<Convention | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [page, companyList] = await Promise.all([
        api<Page<Convention>>('/conventions?per_page=100', {}, token),
        api<Entreprise[]>('/entreprises', {}, token),
      ])
      setConventions(page.data)
      setCompanies(companyList)
      if (user.role === 'admin') {
        const [dashboardStats, trainerList] = await Promise.all([
          api<AdminStats>('/admin/stats', {}, token),
          api<Formateur[]>('/admin/formateurs', {}, token),
        ])
        setStats(dashboardStats)
        setTrainers(trainerList)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }, [token, user.role])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const visible = useMemo(() => conventions.filter((convention) => {
    const matchesStatus = filter === 'toutes' || convention.statut === filter
    const query = search.trim().toLocaleLowerCase('fr')
    const matchesSearch = !query || [
      convention.sujet,
      convention.numero,
      convention.stagiaire.user.name,
      convention.entreprise.raison_sociale,
    ].some((value) => value.toLocaleLowerCase('fr').includes(query))
    return matchesStatus && matchesSearch
  }), [conventions, filter, search])

  const selected = conventions.find((convention) => convention.id === selectedId) ?? visible[0] ?? null
  const pendingCount = conventions.filter((convention) =>
    ['soumise', 'acceptee_entreprise'].includes(convention.statut),
  ).length
  const ongoingCount = conventions.filter((convention) => convention.statut === 'validee').length
  const completion = selected && selected.statut === 'validee'
    ? Math.max(0, Math.min(100, Math.round(
      selected.suivis.at(-1)?.avancement ?? 0,
    )))
    : 0

  async function perform(path: string, options: RequestInit, success: string) {
    try {
      await api(path, options, token)
      setToast(success)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.')
    }
  }

  const filterOptions: Array<{ id: ConventionStatus | 'toutes'; label: string }> = [
    { id: 'toutes', label: 'Toutes' },
    { id: 'soumise', label: 'À examiner' },
    { id: 'validee', label: 'En cours' },
    { id: 'terminee', label: 'Terminées' },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <a href="#dashboard" className="sidebar-brand-link">
            <span className="brand-mark"><GraduationCap size={23} /></span>
            <span><strong>OFPPT</strong><small>STAGES & PFE</small></span>
          </a>
          <button className="mobile-close icon-button" aria-label="Fermer le menu" onClick={() => setMobileNav(false)}><X size={19} /></button>
        </div>
        <div className="sidebar-campus"><span className="campus-dot" /><span>ÉTABLISSEMENT<small>ISTA — Casablanca</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">ESPACE DE TRAVAIL</div>
        <nav className="main-nav" aria-label="Navigation principale">
          <a className="nav-item active" href="#dashboard"><LayoutDashboard size={18} />Vue d’ensemble</a>
          <a className="nav-item" href="#conventions"><FileText size={18} />Conventions{pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}</a>
          <a className="nav-item" href="#suivi"><Activity size={18} />Suivi pédagogique</a>
          <a className="nav-item" href="#rapports"><ClipboardList size={18} />Rapports</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Besoin d’aide ?</strong><p>Notre équipe vous accompagne dans vos démarches.</p><a href="mailto:support@ofppt.ma">Contacter le support <ArrowRight size={14} /></a></div>
          <button className="nav-item logout" onClick={onLogout}><LogOut size={18} />Se déconnecter</button>
        </div>
      </aside>
      {mobileNav && <button className="mobile-backdrop" aria-label="Fermer le menu" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Ouvrir le menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Tableau de bord</span><span className="crumb-sep">/</span><strong>{roleNames[user.role]}</strong></div>
          <div className="topbar-actions">
            <span className="top-divider" />
            <button className="profile-menu" onClick={onLogout} title="Se déconnecter">
              <span className={`avatar avatar-${user.role}`}>{initials(user.name)}</span>
              <span className="profile-copy"><strong>{user.name}</strong><small>{roleNames[user.role]}</small></span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        <div className="page-content" id="dashboard">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="tiny-dot" /> ESPACE {roleNames[user.role].toUpperCase()}</div>
              <h1>Bonjour, {user.name.split(' ')[0]} <span className="wave">✦</span></h1>
              <p className="welcome-subtitle">Voici le point sur vos stages et les prochaines étapes.</p>
            </div>
            <div className="welcome-actions">
              <div className="date-pill"><CalendarDays size={16} />{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</div>
              {user.role === 'stagiaire' && <button className="button button-primary" onClick={() => { setEditingConvention(null); setCreateOpen(true) }}><Plus size={17} />Nouvelle convention</button>}
            </div>
          </div>

          {error && <div className="error-banner" role="alert"><CircleHelp size={17} /><span>{error}</span><button className="text-button" onClick={() => void refresh()}>Réessayer</button></div>}

          <section className="summary-grid">
            <SummaryCard icon={<FileCheck2 size={18} />} label="Conventions suivies" value={String(stats ? stats.conventions?.validee ?? 0 : conventions.length).padStart(2, '0')} caption="Dossiers dans votre espace" tone="sage" />
            <SummaryCard icon={<Clock3 size={18} />} label={user.role === 'entreprise' ? 'Demandes à examiner' : 'En attente de validation'} value={String(pendingCount).padStart(2, '0')} caption="Une action est peut-être attendue" tone="sand" />
            <SummaryCard icon={<Activity size={18} />} label="Stages en cours" value={String(ongoingCount).padStart(2, '0')} caption={user.role === 'stagiaire' ? 'Votre progression moyenne' : 'Suivi pédagogique actif'} tone="blue" />
            <SummaryCard icon={<Star size={18} />} label="Rapports à corriger" value={String(stats?.rapports_a_corriger ?? conventions.flatMap((item) => item.rapports).filter((report) => report.statut === 'a_corriger').length).padStart(2, '0')} caption="Retours en attente" tone="peach" />
          </section>

          {user.role === 'admin' && stats && <section className="admin-strip"><div className="section-heading compact"><div><span className="eyebrow">VUE ÉTABLISSEMENT</span><h2>La plateforme en chiffres</h2></div><span className="update-label"><span className="live-dot" />Données en temps réel</span></div><div className="admin-metrics">{(['stagiaire', 'formateur', 'entreprise'] as const).map((role) => { const Icon = roleIcons[role]; return <div className="admin-metric" key={role}><span className={`metric-icon ${role}`}><Icon size={17} /></span><span>{roleNames[role]}<strong>{stats.utilisateurs?.[role] ?? 0}</strong></span></div> })}<div className="admin-metric"><span className="metric-icon admin"><FileText size={17} /></span><span>Dossiers à traiter<strong>{pendingCount}</strong></span></div></div></section>}

          <div className="workspace-grid">
            <section className="list-panel" id="conventions">
              <div className="section-heading"><div><span className="eyebrow">ESPACE DE SUIVI</span><h2>Conventions de stage</h2></div><button className="icon-button filter-button" aria-label="Options de filtre"><SlidersHorizontal size={17} /></button></div>
              <div className="list-toolbar">
                <div className="search-box"><Search size={16} /><input aria-label="Rechercher une convention" placeholder="Rechercher un dossier..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
                <div className="filter-tabs" role="tablist" aria-label="Filtrer les conventions">{filterOptions.map((option) => <button key={option.id} role="tab" aria-selected={filter === option.id} className={filter === option.id ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(option.id)}>{option.label}</button>)}</div>
              </div>
              {loading ? <div className="empty-state"><div className="loader" />Chargement des dossiers…</div> : visible.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><FileText size={20} /></div><strong>Aucune convention à afficher</strong><span>Les dossiers correspondant à vos filtres apparaîtront ici.</span>{user.role === 'stagiaire' && <button className="button button-outline" onClick={() => { setEditingConvention(null); setCreateOpen(true) }}><Plus size={15} />Créer une demande</button>}</div>
              ) : (
                <div className="convention-table-wrap"><table className="convention-table"><thead><tr><th>DOSSIER</th><th>{user.role === 'stagiaire' ? 'ENTREPRISE' : 'STAGIAIRE'}</th><th>PÉRIODE</th><th>STATUT</th><th /></tr></thead><tbody>{visible.map((convention) => <tr key={convention.id} className={selected?.id === convention.id ? 'row-selected' : ''} onClick={() => setSelectedId(convention.id)}><td><div className="dossier-title"><span className="document-icon"><FileText size={16} /></span><span><strong>{convention.sujet}</strong><small>{convention.numero} · {convention.type === 'pfe' ? 'Projet de fin d’études' : 'Stage professionnel'}</small></span></div></td><td><div className="person-cell"><span className="avatar avatar-mini">{initials(user.role === 'stagiaire' ? convention.entreprise.raison_sociale : convention.stagiaire.user.name)}</span><span><strong>{user.role === 'stagiaire' ? convention.entreprise.raison_sociale : convention.stagiaire.user.name}</strong><small>{user.role === 'stagiaire' ? convention.entreprise.ville ?? 'Entreprise d’accueil' : convention.stagiaire.filiere?.code ?? 'Stagiaire'}</small></span></div></td><td><span className="period">{formatDate(convention.date_debut)}<br /><span>au {formatDate(convention.date_fin)}</span></span></td><td><StatusBadge status={convention.statut} /></td><td><button className="row-open" aria-label={`Ouvrir ${convention.numero}`} onClick={(event) => { event.stopPropagation(); setSelectedId(convention.id) }}><ArrowRight size={16} /></button></td></tr>)}</tbody></table><div className="table-footer"><span>Affichage de <strong>{visible.length}</strong> dossier{visible.length > 1 ? 's' : ''}</span><button className="text-button" onClick={() => setFilter('toutes')}>Voir tous les dossiers <ArrowRight size={14} /></button></div></div>
              )}
            </section>

            <aside className="detail-column">
              <section className="detail-card">
                <div className="detail-card-head"><div><span className="eyebrow">DOSSIER SÉLECTIONNÉ</span><button className="details-link" onClick={() => selected && setSelectedId(selected.id)}>Détails <ArrowRight size={14} /></button></div><button className="icon-button" aria-label="Plus d’options"><span className="more-dots">···</span></button></div>
                {selected ? <ConventionDetails
                  key={selected.id}
                  user={user}
                  token={token}
                  convention={selected}
                  companies={companies}
                  trainers={trainers}
                  completion={completion}
                  onAction={perform}
                  onEdit={() => { setEditingConvention(selected); setCreateOpen(true) }}
                /> : <div className="detail-empty"><BriefcaseBusiness size={24} /><span>Sélectionnez une convention pour voir son suivi.</span></div>}
              </section>
              <section className="next-card"><div className="next-card-icon"><CalendarDays size={18} /></div><div><span className="eyebrow">À NE PAS MANQUER</span><strong>{user.role === 'formateur' ? 'Planifier un suivi' : user.role === 'entreprise' ? 'Évaluer votre stagiaire' : 'Gardez le cap sur votre stage'}</strong><p>{user.role === 'formateur' ? 'Consignez une visite pour actualiser la progression.' : 'Toutes les étapes sont réunies dans votre espace.'}</p></div><ArrowRight size={16} /></section>
            </aside>
          </div>
          <footer className="page-footer"><span>© OFPPT {new Date().getFullYear()} · Un avenir à construire</span><div><a href="#confidentialite">Confidentialité</a><a href="#assistance">Assistance</a><span className="footer-status"><span />Tous les services sont opérationnels</span></div></footer>
        </div>
      </main>
      {createOpen && <CreateConventionModal
        key={editingConvention?.id ?? 'new'}
        companies={companies}
        convention={editingConvention}
        token={token}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => { setCreateOpen(false); setEditingConvention(null); setToast(editingConvention ? 'Votre convention a été mise à jour.' : 'Votre convention a été enregistrée en brouillon.'); await refresh() }}
      />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}<button className="toast-close" aria-label="Fermer" onClick={() => setToast('')}><X size={15} /></button></div>}
    </div>
  )
}

function SummaryCard({ icon, label, value, caption, tone }: { icon: React.ReactNode; label: string; value: string; caption: string; tone: string }) {
  return <article className="summary-card"><div className="summary-top"><span className={`summary-icon ${tone}`}>{icon}</span></div><div className="summary-number">{value}</div><div className="summary-label">{label}</div><p>{caption}</p><div className="summary-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
}

function StatusBadge({ status }: { status: ConventionStatus }) {
  return <span className={`status-badge ${statusStyles[status]}`}><span />{statusNames[status]}</span>
}

function ConventionDetails({
  user,
  token,
  convention,
  companies,
  trainers,
  completion,
  onAction,
  onEdit,
}: {
  user: User
  token: string
  convention: Convention
  companies: Entreprise[]
  trainers: Formateur[]
  completion: number
  onAction: (path: string, options: RequestInit, message: string) => Promise<void>
  onEdit: () => void
}) {
  const [refusal, setRefusal] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const [followComment, setFollowComment] = useState('')
  const [progress, setProgress] = useState(50)
  const savedEvaluation = convention.evaluations.find((item) => item.type === user.role)
  const [evaluation, setEvaluation] = useState({
    note_technique: String(savedEvaluation?.note_technique ?? 15),
    note_autonomie: String(savedEvaluation?.note_autonomie ?? 15),
    note_communication: String(savedEvaluation?.note_communication ?? 15),
    note_rapport: String(savedEvaluation?.note_rapport ?? 15),
    note_soutenance: String(savedEvaluation?.note_soutenance ?? 15),
    commentaire: savedEvaluation?.commentaire ?? '',
  })
  const [reportNotes, setReportNotes] = useState<Record<number, string>>({})
  const [localError, setLocalError] = useState('')
  const role = user.role

  async function action(name: string, data: unknown, message: string) {
    setLocalError('')
    await onAction(`/conventions/${convention.id}/${name}`, { method: 'PATCH', body: jsonBody(data) }, message)
  }

  async function sendEvaluation(event: React.FormEvent) {
    event.preventDefault()
    setLocalError('')
    try {
      await api(`/conventions/${convention.id}/evaluations`, {
        method: 'POST',
        body: jsonBody(Object.fromEntries(Object.entries(evaluation).map(([key, value]) => [key, key === 'commentaire' ? value : Number(value)]))),
      }, token)
      await onAction(`/conventions/${convention.id}`, {}, 'Évaluation enregistrée.')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Évaluation impossible.')
    }
  }

  async function uploadReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')
    const form = new FormData(event.currentTarget)
    try {
      await api(`/conventions/${convention.id}/rapports`, { method: 'POST', body: form }, token)
      await onAction(`/conventions/${convention.id}`, {}, 'Rapport déposé avec succès.')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Dépôt impossible.')
    }
  }

  async function addFollowUp(event: React.FormEvent) {
    event.preventDefault()
    setLocalError('')
    try {
      await api(`/conventions/${convention.id}/suivis`, {
        method: 'POST',
        body: jsonBody({
          date_visite: new Date().toISOString().slice(0, 10),
          type: 'reunion',
          commentaire: followComment,
          avancement: progress,
        }),
      }, token)
      await onAction(`/conventions/${convention.id}`, {}, 'Suivi pédagogique ajouté.')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Suivi impossible.')
    }
  }

  async function downloadReport(id: number) {
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
      const response = await fetch(`${apiBase}/rapports/${id}/telecharger`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
      if (!response.ok) throw new ApiError('Téléchargement impossible.', response.status)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapport-${id}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Téléchargement impossible.')
    }
  }

  async function downloadConvention(id: number) {
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
      const response = await fetch(`${apiBase}/conventions/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
      })
      if (!response.ok) throw new ApiError('Téléchargement impossible.', response.status)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `convention-${id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Téléchargement impossible.')
    }
  }

  const steps = [
    { label: 'Demande créée', complete: true },
    { label: 'Accord entreprise', complete: ['acceptee_entreprise', 'validee', 'terminee'].includes(convention.statut) },
    { label: 'Validation OFPPT', complete: ['validee', 'terminee'].includes(convention.statut) },
    { label: 'Stage terminé', complete: convention.statut === 'terminee' },
  ]

  return (
    <div className="detail-content">
      <div className="detail-title-row"><div className="detail-file-icon"><BriefcaseBusiness size={20} /></div><div><span className="detail-number">{convention.numero}</span><h3>{convention.sujet}</h3></div></div>
      <div className="detail-status-row"><StatusBadge status={convention.statut} /><span>{convention.type === 'pfe' ? 'Projet de fin d’études' : 'Stage professionnel'}</span></div>
      <div className="detail-progress"><div className="progress-label"><span>Progression du stage</span><strong>{convention.statut === 'validee' ? `${completion}%` : convention.statut === 'terminee' ? '100%' : '—'}</strong></div><div className="progress-track"><span style={{ width: `${convention.statut === 'terminee' ? 100 : completion}%` }} /></div></div>
      <div className="detail-dates"><div><span>DÉBUT</span><strong>{formatDate(convention.date_debut)}</strong></div><div className="date-divider" /><div><span>FIN PRÉVUE</span><strong>{formatDate(convention.date_fin)}</strong></div></div>
      <div className="detail-people">
        <div className="person-row"><span className="avatar avatar-mini">{initials(convention.stagiaire.user.name)}</span><span><small>STAGIAIRE</small><strong>{convention.stagiaire.user.name}</strong></span></div>
        <div className="person-row"><span className="avatar avatar-mini company-avatar">{initials(convention.entreprise.raison_sociale)}</span><span><small>ENTREPRISE</small><strong>{convention.entreprise.raison_sociale}</strong></span></div>
        <div className="person-row"><span className="avatar avatar-mini trainer-avatar"><BookOpenCheck size={13} /></span><span><small>ENCADRANT</small><strong>{convention.formateur?.user.name ?? 'À affecter'}</strong></span></div>
      </div>
      {convention.motif_refus && <div className="refusal-note"><strong>Motif du refus</strong><span>{convention.motif_refus}</span></div>}
      <div className="workflow"><span className="eyebrow">ÉTAPES DU DOSSIER</span>{steps.map((step, index) => <div className={`workflow-step ${step.complete ? 'complete' : ''}`} key={step.label}><span className="workflow-marker">{step.complete ? <Check size={12} /> : index + 1}</span><span>{step.label}</span></div>)}</div>
      <div className="detail-actions">
        {['validee', 'terminee'].includes(convention.statut) && <button className="button button-outline button-wide" onClick={() => void downloadConvention(convention.id)}><ArrowDownToLine size={15} />Télécharger la convention PDF</button>}
        {role === 'stagiaire' && ['brouillon', 'refusee'].includes(convention.statut) && <button className="button button-outline button-wide" onClick={onEdit}><FileText size={15} />Modifier la demande</button>}
        {role === 'stagiaire' && ['brouillon', 'refusee'].includes(convention.statut) && <button className="button button-primary button-wide" onClick={() => void action('soumettre', {}, 'Demande transmise à l’entreprise.')}><Send size={15} />Soumettre la demande</button>}
        {role === 'entreprise' && convention.statut === 'soumise' && <><button className="button button-primary button-wide" onClick={() => void action('accepter', {}, 'Demande acceptée.')}><Check size={15} />Accepter la demande</button><div className="inline-action"><input aria-label="Motif du refus" placeholder="Motif du refus" value={refusal} onChange={(event) => setRefusal(event.target.value)} /><button className="button button-outline" disabled={!refusal.trim()} onClick={() => void action('refuser', { motif: refusal }, 'Demande refusée.')}>Refuser</button></div></>}
        {role === 'admin' && convention.statut === 'acceptee_entreprise' && <div className="inline-action"><select aria-label="Formateur encadrant" value={trainerId} onChange={(event) => setTrainerId(event.target.value)}><option value="">Affecter un encadrant</option>{trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.user.name}</option>)}</select><button className="button button-primary" disabled={!trainerId} onClick={() => void action('valider', { formateur_id: Number(trainerId) }, 'Convention validée et encadrant affecté.')}><Check size={15} />Valider</button></div>}
        {role === 'admin' && convention.statut === 'validee' && <button className="button button-outline button-wide" onClick={() => void action('terminer', {}, 'Stage clôturé.')}>Clôturer le stage</button>}
        {role === 'admin' && ['soumise', 'acceptee_entreprise'].includes(convention.statut) && <div className="inline-action"><input aria-label="Motif du refus" placeholder="Motif du refus" value={refusal} onChange={(event) => setRefusal(event.target.value)} /><button className="button button-outline" disabled={!refusal.trim()} onClick={() => void action('refuser', { motif: refusal }, 'Convention refusée.')}>Refuser</button></div>}
          {role === 'stagiaire' && convention.statut === 'validee' && <form id="rapports" className="upload-form" onSubmit={(event) => void uploadReport(event)}><span className="eyebrow">DÉPÔT DE RAPPORT</span><div className="inline-action"><input name="titre" placeholder="Titre du rapport" aria-label="Titre du rapport" required /><select name="type" aria-label="Type de rapport"><option value="intermediaire">Intermédiaire</option><option value="final">Final</option></select></div><label className="upload-input"><Upload size={15} /><span>Choisir un PDF, DOC ou DOCX (10 Mo max.)</span><input name="fichier" type="file" accept=".pdf,.doc,.docx" required /></label><button className="button button-primary button-wide" type="submit"><Upload size={15} />Déposer le rapport</button></form>}
          {role === 'formateur' && convention.statut === 'validee' && <form id="suivi" className="follow-form" onSubmit={(event) => void addFollowUp(event)}><span className="eyebrow">NOUVEAU SUIVI</span><textarea value={followComment} onChange={(event) => setFollowComment(event.target.value)} placeholder="Commentaire de suivi" required /><div className="inline-action"><label className="range-field">Avancement <strong>{progress}%</strong><input type="range" min="0" max="100" step="5" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></label><button className="button button-primary" type="submit"><Plus size={15} />Ajouter</button></div></form>}
        {role === 'formateur' && convention.statut === 'validee' && <form className="evaluation-form" onSubmit={(event) => void sendEvaluation(event)}><span className="eyebrow">ÉVALUATION PÉDAGOGIQUE /20</span><div className="grade-grid">{(['note_technique', 'note_autonomie', 'note_communication', 'note_rapport', 'note_soutenance'] as const).map((key) => <label key={key}>{key.replace('note_', '').replace('_', ' ')}<input type="number" min="0" max="20" step="0.25" value={evaluation[key]} onChange={(event) => setEvaluation({ ...evaluation, [key]: event.target.value })} /></label>)}</div><textarea value={evaluation.commentaire} onChange={(event) => setEvaluation({ ...evaluation, commentaire: event.target.value })} placeholder="Commentaire d’évaluation" /><button className="button button-primary button-wide" type="submit">Enregistrer l’évaluation</button></form>}
        {role === 'entreprise' && convention.statut === 'validee' && <form className="evaluation-form" onSubmit={(event) => void sendEvaluation(event)}><span className="eyebrow">ÉVALUATION ENTREPRISE /20</span><div className="grade-grid">{(['note_technique', 'note_autonomie', 'note_communication', 'note_rapport', 'note_soutenance'] as const).map((key) => <label key={key}>{key.replace('note_', '').replace('_', ' ')}<input type="number" min="0" max="20" step="0.25" value={evaluation[key]} onChange={(event) => setEvaluation({ ...evaluation, [key]: event.target.value })} /></label>)}</div><textarea value={evaluation.commentaire} onChange={(event) => setEvaluation({ ...evaluation, commentaire: event.target.value })} placeholder="Commentaire d’évaluation" /><button className="button button-primary button-wide" type="submit">Enregistrer l’évaluation</button></form>}
      </div>
      {localError && <div className="form-error" role="alert">{localError}</div>}
      {convention.suivis.length > 0 && <div className="detail-history"><span className="eyebrow">DERNIER SUIVI</span><div className="history-row"><span className="history-dot" /><span><strong>{convention.suivis.at(-1)?.commentaire}</strong><small>{formatDate(convention.suivis.at(-1)!.date_visite)} · {convention.suivis.at(-1)?.avancement}% d’avancement</small></span></div></div>}
      {convention.rapports.length > 0 && <div id="rapports" className="report-list"><span className="eyebrow">RAPPORTS DÉPOSÉS</span>{convention.rapports.map((report) => <div className="report-row" key={report.id}><FileText size={16} /><span><strong>{report.titre}</strong><small>{report.type === 'final' ? 'Rapport final' : 'Rapport intermédiaire'} · v{report.version} · {report.statut}</small>{report.commentaire_formateur && <small>{report.commentaire_formateur}</small>}</span>{role === 'formateur' && <><input aria-label={`Commentaire sur ${report.titre}`} placeholder="Retour" value={reportNotes[report.id] ?? report.commentaire_formateur ?? ''} onChange={(event) => setReportNotes({ ...reportNotes, [report.id]: event.target.value })} /><select aria-label={`Statut de ${report.titre}`} value={report.statut} onChange={(event) => void onAction(`/rapports/${report.id}/statut`, { method: 'PATCH', body: jsonBody({ statut: event.target.value, commentaire_formateur: reportNotes[report.id] ?? report.commentaire_formateur ?? '' }) }, 'Retour sur le rapport enregistré.')}><option value="depose">À relire</option><option value="valide">Valider</option><option value="a_corriger">À corriger</option></select></>}<button className="icon-button" aria-label={`Télécharger ${report.titre}`} onClick={() => void downloadReport(report.id)}><ArrowDownToLine size={15} /></button></div>)}</div>}
      {convention.evaluations.length > 0 && <div className="evaluation-summary"><span className="eyebrow">ÉVALUATIONS</span>{convention.evaluations.map((item) => <div key={item.id}><span>{item.type === 'entreprise' ? 'Entreprise' : 'Formateur'}</span><strong>{((Number(item.note_technique) + Number(item.note_autonomie) + Number(item.note_communication) + Number(item.note_rapport) + Number(item.note_soutenance)) / 5).toFixed(1)}/20</strong></div>)}{convention.evaluations.length === 2 && <div className="final-grade"><span>Note finale (pondération 60/40)</span><strong>{(() => { const average = (type: 'formateur' | 'entreprise') => { const item = convention.evaluations.find((evaluationItem) => evaluationItem.type === type)!; return (Number(item.note_technique) + Number(item.note_autonomie) + Number(item.note_communication) + Number(item.note_rapport) + Number(item.note_soutenance)) / 5 }; return (average('formateur') * 0.6 + average('entreprise') * 0.4).toFixed(1) })()}/20</strong></div>}</div>}
      {companies.length === 0 && role === 'stagiaire' && <p className="tiny-note">Aucune entreprise n’est disponible pour créer une nouvelle convention.</p>}
    </div>
  )
}

function CreateConventionModal({
  companies,
  convention,
  token,
  onClose,
  onCreated,
}: {
  companies: Entreprise[]
  convention: Convention | null
  token: string
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    entreprise_id: convention ? String(convention.entreprise.id) : '',
    type: convention?.type ?? 'stage',
    sujet: convention?.sujet ?? '',
    description: convention?.description ?? '',
    date_debut: convention?.date_debut.slice(0, 10) ?? '',
    date_fin: convention?.date_fin.slice(0, 10) ?? '',
  }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api(convention ? `/conventions/${convention.id}` : '/conventions', {
        method: convention ? 'PUT' : 'POST',
        body: jsonBody({ ...form, entreprise_id: Number(form.entreprise_id) }),
      }, token)
      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-heading"><div><span className="eyebrow">{convention ? 'MISE À JOUR DU DOSSIER' : 'NOUVEAU DOSSIER'}</span><h2 id="create-title">{convention ? 'Modifier la convention' : 'Créer une convention'}</h2><p>{convention ? 'Vérifiez les informations de votre demande avant de la soumettre à nouveau.' : 'Votre demande sera enregistrée en brouillon. Vous pourrez la vérifier avant de la soumettre.'}</p></div><button className="icon-button" aria-label="Fermer" onClick={onClose}><X size={19} /></button></div><form className="create-form" onSubmit={(event) => void submit(event)}><label>Entreprise d’accueil<select required value={form.entreprise_id} onChange={(event) => setForm({ ...form, entreprise_id: event.target.value })}><option value="">Choisir une entreprise</option>{companies.map((company) => <option value={company.id} key={company.id}>{company.raison_sociale}{company.ville ? ` — ${company.ville}` : ''}</option>)}</select></label><label>Type de convention<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value === 'pfe' ? 'pfe' : 'stage' })}><option value="stage">Stage professionnel</option><option value="pfe">Projet de fin d’études</option></select></label><label>Sujet du stage<input required maxLength={255} value={form.sujet} onChange={(event) => setForm({ ...form, sujet: event.target.value })} placeholder="Ex. Développement d’une application web" /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Décrivez brièvement les missions prévues" /></label><div className="form-two"><label>Date de début<input type="date" required value={form.date_debut} onChange={(event) => setForm({ ...form, date_debut: event.target.value })} /></label><label>Date de fin<input type="date" required min={form.date_debut || undefined} value={form.date_fin} onChange={(event) => setForm({ ...form, date_fin: event.target.value })} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Annuler</button><button type="submit" className="button button-primary" disabled={busy || companies.length === 0}>{busy ? 'Enregistrement…' : convention ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}<ArrowRight size={15} /></button></div></form></section></div>
}

export default App
