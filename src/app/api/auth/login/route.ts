import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Conectar con el backend de Express
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error en login:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al iniciar sesión' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}