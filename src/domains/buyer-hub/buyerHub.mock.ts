import { MOCK_INVENTORY } from '@/lib/mockData'

export interface PublicInventoryUnit {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  bodyStyle: string
  mileage: number
  askingPrice: number
  status: string
  daysInStock: number
  imageUrl?: string
  highlights: string[]
  available: boolean
}

export const BUYER_HUB_INVENTORY: PublicInventoryUnit[] = [
  {
    ...MOCK_INVENTORY[0],
    bodyStyle: 'Sedan',
    mileage: 18500,
    imageUrl: undefined,
    highlights: ['Apple CarPlay', 'Honda Sensing Suite', 'Sport Appearance'],
    available: true,
  },
  {
    ...MOCK_INVENTORY[1],
    bodyStyle: 'Truck',
    mileage: 5200,
    imageUrl: undefined,
    highlights: ['4WD', 'Tow Package', 'EcoBoost V6'],
    available: true,
  },
  {
    ...MOCK_INVENTORY[2],
    bodyStyle: 'Sedan',
    mileage: 42000,
    imageUrl: undefined,
    highlights: ['Autopilot', 'Premium Interior', 'Long Range Battery'],
    available: true,
  },
  {
    id: 'inv-004',
    vin: '2T1BURHE9HC123456',
    year: 2024,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    bodyStyle: 'Sedan',
    mileage: 3200,
    askingPrice: 32450,
    status: 'frontline',
    daysInStock: 15,
    imageUrl: undefined,
    highlights: ['Toyota Safety Sense', 'Dynamic Force Engine', 'JBL Audio'],
    available: true,
  },
  {
    id: 'inv-005',
    vin: '5UXCR6C05N9123456',
    year: 2022,
    make: 'BMW',
    model: 'X5',
    trim: 'xDrive40i',
    bodyStyle: 'SUV',
    mileage: 28700,
    askingPrice: 52900,
    status: 'frontline',
    daysInStock: 22,
    imageUrl: undefined,
    highlights: ['M Sport Package', 'Panoramic Roof', 'Harman Kardon Sound'],
    available: true,
  },
  {
    id: 'inv-006',
    vin: '3VW5T7AU9MM123456',
    year: 2021,
    make: 'Volkswagen',
    model: 'Tiguan',
    trim: 'SEL',
    bodyStyle: 'SUV',
    mileage: 35400,
    askingPrice: 27900,
    status: 'frontline',
    daysInStock: 30,
    imageUrl: undefined,
    highlights: ['Third Row Seating', 'Digital Cockpit', 'AWD'],
    available: true,
  },
]
