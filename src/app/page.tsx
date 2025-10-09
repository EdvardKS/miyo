'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Menu, X, Camera, Users, MapPin, Calendar, Lock, Share2, Heart, MessageCircle, ChevronUp, Crown, Music, Clock, Sparkles, Star } from 'lucide-react'
import Particles from '@/components/ui/particles'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
      
      const sections = ['features', 'how-it-works', 'testimonials']
      const scrollPosition = window.scrollY + 100
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setSuccess('¡Login exitoso! Redirigiendo...')
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
      
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validar que las contraseñas coincidan
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          username: registerData.username,
          password: registerData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse')
      }
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setSuccess('¡Registro exitoso! Redirigiendo...')
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
      
    } catch (error: any) {
      setError(error.message || 'Error al registrarse')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Partículas doradas */}
      <Particles count={60} variant="dark" />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-yellow-900/20 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Momentos Inolvidables</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className={`text-yellow-100 hover:text-yellow-400 transition-colors ${activeSection === 'features' ? 'text-yellow-400 font-semibold' : ''}`}
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className={`text-yellow-100 hover:text-yellow-400 transition-colors ${activeSection === 'how-it-works' ? 'text-yellow-400 font-semibold' : ''}`}
              >
                Cómo Funciona
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className={`text-yellow-100 hover:text-yellow-400 transition-colors ${activeSection === 'testimonials' ? 'text-yellow-400 font-semibold' : ''}`}
              >
                Testimonios
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">Iniciar Sesión</Button>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold">Crear Evento</Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-yellow-400 hover:text-yellow-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-yellow-900/20 bg-black/95 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-yellow-100 hover:text-yellow-400 transition-colors text-left"
                >
                  Características
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-yellow-100 hover:text-yellow-400 transition-colors text-left"
                >
                  Cómo Funciona
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="text-yellow-100 hover:text-yellow-400 transition-colors text-left"
                >
                  Testimonios
                </button>
                <Button variant="ghost" className="justify-start text-yellow-400 hover:bg-yellow-900/20">Iniciar Sesión</Button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Login/Register */}
      <main className="relative z-10">
        <section className="relative py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Hero Content */}
              <div>
                <Badge variant="secondary" className="mb-6 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/40 border-yellow-700/50">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Experiencias exclusivas y memorables
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Crea Momentos
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600"> Inolvidables</span>
                </h1>
                
                <p className="text-xl text-yellow-100 mb-8 leading-relaxed">
                  Organiza eventos exclusivos, compiere recuerdos preciosos y celebra 
                  los momentos más importantes de tu vida con estilo y elegancia.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3">
                    <Crown className="mr-2 h-5 w-5" />
                    Crear Mi Evento
                  </Button>
                  <Button size="lg" variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-8 py-3">
                    Ver Experiencias
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-yellow-200">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-yellow-500" />
                    <span>+5,000 eventos exclusivos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-yellow-500" />
                    <span>+25,000 recuerdos capturados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.9/5 satisfacción</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login/Register Form */}
              <div>
                <Card className="shadow-2xl border border-yellow-800/30 bg-black/60 backdrop-blur-md">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-white">Acceso Exclusivo</CardTitle>
                    <CardDescription className="text-yellow-200">Únete al club de experiencias únicas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert className="mb-4 border-red-800/50 bg-red-900/20">
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert className="mb-4 border-green-800/50 bg-green-900/20">
                        <AlertDescription className="text-green-300">{success}</AlertDescription>
                      </Alert>
                    )}

                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6 bg-yellow-900/20 border border-yellow-800/30">
                        <TabsTrigger value="login" className="text-yellow-100 data-[state=active]:bg-yellow-600 data-[state=active]:text-black">Iniciar Sesión</TabsTrigger>
                        <TabsTrigger value="register" className="text-yellow-100 data-[state=active]:bg-yellow-600 data-[state=active]:text-black">Registrarse</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-yellow-200">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="tu@email.com"
                              value={loginData.email}
                              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-yellow-200">Contraseña</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={loginData.password}
                              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-email" className="text-yellow-200">Email</Label>
                            <Input
                              id="reg-email"
                              type="email"
                              placeholder="tu@email.com"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-yellow-200">Nombre de Usuario</Label>
                            <Input
                              id="username"
                              type="text"
                              placeholder="usuario123"
                              value={registerData.username}
                              onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-password" className="text-yellow-200">Contraseña</Label>
                            <Input
                              id="reg-password"
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-yellow-200">Confirmar Contraseña</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Repite tu contraseña"
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                              required
                              className="bg-black/40 border-yellow-800/50 text-white placeholder-yellow-600/50 focus:border-yellow-500"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-b from-black via-yellow-950/10 to-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Experiencias de Lujo
              </h2>
              <p className="text-xl text-yellow-200">
                Todo lo que necesitas para crear eventos inolvidables
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Acceso Exclusivo</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Códigos únicos de acceso para garantizar la privacidad y exclusividad de tu evento.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Galería Premium</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Captura y comparte los mejores momentos en una galería elegante y sofisticada.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Ubicación Segura</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Verificación de ubicación para mantener la integridad y seguridad de tu evento.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Invitados VIP</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Gestión exclusiva de lista de invitados con control de acceso personalizado.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Interacciones Elite</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Sistema de likes y comentarios elegante para interactuar con los recuerdos.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-yellow-800/30 bg-black/40 backdrop-blur-md hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-xl text-white">Eventos Temporales</CardTitle>
                  <CardDescription className="text-yellow-200">
                    Creación de eventos con fecha límite para mantener la exclusividad del contenido.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gradient-to-br from-yellow-950/20 to-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Cómo Funciona
              </h2>
              <p className="text-xl text-yellow-200">
                Tu evento exclusivo en 3 pasos simples
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Diseña tu Evento</h3>
                <p className="text-yellow-200">
                  Configura los detalles: nombre, fecha, lugar y nivel de exclusividad.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Invita Selectivamente</h3>
                <p className="text-yellow-200">
                  Comparte los códigos de acceso exclusivo con tus invitados VIP.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Disfruta y Recuerda</h3>
                <p className="text-yellow-200">
                  Vive la experiencia y captura momentos que durarán para siempre.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-yellow-900 font-medium">Eventos Exclusivos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">25K+</div>
                <div className="text-yellow-900 font-medium">Recuerdos Capturados</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-yellow-900 font-medium">Países</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.9★</div>
                <div className="text-yellow-900 font-medium">Satisfacción Elite</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-800/30 text-yellow-200 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <span className="text-xl font-bold text-white">Momentos Inolvidables</span>
              </div>
              <p className="text-yellow-300 text-sm">
                La plataforma exclusiva para crear y celebrar los momentos más importantes de tu vida.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Experiencias</h3>
              <ul className="space-y-2 text-sm text-yellow-300">
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Eventos</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Galería</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">VIP Access</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Club</h3>
              <ul className="space-y-2 text-sm text-yellow-300">
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Experiencias</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Contacto Elite</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-yellow-300">
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-yellow-100 transition-colors">Política VIP</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-yellow-800/30 mt-8 pt-8 text-center text-sm text-yellow-400">
            <p>&copy; 2024 Momentos Inolvidables. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black p-3 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}