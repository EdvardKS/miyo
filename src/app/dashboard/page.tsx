'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Camera, Users, Calendar, MapPin, Clock, Crown, LogOut, Settings, User, Star, Sparkles } from 'lucide-react'
import Particles from '@/components/ui/particles'

interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  followersCount: number
  followingCount: number
}

interface Party {
  _id: string
  title: string
  description: string
  code: string
  startDate: string
  endDate: string
  location: {
    name: string
    address: string
  }
  isPrivate: boolean
  participants: Array<{
    user: User
    joinedAt: string
  }>
  photos: string[]
  isActive: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateParty, setShowCreateParty] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newParty, setNewParty] = useState({
    title: '',
    description: '',
    location: {
      name: '',
      address: ''
    },
    startDate: '',
    endDate: '',
    isPrivate: true,
    maxParticipants: ''
  })

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      window.location.href = '/'
      return
    }

    setUser(JSON.parse(userData))
    fetchParties(token)
  }, [])

  const fetchParties = async (token: string) => {
    try {
      const response = await fetch('/api/parties', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar las fiestas')
      }
      
      const data = await response.json()
      setParties(data)
    } catch (error) {
      console.error('Error fetching parties:', error)
      setError('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('No autorizado')
      return
    }

    try {
      const partyData = {
        ...newParty,
        startDate: new Date(newParty.startDate),
        endDate: new Date(newParty.endDate),
        maxParticipants: newParty.maxParticipants ? parseInt(newParty.maxParticipants) : null,
        location: {
          ...newParty.location,
          coordinates: { lat: 0, lng: 0 } // Placeholder
        }
      }

      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(partyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el evento')
      }

      setSuccess('¡Evento creado exitosamente!')
      setShowCreateParty(false)
      setNewParty({
        title: '',
        description: '',
        location: { name: '', address: '' },
        startDate: '',
        endDate: '',
        isPrivate: true,
        maxParticipants: ''
      })

      // Recargar los eventos
      fetchParties(token)
      
    } catch (error: any) {
      setError(error.message || 'Error al crear el evento')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <Particles count={40} variant="dark" />
        <div className="text-center relative z-10">
          <Crown className="h-12 w-12 text-yellow-500 animate-bounce mx-auto mb-4" />
          <p className="text-lg text-yellow-200">Cargando experiencia exclusiva...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Partículas doradas */}
      <Particles count={50} variant="dark" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-yellow-900/20 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Momentos Inolvidables</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-yellow-100">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Bienvenido, {user?.username} 
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </h1>
          <p className="text-yellow-200">
            ¿Qué experiencia exclusiva crearemos hoy?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-200">Mis Eventos</p>
                  <p className="text-2xl font-bold text-white">{parties.length}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-200">Recuerdos</p>
                  <p className="text-2xl font-bold text-white">
                    {parties.reduce((acc, party) => acc + party.photos.length, 0)}
                  </p>
                </div>
                <Camera className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-200">Invitados</p>
                  <p className="text-2xl font-bold text-white">
                    {parties.reduce((acc, party) => acc + party.participants.length, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-200">Seguidores</p>
                  <p className="text-2xl font-bold text-white">{user?.followersCount || 0}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Party Button */}
        <div className="mb-8">
          <Dialog open={showCreateParty} onOpenChange={setShowCreateParty}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Crear Nuevo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-black/90 border border-yellow-800/50">
              <DialogHeader>
                <DialogTitle className="text-white">Crear Evento Exclusivo</DialogTitle>
                <DialogDescription className="text-yellow-200">
                  Diseña una experiencia inolvidable para tus invitados
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <div className="bg-red-900/50 border border-red-800/50 text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/50 border border-green-800/50 text-green-300 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreateParty} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-yellow-200">Nombre del Evento</Label>
                  <Input
                    id="title"
                    value={newParty.title}
                    onChange={(e) => setNewParty({...newParty, title: e.target.value})}
                    placeholder="Mi Evento Exclusivo"
                    required
                    className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-yellow-200">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newParty.description}
                    onChange={(e) => setNewParty({...newParty, description: e.target.value})}
                    placeholder="Una experiencia increíble que no querrás perderte..."
                    rows={3}
                    className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-yellow-200">Inicio</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newParty.startDate}
                      onChange={(e) => setNewParty({...newParty, startDate: e.target.value})}
                      required
                      className="bg-black/40 border-yellow-800/50 text-white focus:border-yellow-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-yellow-200">Fin</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newParty.endDate}
                      onChange={(e) => setNewParty({...newParty, endDate: e.target.value})}
                      required
                      className="bg-black/40 border-yellow-800/50 text-white focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationName" className="text-yellow-200">Nombre del Lugar</Label>
                  <Input
                    id="locationName"
                    value={newParty.location.name}
                    onChange={(e) => setNewParty({...newParty, location: {...newParty.location, name: e.target.value}})}
                    placeholder="Lugar Exclusivo"
                    required
                    className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationAddress" className="text-yellow-200">Dirección</Label>
                  <Input
                    id="locationAddress"
                    value={newParty.location.address}
                    onChange={(e) => setNewParty({...newParty, location: {...newParty.location, address: e.target.value}})}
                    placeholder="Dirección exclusiva"
                    required
                    className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-yellow-200">Máximo de Invitados (opcional)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newParty.maxParticipants}
                    onChange={(e) => setNewParty({...newParty, maxParticipants: e.target.value})}
                    placeholder="50"
                    className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newParty.isPrivate}
                    onChange={(e) => setNewParty({...newParty, isPrivate: e.target.checked})}
                    className="rounded bg-black/40 border-yellow-800/50 text-yellow-500 focus:ring-yellow-500"
                  />
                  <Label htmlFor="isPrivate" className="text-yellow-200">Evento privado (acceso exclusivo)</Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  Crear Evento Exclusivo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Parties List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Mis Eventos Exclusivos
            <Crown className="h-6 w-6 text-yellow-500" />
          </h2>
          
          {parties.length === 0 ? (
            <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md">
              <CardContent className="p-12 text-center">
                <Crown className="h-16 w-16 text-yellow-500/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No tienes eventos aún</h3>
                <p className="text-yellow-200 mb-4">
                  ¡Crea tu primer evento exclusivo y comienza a crear momentos inolvidables!
                </p>
                <Button 
                  onClick={() => setShowCreateParty(true)}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Mi Primer Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parties.map((party) => (
                <Card key={party._id} className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg text-white">{party.title}</CardTitle>
                      <Badge variant={party.isActive ? "default" : "secondary"} className={party.isActive ? "bg-yellow-600 text-black" : "bg-yellow-900/50 text-yellow-300"}>
                        {party.isActive ? "Activo" : "Finalizado"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-yellow-300">
                      Código: <span className="font-mono font-bold text-yellow-400">{party.code}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-200 mb-4 line-clamp-2">
                      {party.description || "Sin descripción"}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span>{formatDate(party.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <MapPin className="h-4 w-4 text-yellow-500" />
                        <span>{party.location.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span>{party.participants.length} invitados</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Camera className="h-4 w-4 text-yellow-500" />
                        <span>{party.photos.length} recuerdos</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">
                        Ver Evento
                      </Button>
                      <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20">
                        Compartir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}