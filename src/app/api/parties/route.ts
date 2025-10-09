import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// GET - Obtener todas las fiestas del usuario
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Conectar con el backend de Express
    const response = await axios.get('http://localhost:5000/api/parties', {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error obteniendo fiestas:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al obtener fiestas' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva fiesta
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const body = await request.json()

    // Validaciones básicas
    if (!body.title || !body.startDate || !body.endDate || !body.location?.name || !body.location?.address) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Asegurar que las coordenadas estén presentes
    const partyData = {
      ...body,
      location: {
        ...body.location,
        coordinates: body.location.coordinates || { lat: 0, lng: 0 }
      }
    }

    // Conectar con el backend de Express
    const response = await axios.post('http://localhost:5000/api/parties', partyData, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 201 })

  } catch (error: any) {
    console.error('Error creando fiesta:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al crear fiesta' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}