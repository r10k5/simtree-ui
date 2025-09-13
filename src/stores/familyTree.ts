import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Person, Relationship, FamilyTree, RelationshipType } from '@/types/family'

export const useFamilyTreeStore = defineStore('familyTree', () => {
  // State
  const familyTree = ref<FamilyTree>({
    id: '1',
    name: 'Мое семейное древо',
    persons: [],
    relationships: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const selectedPerson = ref<Person | null>(null)
  const isAddingPerson = ref(false)
  const isEditingPerson = ref(false)

  // Getters
  const getPersonById = computed(() => {
    return (id: string) => familyTree.value.persons.find((person) => person.id === id)
  })

  const getPersonRelationships = computed(() => {
    return (personId: string) => {
      const person = getPersonById.value(personId)
      if (!person) return { parents: [], children: [], siblings: [], partners: [] }

      return {
        parents: person.relationships.parents
          .map((id) => getPersonById.value(id))
          .filter(Boolean) as Person[],
        children: person.relationships.children
          .map((id) => getPersonById.value(id))
          .filter(Boolean) as Person[],
        siblings: person.relationships.siblings
          .map((id) => getPersonById.value(id))
          .filter(Boolean) as Person[],
        partners: person.relationships.partners
          .map((id) => getPersonById.value(id))
          .filter(Boolean) as Person[],
      }
    }
  })

  const getRootPersons = computed(() => {
    return familyTree.value.persons.filter((person) => person.relationships.parents.length === 0)
  })

  // Actions
  const addPerson = (personData: Omit<Person, 'id' | 'relationships'>) => {
    const newPerson: Person = {
      ...personData,
      id: Date.now().toString(),
      relationships: {
        parents: [],
        children: [],
        siblings: [],
        partners: [],
      },
    }

    familyTree.value.persons.push(newPerson)
    familyTree.value.updatedAt = new Date().toISOString()
    saveToLocalStorage()
    return newPerson
  }

  const updatePerson = (personId: string, updates: Partial<Person>) => {
    const personIndex = familyTree.value.persons.findIndex((p) => p.id === personId)
    if (personIndex !== -1) {
      familyTree.value.persons[personIndex] = {
        ...familyTree.value.persons[personIndex],
        ...updates,
      }
      familyTree.value.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  const deletePerson = (personId: string) => {
    const personIndex = familyTree.value.persons.findIndex((p) => p.id === personId)
    if (personIndex !== -1) {
      // Remove all relationships involving this person
      familyTree.value.relationships = familyTree.value.relationships.filter(
        (rel) => rel.person1Id !== personId && rel.person2Id !== personId,
      )

      // Remove person from all other persons' relationships
      familyTree.value.persons.forEach((person) => {
        person.relationships.parents = person.relationships.parents.filter((id) => id !== personId)
        person.relationships.children = person.relationships.children.filter(
          (id) => id !== personId,
        )
        person.relationships.siblings = person.relationships.siblings.filter(
          (id) => id !== personId,
        )
        person.relationships.partners = person.relationships.partners.filter(
          (id) => id !== personId,
        )
      })

      familyTree.value.persons.splice(personIndex, 1)
      familyTree.value.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  const addRelationship = (person1Id: string, person2Id: string, type: RelationshipType) => {
    const person1 = getPersonById.value(person1Id)
    const person2 = getPersonById.value(person2Id)

    if (!person1 || !person2) return

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      type,
      person1Id,
      person2Id,
      isActive: true,
    }

    familyTree.value.relationships.push(newRelationship)

    // Update person relationships based on type
    switch (type) {
      case 'parent':
        if (!person1.relationships.children.includes(person2Id)) {
          person1.relationships.children.push(person2Id)
        }
        if (!person2.relationships.parents.includes(person1Id)) {
          person2.relationships.parents.push(person1Id)
        }
        break
      case 'child':
        if (!person1.relationships.parents.includes(person2Id)) {
          person1.relationships.parents.push(person2Id)
        }
        if (!person2.relationships.children.includes(person1Id)) {
          person2.relationships.children.push(person1Id)
        }
        break
      case 'sibling':
        if (!person1.relationships.siblings.includes(person2Id)) {
          person1.relationships.siblings.push(person2Id)
        }
        if (!person2.relationships.siblings.includes(person1Id)) {
          person2.relationships.siblings.push(person1Id)
        }
        break
      case 'partner':
      case 'spouse':
        if (!person1.relationships.partners.includes(person2Id)) {
          person1.relationships.partners.push(person2Id)
        }
        if (!person2.relationships.partners.includes(person1Id)) {
          person2.relationships.partners.push(person1Id)
        }
        break
    }

    familyTree.value.updatedAt = new Date().toISOString()
    saveToLocalStorage()
  }

  const removeRelationship = (person1Id: string, person2Id: string, type: RelationshipType) => {
    // Remove from relationships array
    familyTree.value.relationships = familyTree.value.relationships.filter(
      (rel) =>
        !(rel.person1Id === person1Id && rel.person2Id === person2Id && rel.type === type) &&
        !(rel.person1Id === person2Id && rel.person2Id === person1Id && rel.type === type),
    )

    // Remove from person relationships
    const person1 = getPersonById.value(person1Id)
    const person2 = getPersonById.value(person2Id)

    if (person1 && person2) {
      switch (type) {
        case 'parent':
          person1.relationships.children = person1.relationships.children.filter(
            (id) => id !== person2Id,
          )
          person2.relationships.parents = person2.relationships.parents.filter(
            (id) => id !== person1Id,
          )
          break
        case 'child':
          person1.relationships.parents = person1.relationships.parents.filter(
            (id) => id !== person2Id,
          )
          person2.relationships.children = person2.relationships.children.filter(
            (id) => id !== person1Id,
          )
          break
        case 'sibling':
          person1.relationships.siblings = person1.relationships.siblings.filter(
            (id) => id !== person2Id,
          )
          person2.relationships.siblings = person2.relationships.siblings.filter(
            (id) => id !== person1Id,
          )
          break
        case 'partner':
        case 'spouse':
          person1.relationships.partners = person1.relationships.partners.filter(
            (id) => id !== person2Id,
          )
          person2.relationships.partners = person2.relationships.partners.filter(
            (id) => id !== person1Id,
          )
          break
      }
    }

    familyTree.value.updatedAt = new Date().toISOString()
    saveToLocalStorage()
  }

  const setSelectedPerson = (person: Person | null) => {
    selectedPerson.value = person
  }

  const setIsAddingPerson = (value: boolean) => {
    isAddingPerson.value = value
  }

  const setIsEditingPerson = (value: boolean) => {
    isEditingPerson.value = value
  }

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('simtree-family-tree', JSON.stringify(familyTree.value))
    } catch (error) {
      console.error('Failed to save family tree to localStorage:', error)
    }
  }

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('simtree-family-tree')
      if (saved) {
        const parsed = JSON.parse(saved)
        familyTree.value = {
          ...parsed,
          updatedAt: new Date().toISOString(),
        }
        return true
      }
    } catch (error) {
      console.error('Failed to load family tree from localStorage:', error)
    }
    return false
  }

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('simtree-family-tree')
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  // Initialize with sample data
  const initializeSampleData = () => {
    const john = addPerson({
      name: 'Джон',
      surname: 'Симс',
      gender: 'male',
      birthDate: '1980-01-15',
      occupation: 'Программист',
    })

    const jane = addPerson({
      name: 'Джейн',
      surname: 'Симс',
      gender: 'female',
      birthDate: '1982-05-20',
      occupation: 'Дизайнер',
    })

    const mike = addPerson({
      name: 'Майк',
      surname: 'Симс',
      gender: 'male',
      birthDate: '2005-08-10',
      occupation: 'Студент',
    })

    const sarah = addPerson({
      name: 'Сара',
      surname: 'Симс',
      gender: 'female',
      birthDate: '2008-12-03',
      occupation: 'Школьница',
    })

    // Add relationships
    addRelationship(john.id, jane.id, 'spouse')
    addRelationship(john.id, mike.id, 'parent')
    addRelationship(jane.id, mike.id, 'parent')
    addRelationship(john.id, sarah.id, 'parent')
    addRelationship(jane.id, sarah.id, 'parent')
    addRelationship(mike.id, sarah.id, 'sibling')
  }

  return {
    // State
    familyTree,
    selectedPerson,
    isAddingPerson,
    isEditingPerson,

    // Getters
    getPersonById,
    getPersonRelationships,
    getRootPersons,

    // Actions
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    removeRelationship,
    setSelectedPerson,
    setIsAddingPerson,
    setIsEditingPerson,
    initializeSampleData,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
  }
})
