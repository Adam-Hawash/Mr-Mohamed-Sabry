import type { Metadata } from 'next'
import { GeometryLaws } from '@/components/landing/GeometryLaws'

export var metadata: Metadata = {
  title: 'Geometry Laws | Mr. Mohamed Sabry',
  description:
    'All geometry laws on one page: area and perimeter of every shape, volumes and surface areas, and the Pythagorean theorem — from Mr. Mohamed Sabry platform by Mr. Mohamed Sabry.',
}

export default function GeometryLawsPage() {
  return <GeometryLaws />
}
