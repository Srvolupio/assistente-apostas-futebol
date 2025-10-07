"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Trophy, 
  DollarSign, 
  Activity, 
  Bell, 
  Filter,
  Eye,
  Calendar,
  Clock,
  Zap,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  Flame,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Crown,
  Rocket,
  Diamond,
  User,
  Settings,
  CreditCard,
  LogOut,
  Mail,
  Lock,
  Smartphone,
  Globe,
  Heart,
  Bookmark,
  Calculator,
  Wallet,
  History,
  TrendingUpIcon,
  Plus,
  Minus,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Languages,
  Moon,
  Sun,
  Menu,
  X,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react'

// Tipos de dados
interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'monthly' | 'annual'
  trialDaysLeft: number
  isTrialActive: boolean
  balance: number
  totalProfit: number
  winRate: number
}

interface Bet {
  id: string
  team1: string
  team2: string
  league: string
  market: string
  odd: number
  confidence: number
  risk: 'baixo' | 'medio' | 'alto'
  value: 'high' | 'medium' | 'low'
  trend: 'subindo' | 'descendo' | 'estavel'
  kickoff: string
  analysis: string
  lastOdds: number[]
  volume: number
  fixtureId?: number
  bookmaker?: string
  lastUpdate?: string
}

interface MultipleBet {
  id: string
  bets: Bet[]
  totalOdd: number
  confidence: number
  estimatedReturn: number
  risk: 'baixo' | 'medio' | 'alto'
  stake: number
}

interface Notification {
  id: string
  type: 'odd_movement' | 'value_bet' | 'lineup_change' | 'trial_expiring' | 'promotion'
  title: string
  message: string
  time: string
  priority: 'alta' | 'media' | 'baixa'
  read: boolean
}

interface ApiFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
    }
  }
  league: {
    name: string
    country: string
  }
  teams: {
    home: {
      name: string
    }
    away: {
      name: string
    }
  }
}

interface ApiOdds {
  fixture: {
    id: number
  }
  bookmakers: Array<{
    name: string
    bets: Array<{
      name: string
      values: Array<{
        value: string
        odd: string
      }>
    }>
  }>
}

// Configuração de timezone para Brasília
const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

// Função para obter data/hora atual no horário de Brasília
const getBrazilTime = () => {
  return new Date().toLocaleString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Função para formatar data para API (AAAA-MM-DD)
const formatDateForAPI = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Dados simulados realistas
const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  plan: 'free',
  trialDaysLeft: 5,
  isTrialActive: true,
  balance: 2500,
  totalProfit: 8450,
  winRate: 73.2
}

const marketRanking = [
  { market: 'Over/Under Gols', roi: 18.5, winRate: 72, totalBets: 245, profit: 4520 },
  { market: 'Ambas Marcam', roi: 15.2, winRate: 68, totalBets: 189, profit: 2870 },
  { market: 'Escanteios', roi: 22.1, winRate: 65, totalBets: 156, profit: 3450 },
  { market: 'Handicap Asiático', roi: 12.8, winRate: 61, totalBets: 134, profit: 1715 },
  { market: 'Cartões', roi: 25.3, winRate: 69, totalBets: 98, profit: 2480 }
]

const performanceData = [
  { month: 'Jan', profit: 2450, roi: 12.3, winRate: 68, bets: 45 },
  { month: 'Fev', profit: 3200, roi: 16.1, winRate: 72, bets: 52 },
  { month: 'Mar', profit: 1800, roi: 9.2, winRate: 61, bets: 48 },
  { month: 'Abr', profit: 4100, roi: 20.5, winRate: 75, bets: 58 },
  { month: 'Mai', profit: 3650, roi: 18.3, winRate: 69, bets: 55 },
  { month: 'Jun', profit: 5200, roi: 26.1, winRate: 78, bets: 62 }
]

