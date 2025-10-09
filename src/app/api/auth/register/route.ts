import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    if (!email || !username || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Conectar con el backend de Express
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      email,
      username,
      password
    })

    return NextResponse.json(response.data, { status: 201 })

  } catch (error: any) {
    console.error('Error en registro:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al registrarse' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}