<template>
  <div class="family-stats">
    <div class="stats-header">
      <h3 class="stats-title">
        <span class="stats-icon">📊</span>
        Статистика семейного древа
      </h3>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalPersons }}</div>
          <div class="stat-label">Всего персонажей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👨</div>
        <div class="stat-content">
          <div class="stat-number">{{ maleCount }}</div>
          <div class="stat-label">Мужчин</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👩</div>
        <div class="stat-content">
          <div class="stat-number">{{ femaleCount }}</div>
          <div class="stat-label">Женщин</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🧑</div>
        <div class="stat-content">
          <div class="stat-number">{{ otherGenderCount }}</div>
          <div class="stat-label">Другой пол</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🌳</div>
        <div class="stat-content">
          <div class="stat-number">{{ generations }}</div>
          <div class="stat-label">Поколений</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👶</div>
        <div class="stat-content">
          <div class="stat-number">{{ childrenCount }}</div>
          <div class="stat-label">Детей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💕</div>
        <div class="stat-content">
          <div class="stat-number">{{ couplesCount }}</div>
          <div class="stat-label">Пар</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-number">{{ averageAge }}</div>
          <div class="stat-label">Средний возраст</div>
        </div>
      </div>
    </div>

    <div class="stats-details">
      <div class="detail-section">
        <h4>Возрастные группы</h4>
        <div class="age-groups">
          <div class="age-group">
            <span class="age-label">Дети (0-17)</span>
            <div class="age-bar">
              <div
                class="age-fill"
                :style="{ width: `${(childrenAgeCount / totalPersons) * 100}%` }"
              ></div>
            </div>
            <span class="age-count">{{ childrenAgeCount }}</span>
          </div>

          <div class="age-group">
            <span class="age-label">Взрослые (18-64)</span>
            <div class="age-bar">
              <div
                class="age-fill"
                :style="{ width: `${(adultsAgeCount / totalPersons) * 100}%` }"
              ></div>
            </div>
            <span class="age-count">{{ adultsAgeCount }}</span>
          </div>

          <div class="age-group">
            <span class="age-label">Пожилые (65+)</span>
            <div class="age-bar">
              <div
                class="age-fill"
                :style="{ width: `${(seniorsAgeCount / totalPersons) * 100}%` }"
              ></div>
            </div>
            <span class="age-count">{{ seniorsAgeCount }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Самые популярные профессии</h4>
        <div class="professions-list">
          <div v-for="profession in topProfessions" :key="profession.name" class="profession-item">
            <span class="profession-name">{{ profession.name }}</span>
            <span class="profession-count">{{ profession.count }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Семейные связи</h4>
        <div class="relationships-stats">
          <div class="relationship-stat">
            <span class="relationship-icon">👨‍👩‍👧‍👦</span>
            <span class="relationship-label">Родительские связи</span>
            <span class="relationship-count">{{ parentChildRelationships }}</span>
          </div>

          <div class="relationship-stat">
            <span class="relationship-icon">👫</span>
            <span class="relationship-label">Братья/Сестры</span>
            <span class="relationship-count">{{ siblingRelationships }}</span>
          </div>

          <div class="relationship-stat">
            <span class="relationship-icon">💕</span>
            <span class="relationship-label">Партнерские связи</span>
            <span class="relationship-count">{{ partnerRelationships }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import type { Person } from '@/types/family'

const familyTreeStore = useFamilyTreeStore()
const { familyTree } = familyTreeStore

// Basic statistics
const totalPersons = computed(() => familyTree.persons.length)

const maleCount = computed(
  () => familyTree.persons.filter((person) => person.gender === 'male').length,
)

const femaleCount = computed(
  () => familyTree.persons.filter((person) => person.gender === 'female').length,
)

const otherGenderCount = computed(
  () => familyTree.persons.filter((person) => person.gender === 'other').length,
)

const childrenCount = computed(
  () => familyTree.persons.filter((person) => person.relationships.parents.length > 0).length,
)

const couplesCount = computed(
  () => familyTree.persons.filter((person) => person.relationships.partners.length > 0).length / 2,
)

// Age calculations
const calculateAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

const averageAge = computed(() => {
  const personsWithAge = familyTree.persons.filter((person) => person.birthDate)
  if (personsWithAge.length === 0) return 0

  const totalAge = personsWithAge.reduce((sum, person) => {
    return sum + calculateAge(person.birthDate!)
  }, 0)

  return Math.round(totalAge / personsWithAge.length)
})

const childrenAgeCount = computed(
  () =>
    familyTree.persons.filter((person) => {
      if (!person.birthDate) return false
      const age = calculateAge(person.birthDate)
      return age >= 0 && age <= 17
    }).length,
)

const adultsAgeCount = computed(
  () =>
    familyTree.persons.filter((person) => {
      if (!person.birthDate) return false
      const age = calculateAge(person.birthDate)
      return age >= 18 && age <= 64
    }).length,
)

const seniorsAgeCount = computed(
  () =>
    familyTree.persons.filter((person) => {
      if (!person.birthDate) return false
      const age = calculateAge(person.birthDate)
      return age >= 65
    }).length,
)

// Generations calculation
const generations = computed(() => {
  if (familyTree.persons.length === 0) return 0

  const visited = new Set<string>()
  let maxGeneration = 0

  const calculateGeneration = (personId: string, currentGen: number) => {
    if (visited.has(personId)) return
    visited.add(personId)

    maxGeneration = Math.max(maxGeneration, currentGen)

    const person = familyTree.persons.find((p) => p.id === personId)
    if (person) {
      person.relationships.children.forEach((childId) => {
        calculateGeneration(childId, currentGen + 1)
      })
    }
  }

  // Start from root persons (those without parents)
  const rootPersons = familyTree.persons.filter(
    (person) => person.relationships.parents.length === 0,
  )

  rootPersons.forEach((root) => {
    calculateGeneration(root.id, 1)
  })

  return maxGeneration
})

// Professions statistics
const topProfessions = computed(() => {
  const professionCount: { [key: string]: number } = {}

  familyTree.persons.forEach((person) => {
    if (person.occupation) {
      professionCount[person.occupation] = (professionCount[person.occupation] || 0) + 1
    }
  })

  return Object.entries(professionCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Relationship statistics
const parentChildRelationships = computed(
  () => familyTree.relationships.filter((rel) => rel.type === 'parent').length,
)

const siblingRelationships = computed(
  () => familyTree.relationships.filter((rel) => rel.type === 'sibling').length,
)

const partnerRelationships = computed(
  () =>
    familyTree.relationships.filter((rel) => rel.type === 'partner' || rel.type === 'spouse')
      .length,
)
</script>

<style scoped>
.family-stats {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.stats-header {
  margin-bottom: 25px;
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.stats-icon {
  font-size: 1.8rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  background: white;
  padding: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.detail-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e1e8ed;
}

.detail-section h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.age-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.age-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.age-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  min-width: 120px;
}

.age-bar {
  flex: 1;
  height: 20px;
  background: #e1e8ed;
  border-radius: 10px;
  overflow: hidden;
}

.age-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.age-count {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

.professions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profession-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.profession-name {
  font-weight: 600;
  color: #2c3e50;
}

.profession-count {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.relationships-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relationship-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.relationship-icon {
  font-size: 1.5rem;
}

.relationship-label {
  flex: 1;
  font-weight: 600;
  color: #2c3e50;
}

.relationship-count {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 15px;
    gap: 10px;
  }

  .stat-icon {
    font-size: 2rem;
    padding: 10px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stats-details {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .age-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .age-label {
    min-width: auto;
  }

  .age-bar {
    width: 100%;
  }
}
</style>