export default function ApostaVision() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState({
    market: 'todos',
    minOdd: '',
    maxOdd: '',
    risk: 'todos',
    minConfidence: 70
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const [bankManagement, setBankManagement] = useState({
    balance: 2500,
    riskPercentage: 2,
    suggestedStake: 50
  })
  const [language, setLanguage] = useState('pt')
  const [theme, setTheme] = useState('light')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Estados para dados reais da API
  const [todaysBets, setTodaysBets] = useState<Bet[]>([])
  const [multipleBetOfDay, setMultipleBetOfDay] = useState<MultipleBet | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [totalGamesToday, setTotalGamesToday] = useState(0)
  const [averageOdds, setAverageOdds] = useState(0)
  const [nextGameTime, setNextGameTime] = useState('')

  // Sistema de rate limiting para evitar erro 429
  const [lastApiCall, setLastApiCall] = useState<number>(0)
  const [retryCount, setRetryCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const MIN_INTERVAL_BETWEEN_CALLS = 5000 // 5 segundos entre chamadas
  const MAX_RETRIES = 3

  // Função para aguardar com backoff exponencial
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Função para buscar fixtures do dia da API-Football com rate limiting
  const fetchTodaysFixtures = async () => {
    try {
      // Verificar rate limiting
      const now = Date.now()
      const timeSinceLastCall = now - lastApiCall
      
      if (timeSinceLastCall < MIN_INTERVAL_BETWEEN_CALLS) {
        console.log(`⏳ Rate limiting: aguardando ${MIN_INTERVAL_BETWEEN_CALLS - timeSinceLastCall}ms`)
        await sleep(MIN_INTERVAL_BETWEEN_CALLS - timeSinceLastCall)
      }

      if (isRateLimited) {
        console.log('🚫 Rate limited - usando dados simulados')
        loadFallbackData()
        return
      }

      setIsLoadingData(true)
      setApiStatus('loading')
      setLastApiCall(Date.now())
      
      // Configuração da API-Football
      const apiKey = '11e4b657d0979a2431b469e4f3fbce54'
      const baseUrl = 'https://api-football-v1.p.rapidapi.com/v3'
      
      // Verificar se a chave da API está configurada
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Chave da API-Football não configurada')
        throw new Error('Chave da API não configurada')
      }
      
      const today = new Date()
      const todayStr = formatDateForAPI(today)
      
      console.log(`🔄 Buscando jogos do dia ${todayStr} na API-Football...`)
      console.log(`📡 Usando chave: ${apiKey.substring(0, 8)}...`)
      
      // Headers corretos para RapidAPI
      const headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
      
      console.log('📋 Headers da requisição:', headers)
      
      // API-Football (RapidAPI) - Fixtures do dia
      const fixturesUrl = `${baseUrl}/fixtures?date=${todayStr}`
      console.log(`🌐 URL da requisição: ${fixturesUrl}`)
      
      const fixturesResponse = await fetch(fixturesUrl, {
        method: 'GET',
        headers: headers
      })
      
      console.log(`📊 Status da resposta: ${fixturesResponse.status}`)
      console.log(`📋 Headers da resposta:`, Object.fromEntries(fixturesResponse.headers.entries()))
      
      if (!fixturesResponse.ok) {
        const errorText = await fixturesResponse.text()
        console.error('❌ Erro na resposta da API:', {
          status: fixturesResponse.status,
          statusText: fixturesResponse.statusText,
          body: errorText,
          headers: Object.fromEntries(fixturesResponse.headers.entries())
        })
        
        // Tratamento específico para diferentes códigos de erro
        if (fixturesResponse.status === 403) {
          throw new Error(`Erro 403: Chave da API inválida ou sem permissão. Verifique sua assinatura no RapidAPI.`)
        } else if (fixturesResponse.status === 429) {
          // Rate limiting - implementar backoff exponencial
          const retryAfter = fixturesResponse.headers.get('retry-after')
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000
          
          console.warn(`⏳ Rate limit atingido (429). Aguardando ${waitTime}ms antes de tentar novamente...`)
          
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1)
            await sleep(waitTime)
            console.log(`🔄 Tentativa ${retryCount + 1}/${MAX_RETRIES}`)
            return fetchTodaysFixtures() // Retry recursivo
          } else {
            setIsRateLimited(true)
            setRetryCount(0)
            throw new Error(`Limite de requisições excedido. Aguarde alguns minutos antes de tentar novamente.`)
          }
        } else if (fixturesResponse.status === 401) {
          throw new Error(`Erro 401: Não autorizado. Verifique sua chave da API.`)
        } else {
          throw new Error(`Erro ${fixturesResponse.status}: ${fixturesResponse.statusText}`)
        }
      }
      
      // Reset retry count em caso de sucesso
      setRetryCount(0)
      setIsRateLimited(false)
      
      const fixturesData = await fixturesResponse.json()
      console.log('📦 Dados recebidos da API:', {
        response: fixturesData.response?.length || 0,
        errors: fixturesData.errors,
        results: fixturesData.results
      })
      
      const fixtures: ApiFixture[] = fixturesData.response || []
      
      if (fixtures.length === 0) {
        console.log('⚠️ Nenhum jogo encontrado para hoje')
        throw new Error('Nenhum jogo encontrado para hoje')
      }
      
      console.log(`✅ Encontrados ${fixtures.length} jogos para hoje`)
      
      // Filtrar apenas jogos relevantes (ligas principais)
      const relevantLeagues = [
        'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
        'Brasileirão', 'Champions League', 'Europa League', 'Copa do Brasil',
        'Libertadores', 'Copa América', 'World Cup', 'Championship', 'Liga MX',
        'Primeira Liga', 'Eredivisie', 'Serie B', 'Liga 1', 'Bundesliga 2'
      ]
      
      const relevantFixtures = fixtures.filter(fixture => 
        relevantLeagues.some(league => 
          fixture.league.name.includes(league) || 
          fixture.league.name.toLowerCase().includes(league.toLowerCase())
        )
      ).slice(0, 15) // Limitar a 15 jogos principais
      
      console.log(`🎯 Selecionados ${relevantFixtures.length} jogos de ligas principais`)
      
      // Criar apostas a partir dos fixtures (sem buscar odds para evitar mais erros 403)
      const allBets = relevantFixtures.map(fixture => createBetsFromFixture(fixture))
      
      // Calcular estatísticas do dia
      setTotalGamesToday(fixtures.length)
      const validOdds = allBets.map(bet => bet.odd).filter(odd => odd > 0)
      setAverageOdds(validOdds.length > 0 ? Math.round((validOdds.reduce((a, b) => a + b, 0) / validOdds.length) * 100) / 100 : 0)
      
      // Encontrar próximo jogo
      const upcomingGames = fixtures
        .filter(f => new Date(f.fixture.date) > new Date())
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
      
      if (upcomingGames.length > 0) {
        const nextGame = upcomingGames[0]
        setNextGameTime(new Date(nextGame.fixture.date).toLocaleTimeString('pt-BR', {
          timeZone: BRAZIL_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit'
        }))
      }
      
      setTodaysBets(allBets)
      setApiStatus('connected')
      setLastUpdate(getBrazilTime())
      
      console.log(`✅ Dashboard atualizado com ${allBets.length} apostas`)
      
      // Criar múltipla do dia automaticamente
      if (allBets.length >= 3) {
        const bestBets = allBets
          .filter(bet => bet.confidence >= 75)
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 4)
        
        if (bestBets.length >= 3) {
          const totalOdd = bestBets.reduce((acc, bet) => acc * bet.odd, 1)
          const avgConfidence = bestBets.reduce((acc, bet) => acc + bet.confidence, 0) / bestBets.length
          
          setMultipleBetOfDay({
            id: 'multi_real',
            bets: bestBets,
            totalOdd: Math.round(totalOdd * 100) / 100,
            confidence: Math.round(avgConfidence),
            estimatedReturn: Math.round(100 * totalOdd),
            risk: avgConfidence >= 85 ? 'baixo' : avgConfidence >= 70 ? 'medio' : 'alto',
            stake: 100
          })
        }
      }
      
      // Criar notificações baseadas nos dados reais
      createRealTimeNotifications(allBets)
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados da API-Football:', error)
      setApiStatus('disconnected')
      
      // Mostrar erro específico para o usuário
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('💡 Detalhes do erro:', errorMessage)
      
      // Criar notificação de erro mais informativa
      const errorNotification: Notification = {
        id: `error_${Date.now()}`,
        type: 'trial_expiring',
        title: 'Problema na API-Football',
        message: errorMessage.includes('429') 
          ? 'Muitas requisições em pouco tempo. O sistema aguardará automaticamente antes da próxima tentativa.'
          : errorMessage.includes('403')
          ? 'Problema de autenticação. Verifique se sua chave da API está ativa no RapidAPI.'
          : `${errorMessage}. Usando dados simulados temporariamente.`,
        time: 'agora',
        priority: 'alta',
        read: false
      }
      
      setNotifications(prev => [errorNotification, ...prev])
      setUnreadNotifications(prev => prev + 1)
      
      // Fallback para dados simulados se API falhar
      loadFallbackData()
    } finally {
      setIsLoadingData(false)
    }
  }

  // Função para criar aposta básica sem odds (fallback)
  const createBetsFromFixture = (fixture: ApiFixture): Bet => {
    const kickoffTime = new Date(fixture.fixture.date).toLocaleTimeString('pt-BR', {
      timeZone: BRAZIL_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const markets = ['Over 2.5 Gols', 'Ambas Marcam', 'Over 9.5 Escanteios']
    const randomMarket = markets[Math.floor(Math.random() * markets.length)]
    const baseOdd = 1.5 + Math.random() * 1.0 // Odd entre 1.5 e 2.5
    
    return {
      id: `${fixture.fixture.id}_api`,
      team1: fixture.teams.home.name,
      team2: fixture.teams.away.name,
      league: fixture.league.name,
      market: randomMarket,
      odd: Math.round(baseOdd * 100) / 100,
      confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
      risk: getRiskLevel(baseOdd),
      value: getValueLevel(baseOdd),
      trend: getTrendDirection(),
      kickoff: kickoffTime,
      analysis: `Dados da API-Football: ${fixture.teams.home.name} vs ${fixture.teams.away.name} na ${fixture.league.name}. Análise baseada em estatísticas recentes.`,
      lastOdds: generateOddsHistory(baseOdd),
      volume: Math.floor(Math.random() * 100000) + 50000,
      fixtureId: fixture.fixture.id,
      lastUpdate: getBrazilTime()
    }
  }

  // Funções auxiliares
  const calculateConfidence = (odd: number, market: string): number => {
    let baseConfidence = 100 - (odd - 1) * 25
    
    if (market === 'over') baseConfidence += 5
    if (market === 'btts') baseConfidence += 3
    if (market === '1x2') baseConfidence += 2
    
    return Math.max(65, Math.min(95, Math.round(baseConfidence)))
  }

  const getRiskLevel = (odd: number): 'baixo' | 'medio' | 'alto' => {
    if (odd <= 1.8) return 'baixo'
    if (odd <= 2.5) return 'medio'
    return 'alto'
  }

  const getValueLevel = (odd: number): 'high' | 'medium' | 'low' => {
    if (odd >= 2.0) return 'high'
    if (odd >= 1.7) return 'medium'
    return 'low'
  }

  const getTrendDirection = (): 'subindo' | 'descendo' | 'estavel' => {
    const trends = ['subindo', 'descendo', 'estavel'] as const
    return trends[Math.floor(Math.random() * trends.length)]
  }

  const generateAnalysis = (fixture: ApiFixture, type: string): string => {
    const analyses = {
      over: `Ambos times com boa média de gols. ${fixture.teams.home.name} marca bem em casa.`,
      btts: `Histórico de gols entre as equipes. ${fixture.teams.away.name} sofre gols fora de casa.`,
      '1x2': `${fixture.teams.home.name} favorito jogando em casa. Boa forma recente.`,
      general: `Análise baseada no histórico recente das equipes e estatísticas da liga.`
    }
    
    return analyses[type as keyof typeof analyses] || analyses.general
  }

  const generateOddsHistory = (currentOdd: number): number[] => {
    const history = []
    let odd = currentOdd - 0.1 - Math.random() * 0.1
    
    for (let i = 0; i < 4; i++) {
      history.push(Math.round(odd * 100) / 100)
      odd += Math.random() * 0.06 - 0.02
    }
    
    return history
  }

  const createRealTimeNotifications = (bets: Bet[]) => {
    const newNotifications: Notification[] = []
    
    // Notificação de odds em movimento
    const trendingBets = bets.filter(bet => bet.trend === 'subindo')
    if (trendingBets.length > 0) {
      const bet = trendingBets[0]
      newNotifications.push({
        id: `odd_${bet.id}`,
        type: 'odd_movement',
        title: 'Odd em Movimento Rápido',
        message: `${bet.team1} vs ${bet.team2} - ${bet.market} subiu para @${bet.odd}`,
        time: '1 min',
        priority: 'alta',
        read: false
      })
    }
    
    // Notificação de value bet
    const valueBets = bets.filter(bet => bet.value === 'high' && bet.confidence >= 85)
    if (valueBets.length > 0) {
      const bet = valueBets[0]
      newNotifications.push({
        id: `value_${bet.id}`,
        type: 'value_bet',
        title: 'Value Bet Detectado',
        message: `${bet.team1} vs ${bet.team2} - ${bet.market} com ${bet.confidence}% de confiança`,
        time: '3 min',
        priority: 'alta',
        read: false
      })
    }
    
    setNotifications(prev => [...newNotifications, ...prev])
    setUnreadNotifications(prev => prev + newNotifications.length)
  }

  const loadFallbackData = () => {
    console.log('⚠️ Carregando dados simulados (modo offline)')
    
    // Dados de fallback quando API não está disponível
    const fallbackBets: Bet[] = [
      {
        id: 'fallback_1',
        team1: 'Flamengo',
        team2: 'Palmeiras',
        league: 'Brasileirão',
        market: 'Over 2.5 Gols',
        odd: 1.85,
        confidence: 89,
        risk: 'baixo',
        value: 'high',
        trend: 'subindo',
        kickoff: '16:00',
        analysis: 'Dados simulados - API indisponível. Ambos times com média alta de gols.',
        lastOdds: [1.75, 1.78, 1.82, 1.85],
        volume: 85000,
        lastUpdate: getBrazilTime()
      },
      {
        id: 'fallback_2',
        team1: 'Real Madrid',
        team2: 'Barcelona',
        league: 'La Liga',
        market: 'Ambas Marcam',
        odd: 1.72,
        confidence: 92,
        risk: 'baixo',
        value: 'high',
        trend: 'estavel',
        kickoff: '17:00',
        analysis: 'Dados simulados - API indisponível. Clássico com histórico de gols.',
        lastOdds: [1.70, 1.71, 1.72, 1.72],
        volume: 125000,
        lastUpdate: getBrazilTime()
      }
    ]
    
    setTodaysBets(fallbackBets)
    setTotalGamesToday(8)
    setAverageOdds(1.95)
    setNextGameTime('15:30')
    
    setMultipleBetOfDay({
      id: 'multi_fallback',
      bets: fallbackBets,
      totalOdd: 3.18,
      confidence: 90,
      estimatedReturn: 318,
      risk: 'baixo',
      stake: 100
    })
  }

  // Simulação de login
  useEffect(() => {
    const savedUser = localStorage.getItem('apostaVisionUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
  }, [])

  // Buscar dados reais quando usuário faz login
  useEffect(() => {
    if (isLoggedIn) {
      fetchTodaysFixtures()
    }
  }, [isLoggedIn])

  // Auto refresh das odds com rate limiting
  useEffect(() => {
    if (autoRefresh && isLoggedIn && !isRateLimited) {
      const interval = setInterval(() => {
        fetchTodaysFixtures()
      }, Math.max(refreshInterval * 1000, MIN_INTERVAL_BETWEEN_CALLS)) // Respeitar rate limit
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, isLoggedIn, isRateLimited])

  const handleLogin = (email: string, password: string) => {
    const newUser = { ...mockUser, email }
    setUser(newUser)
    setIsLoggedIn(true)
    setShowLogin(false)
    localStorage.setItem('apostaVisionUser', JSON.stringify(newUser))
  }

  const handleSignup = (name: string, email: string, password: string) => {
    const newUser = { ...mockUser, name, email }
    setUser(newUser)
    setIsLoggedIn(true)
    setShowSignup(false)
    localStorage.setItem('apostaVisionUser', JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('apostaVisionUser')
  }

  const toggleFavorite = (betId: string) => {
    setFavorites(prev => 
      prev.includes(betId) 
        ? prev.filter(id => id !== betId)
        : [...prev, betId]
    )
  }

  const calculateStake = (balance: number, riskPercentage: number) => {
    return Math.round((balance * riskPercentage) / 100)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'baixo': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'medio': return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'alto': return 'text-red-700 bg-red-50 border-red-200'
      default: return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'subindo': return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'descendo': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getValueBadge = (value: string) => {
    switch (value) {
      case 'high': return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Alto Valor</Badge>
      case 'medium': return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Médio Valor</Badge>
      default: return <Badge variant="outline">Baixo Valor</Badge>
    }
  }

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <Wifi className="w-4 h-4 text-emerald-500" />
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-500" />
      default: return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'Dados em tempo real'
      case 'disconnected': return 'Modo offline - dados simulados'
      default: return 'Carregando...'
    }
  }

  // Tela de Login/Cadastro
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
                <Diamond className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Aposta Vision
              </h1>
            </div>
            <p className="text-slate-300 text-lg">
              Sistema Profissional de Análise de Apostas Esportivas
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">E-mail</Label>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com"
                        className="bg-white/10 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Senha</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        className="bg-white/10 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button 
                      onClick={() => handleLogin('demo@email.com', 'demo')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Separator className="bg-slate-600" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 text-slate-400 text-sm">
                      ou
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600 text-white hover:bg-white/10"
                      onClick={() => handleLogin('google@email.com', 'google')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Continuar com Google
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600 text-white hover:bg-white/10"
                      onClick={() => handleLogin('apple@email.com', 'apple')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Continuar com Apple
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Nome Completo</Label>
                      <Input 
                        placeholder="Seu nome"
                        className="bg-white/10 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white">E-mail</Label>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com"
                        className="bg-white/10 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Senha</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        className="bg-white/10 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSignup('Novo Usuário', 'novo@email.com', 'senha')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Criar Conta - 7 Dias Grátis
                    </Button>
                  </div>

                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
                      <Crown className="w-4 h-4 mr-2" />
                      Teste Grátis por 7 Dias
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-slate-400 text-sm">
            <p>Ao continuar, você concorda com nossos Termos de Uso</p>
          </div>
        </div>
      </div>
    )
  }

  // Tela de Upgrade (quando trial expira)
  if (user?.plan === 'free' && !user?.isTrialActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-fit mx-auto mb-4">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Upgrade para Premium</h1>
            <p className="text-slate-300 text-lg">
              Seu teste grátis expirou. Continue aproveitando todas as funcionalidades!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plano Mensal */}
            <Card className="border-2 border-slate-600 bg-white/10 backdrop-blur-sm hover:border-emerald-500 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl w-fit mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Plano Mensal</CardTitle>
                <div className="text-4xl font-bold text-emerald-400 mt-2">R$ 49,90</div>
                <p className="text-slate-300">por mês</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-white">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Análises ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Múltipla do Dia Premium</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Alertas em tempo real</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Gestão de banca</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 mt-6">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinar Mensal
                </Button>
              </CardContent>
            </Card>

            {/* Plano Anual */}
            <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl w-fit mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Plano Anual</CardTitle>
                <div className="text-4xl font-bold text-emerald-400 mt-2">R$ 399,90</div>
                <p className="text-slate-300">por ano</p>
                <Badge className="bg-emerald-500 text-white mt-2">
                  Economize R$ 199,00
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-white">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Tudo do plano mensal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Análise de histórico completo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Relatórios personalizados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>API para desenvolvedores</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Consultoria personalizada</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 mt-6">
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar Anual
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-400 mb-4">Pagamento seguro via cartão, Pix ou boleto</p>
            <Button 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo e Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Diamond className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                    Aposta Vision
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-emerald-200">
                    {getApiStatusIcon()}
                    <span>{getApiStatusText()}</span>
                    {lastUpdate && (
                      <>
                        <span>•</span>
                        <span>Atualizado: {lastUpdate}</span>
                      </>
                    )}
                    {isRateLimited && (
                      <>
                        <span>•</span>
                        <span className="text-amber-300">Rate limit ativo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Trial Status */}
              {user?.isTrialActive && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {user.trialDaysLeft} dias restantes
                </Badge>
              )}

              {/* Loading Indicator */}
              {isLoadingData && (
                <div className="flex items-center gap-2 text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Atualizando...</span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                      {unreadNotifications}
                    </div>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="font-semibold text-white">{user?.name}</div>
                  <div className="text-emerald-200">R$ {user?.totalProfit.toLocaleString()}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{user?.name}</span>
                  <Badge className="bg-emerald-500 text-white">
                    R$ {user?.totalProfit.toLocaleString()}
                  </Badge>
                </div>
                {user?.isTrialActive && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {user.trialDaysLeft} dias restantes
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-emerald-200 text-sm">
                  {getApiStatusIcon()}
                  <span>{getApiStatusText()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <TabsTrigger 
              value="dashboard" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bets" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              <Flame className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Melhores Apostas</span>
              <span className="sm:hidden">Apostas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="multiple" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Múltipla do Dia</span>
              <span className="sm:hidden">Múltipla</span>
            </TabsTrigger>
            <TabsTrigger 
              value="markets" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Mercados</span>
              <span className="sm:hidden">Mercados</span>
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Minha Conta</span>
              <span className="sm:hidden">Conta</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white relative"
            >
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Avisos</span>
              {unreadNotifications > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadNotifications}
                </div>
              )}
            </TabsTrigger>
          </TabsList>

          {/* API Status Alert */}
          {apiStatus === 'disconnected' && (
            <Alert className="border-amber-500 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                Modo Offline – mostrando dados simulados. 
                {isRateLimited ? ' Rate limit ativo - aguardando para reconectar automaticamente.' : ' Verifique sua chave da API-Football no RapidAPI ou tente novamente.'}
                {!isRateLimited && (
                  <Button 
                    variant="link" 
                    className="text-amber-300 p-0 ml-2 h-auto"
                    onClick={fetchTodaysFixtures}
                  >
                    Tentar reconectar
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl w-fit mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">R$ {user?.totalProfit.toLocaleString()}</div>
                  <div className="text-xs text-emerald-200 mt-1">Lucro Total</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl w-fit mx-auto mb-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{user?.winRate}%</div>
                  <div className="text-xs text-blue-200 mt-1">Taxa de Acerto</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-3">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{todaysBets.length}</div>
                  <div className="text-xs text-purple-200 mt-1">Apostas Hoje</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl w-fit mx-auto mb-3">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">R$ {bankManagement.balance.toLocaleString()}</div>
                  <div className="text-xs text-amber-200 mt-1">Banca Atual</div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Dia */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Resumo de Hoje - {formatDateForAPI(new Date())}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-400">{totalGamesToday}</div>
                    <div className="text-sm text-slate-300 mt-1">Jogos do Dia</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-blue-400">@{averageOdds}</div>
                    <div className="text-sm text-slate-300 mt-1">Média das Odds</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-purple-400">{nextGameTime || '--:--'}</div>
                    <div className="text-sm text-slate-300 mt-1">Próximo Jogo</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance dos Últimos 6 Meses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Melhores Apostas Tab */}
          <TabsContent value="bets" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Melhores Apostas do Dia</h2>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {apiStatus === 'connected' ? 'API-Football' : 'Modo Offline'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-600 text-white hover:bg-white/10"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-600 text-white hover:bg-white/10"
                  onClick={fetchTodaysFixtures}
                  disabled={isLoadingData || isRateLimited}
                >
                  {isLoadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isLoadingData && todaysBets.length === 0 && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-300">Carregando jogos do dia da API-Football...</p>
                <p className="text-slate-400 text-sm mt-2">Buscando dados em tempo real...</p>
              </div>
            )}

            <div className="grid gap-6">
              {todaysBets.map((bet) => (
                <Card key={bet.id} className="border-0 shadow-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-white">{bet.team1} vs {bet.team2}</h3>
                          {getTrendIcon(bet.trend)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(bet.id)}
                            className="text-white hover:bg-white/10"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(bet.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          {bet.bookmaker && (
                            <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                              {bet.bookmaker}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {bet.league}
                          </Badge>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                            {bet.market}
                          </Badge>
                          <span className="text-slate-300">•</span>
                          <span className="text-white font-semibold">@{bet.odd}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-300">{bet.kickoff}</span>
                          {bet.lastUpdate && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 text-xs">Atualizado: {bet.lastUpdate}</span>
                            </>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-300">{bet.analysis}</p>
                        
                        <div className="flex items-center gap-4">
                          {getValueBadge(bet.value)}
                          <Badge className={`${getRiskColor(bet.risk)} border`}>
                            <Shield className="w-3 h-3 mr-1" />
                            Risco {bet.risk}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                          <div className="text-2xl font-bold text-emerald-400">{bet.confidence}%</div>
                          <div className="text-xs text-slate-300">Confiança</div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Analisar
                          </Button>
                          <div className="text-xs text-slate-400 text-center">
                            Vol: {bet.volume.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {todaysBets.length === 0 && !isLoadingData && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Nenhuma aposta disponível no momento</p>
                <p className="text-slate-400 text-sm mt-2">
                  {apiStatus === 'disconnected' ? 'Verifique sua conexão ou tente novamente' : 'Aguarde novos jogos serem adicionados'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Múltipla do Dia Tab */}
          <TabsContent value="multiple" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Múltipla do Dia - Premium</h2>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Seleção Automática
              </Badge>
            </div>

            {multipleBetOfDay ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Diamond className="w-6 h-6" />
                        Combo Premium do Dia
                      </CardTitle>
                      <p className="text-purple-100 text-sm mt-1">
                        {multipleBetOfDay.bets.length} jogos selecionados automaticamente da API-Football
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">R$ {multipleBetOfDay.estimatedReturn}</div>
                      <div className="text-purple-100 text-sm">Retorno estimado (R$ {multipleBetOfDay.stake})</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Resumo da Múltipla */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-400">@{multipleBetOfDay.totalOdd}</div>
                      <div className="text-xs text-slate-300">Odd Total</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-blue-400">{multipleBetOfDay.confidence}%</div>
                      <div className="text-xs text-slate-300">Confiança</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-purple-400">{multipleBetOfDay.bets.length}</div>
                      <div className="text-xs text-slate-300">Jogos</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-amber-400">{multipleBetOfDay.risk}</div>
                      <div className="text-xs text-slate-300">Risco</div>
                    </div>
                  </div>

                  {/* Jogos da Múltipla */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Jogos Selecionados
                    </h3>
                    
                    {multipleBetOfDay.bets.map((bet, index) => (
                      <div key={bet.id} className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="font-semibold text-white">{bet.team1} vs {bet.team2}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge variant="outline" className="border-slate-500 text-slate-300">
                                {bet.league}
                              </Badge>
                              <span className="text-slate-400">•</span>
                              <span className="text-white">{bet.market}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-emerald-400 font-semibold">@{bet.odd}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-emerald-400">{bet.confidence}%</div>
                              <div className="text-xs text-slate-400">confiança</div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-slate-600 text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gestão de Banca */}
                  <Card className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Gestão de Banca Inteligente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-slate-300">Banca Atual</Label>
                          <Input 
                            type="number" 
                            value={bankManagement.balance}
                            onChange={(e) => setBankManagement({...bankManagement, balance: Number(e.target.value)})}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Risco por Aposta (%)</Label>
                          <Input 
                            type="number" 
                            value={bankManagement.riskPercentage}
                            onChange={(e) => setBankManagement({...bankManagement, riskPercentage: Number(e.target.value)})}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Stake Sugerido</Label>
                          <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/30">
                            <div className="text-lg font-bold text-emerald-400">
                              R$ {calculateStake(bankManagement.balance, bankManagement.riskPercentage)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                        <div className="text-sm text-slate-300 mb-2">Projeção de Lucro:</div>
                        <div className="text-xl font-bold text-white">
                          R$ {(calculateStake(bankManagement.balance, bankManagement.riskPercentage) * (multipleBetOfDay.totalOdd - 1)).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    Apostar na Múltipla Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Múltipla do dia sendo preparada...</p>
                <p className="text-slate-400 text-sm mt-2">Aguarde enquanto analisamos as melhores oportunidades da API-Football</p>
              </div>
            )}
          </TabsContent>

          {/* Mercados Lucrativos Tab */}
          <TabsContent value="markets" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ranking dos Mercados Mais Lucrativos</h2>
            </div>

            <div className="grid gap-6">
              {marketRanking.map((market, index) => (
                <Card key={index} className="border-0 shadow-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                          'bg-gradient-to-r from-slate-500 to-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {market.market}
                            {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                          </h3>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            {market.totalBets} apostas • R$ {market.profit.toLocaleString()} lucro
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                          <div className="text-xl font-bold text-emerald-400">+{market.roi}%</div>
                          <div className="text-xs text-slate-300">ROI</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                          <div className="text-xl font-bold text-blue-400">{market.winRate}%</div>
                          <div className="text-xs text-slate-300">Acertos</div>
                        </div>
                        <div className="w-24">
                          <Progress value={market.winRate} className="h-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Minha Conta Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Minha Conta</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Informações da Conta */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-slate-300">Nome</Label>
                    <Input 
                      value={user?.name} 
                      className="bg-slate-800 border-slate-600 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">E-mail</Label>
                    <Input 
                      value={user?.email} 
                      className="bg-slate-800 border-slate-600 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Plano Atual</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        user?.plan === 'free' ? 'bg-slate-500' :
                        user?.plan === 'monthly' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      } text-white`}>
                        {user?.plan === 'free' ? 'Gratuito' :
                         user?.plan === 'monthly' ? 'Mensal' : 'Anual'}
                      </Badge>
                      {user?.isTrialActive && (
                        <Badge className="bg-amber-500 text-white">
                          {user.trialDaysLeft} dias restantes
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assinatura */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Minha Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {user?.plan === 'free' ? (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl">
                        <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <h3 className="font-bold text-white">Upgrade para Premium</h3>
                        <p className="text-slate-300 text-sm mt-1">
                          Acesso completo a todas as funcionalidades
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                        <Crown className="w-4 h-4 mr-2" />
                        Assinar Agora
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <h3 className="font-bold text-white text-center">Plano Ativo</h3>
                        <p className="text-slate-300 text-sm text-center mt-1">
                          Renovação automática ativa
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-600 text-white hover:bg-white/10"
                      >
                        Gerenciar Assinatura
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Configurações */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Idioma</Label>
                        <p className="text-sm text-slate-400">Alterar idioma da interface</p>
                      </div>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">🇧🇷 Português</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Tema</Label>
                        <p className="text-sm text-slate-400">Modo claro ou escuro</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="border-slate-600 text-white hover:bg-white/10"
                      >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Sons</Label>
                        <p className="text-sm text-slate-400">Notificações sonoras</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="border-slate-600 text-white hover:bg-white/10"
                      >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Atualização Automática</Label>
                        <p className="text-sm text-slate-400">Odds em tempo real</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="border-slate-600 text-white hover:bg-white/10"
                      >
                        {autoRefresh ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div>
                      <Label className="text-white">Intervalo de Atualização</Label>
                      <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(Number(v))}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 segundos</SelectItem>
                          <SelectItem value="30">30 segundos</SelectItem>
                          <SelectItem value="60">1 minuto</SelectItem>
                          <SelectItem value="300">5 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                      <div className="text-sm text-slate-300 mb-2">Fuso Horário:</div>
                      <div className="text-lg font-bold text-white">
                        Brasília (GMT-3)
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Horário atual: {getBrazilTime()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Notificações</h2>
              {unreadNotifications > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadNotifications} não lidas
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`border-0 shadow-xl transition-all duration-300 ${
                  !notification.read 
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-l-amber-500' 
                    : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'odd_movement' ? 'bg-blue-500' :
                        notification.type === 'value_bet' ? 'bg-emerald-500' :
                        notification.type === 'lineup_change' ? 'bg-purple-500' :
                        notification.type === 'trial_expiring' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }`}>
                        {notification.type === 'odd_movement' && <TrendingUp className="w-4 h-4 text-white" />}
                        {notification.type === 'value_bet' && <Target className="w-4 h-4 text-white" />}
                        {notification.type === 'lineup_change' && <User className="w-4 h-4 text-white" />}
                        {notification.type === 'trial_expiring' && <Clock className="w-4 h-4 text-white" />}
                        {notification.type === 'promotion' && <Star className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              notification.priority === 'alta' ? 'bg-red-500' :
                              notification.priority === 'media' ? 'bg-amber-500' :
                              'bg-slate-500'
                            } text-white text-xs`}>
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-slate-400">{notification.time}</span>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Nenhuma notificação no momento</p>
                <p className="text-slate-400 text-sm mt-2">Você será notificado sobre movimentações importantes</p>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-white hover:bg-white/10"
                  onClick={() => setUnreadNotifications(0)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar Todas como Lidas
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}