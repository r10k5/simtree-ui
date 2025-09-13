export interface Person {
  id: string
  name: string
  surname?: string
  birthDate?: string
  deathDate?: string
  gender: 'male' | 'female' | 'other'
  avatar?: string
  occupation?: string
  traits?: string[]
  relationships: {
    parents: string[]
    children: string[]
    siblings: string[]
    partners: string[]
  }
  position?: {
    x: number
    y: number
  }
}

export interface Relationship {
  id: string
  type: 'parent' | 'child' | 'sibling' | 'partner' | 'spouse'
  person1Id: string
  person2Id: string
  startDate?: string
  endDate?: string
  isActive: boolean
}

export interface FamilyTree {
  id: string
  name: string
  persons: Person[]
  relationships: Relationship[]
  createdAt: string
  updatedAt: string
}

export type RelationshipType = 'parent' | 'child' | 'sibling' | 'partner' | 'spouse'
