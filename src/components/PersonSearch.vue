<template>
  <div class="person-search">
    <div class="search-header">
      <h3 class="search-title">
        <span class="search-icon">🔍</span>
        Поиск и фильтрация
      </h3>
    </div>

    <div class="search-controls">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по имени, фамилии или профессии..."
          class="search-input"
          @input="onSearch"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">×</button>
      </div>

      <div class="filter-controls">
        <select v-model="genderFilter" class="filter-select" @change="onFilterChange">
          <option value="">Все полы</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
        </select>

        <select v-model="ageFilter" class="filter-select" @change="onFilterChange">
          <option value="">Все возрасты</option>
          <option value="children">Дети (0-17)</option>
          <option value="adults">Взрослые (18-64)</option>
          <option value="seniors">Пожилые (65+)</option>
        </select>

        <select v-model="relationshipFilter" class="filter-select" @change="onFilterChange">
          <option value="">Все связи</option>
          <option value="hasParents">Имеет родителей</option>
          <option value="hasChildren">Имеет детей</option>
          <option value="hasSiblings">Имеет братьев/сестер</option>
          <option value="hasPartners">Имеет партнеров</option>
          <option value="noRelationships">Без связей</option>
        </select>
      </div>
    </div>

    <div class="search-results">
      <div v-if="filteredPersons.length === 0" class="no-results">
        <div class="no-results-icon">😔</div>
        <h4>Ничего не найдено</h4>
        <p>Попробуйте изменить параметры поиска или фильтры</p>
      </div>

      <div v-else class="results-grid">
        <div
          v-for="person in filteredPersons"
          :key="person.id"
          class="person-card"
          @click="selectPerson(person)"
        >
          <div class="person-avatar">
            {{ getAvatarEmoji(person.gender) }}
          </div>

          <div class="person-info">
            <h4 class="person-name">{{ person.name }} {{ person.surname || '' }}</h4>

            <div class="person-details">
              <div v-if="person.occupation" class="person-occupation">
                <span class="detail-icon">💼</span>
                {{ person.occupation }}
              </div>

              <div v-if="person.birthDate" class="person-age">
                <span class="detail-icon">🎂</span>
                {{ calculateAge(person.birthDate) }} лет
              </div>

              <div class="person-relationships">
                <span class="detail-icon">👥</span>
                {{ getRelationshipsCount(person) }} связей
              </div>
            </div>

            <div class="person-tags">
              <span class="gender-tag" :class="person.gender">
                {{ getGenderText(person.gender) }}
              </span>

              <span v-if="person.traits && person.traits.length > 0" class="traits-tag">
                {{ person.traits.length }} черт
              </span>
            </div>
          </div>

          <div class="person-actions">
            <button
              class="action-btn edit-btn"
              @click.stop="editPerson(person)"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              class="action-btn delete-btn"
              @click.stop="deletePerson(person)"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredPersons.length > 0" class="search-summary">
      <span class="summary-text">
        Найдено {{ filteredPersons.length }} из {{ totalPersons }} персонажей
      </span>

      <div class="summary-actions">
        <button v-if="hasActiveFilters" class="btn btn-secondary btn-sm" @click="clearAllFilters">
          Сбросить фильтры
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import type { Person } from '@/types/family'

interface Emits {
  (e: 'person-selected', person: Person): void
  (e: 'person-edit', person: Person): void
  (e: 'person-delete', personId: string): void
}

const emit = defineEmits<Emits>()

const familyTreeStore = useFamilyTreeStore()
const { familyTree, getPersonRelationships } = familyTreeStore

const searchQuery = ref('')
const genderFilter = ref('')
const ageFilter = ref('')
const relationshipFilter = ref('')

const totalPersons = computed(() => familyTree.persons.length)

const hasActiveFilters = computed(() => {
  return searchQuery.value || genderFilter.value || ageFilter.value || relationshipFilter.value
})

const filteredPersons = computed(() => {
  let filtered = [...familyTree.persons]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        (person.surname && person.surname.toLowerCase().includes(query)) ||
        (person.occupation && person.occupation.toLowerCase().includes(query)),
    )
  }

  // Gender filter
  if (genderFilter.value) {
    filtered = filtered.filter((person) => person.gender === genderFilter.value)
  }

  // Age filter
  if (ageFilter.value) {
    filtered = filtered.filter((person) => {
      if (!person.birthDate) return false
      const age = calculateAge(person.birthDate)

      switch (ageFilter.value) {
        case 'children':
          return age >= 0 && age <= 17
        case 'adults':
          return age >= 18 && age <= 64
        case 'seniors':
          return age >= 65
        default:
          return true
      }
    })
  }

  // Relationship filter
  if (relationshipFilter.value) {
    filtered = filtered.filter((person) => {
      const relationships = getPersonRelationships(person.id)

      switch (relationshipFilter.value) {
        case 'hasParents':
          return relationships.parents.length > 0
        case 'hasChildren':
          return relationships.children.length > 0
        case 'hasSiblings':
          return relationships.siblings.length > 0
        case 'hasPartners':
          return relationships.partners.length > 0
        case 'noRelationships':
          return (
            relationships.parents.length === 0 &&
            relationships.children.length === 0 &&
            relationships.siblings.length === 0 &&
            relationships.partners.length === 0
          )
        default:
          return true
      }
    })
  }

  return filtered
})

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

const getAvatarEmoji = (gender: string) => {
  const emojis = {
    male: '👨',
    female: '👩',
    other: '🧑',
  }
  return emojis[gender as keyof typeof emojis] || '🧑'
}

const getGenderText = (gender: string) => {
  const texts = {
    male: 'М',
    female: 'Ж',
    other: 'Д',
  }
  return texts[gender as keyof typeof texts] || '?'
}

const getRelationshipsCount = (person: Person) => {
  const relationships = getPersonRelationships(person.id)
  return (
    relationships.parents.length +
    relationships.children.length +
    relationships.siblings.length +
    relationships.partners.length
  )
}

const onSearch = () => {
  // Search is reactive, no need for additional logic
}

const onFilterChange = () => {
  // Filters are reactive, no need for additional logic
}

const clearSearch = () => {
  searchQuery.value = ''
}

const clearAllFilters = () => {
  searchQuery.value = ''
  genderFilter.value = ''
  ageFilter.value = ''
  relationshipFilter.value = ''
}

const selectPerson = (person: Person) => {
  emit('person-selected', person)
}

const editPerson = (person: Person) => {
  emit('person-edit', person)
}

const deletePerson = (person: Person) => {
  if (confirm(`Удалить ${person.name} из семейного древа?`)) {
    emit('person-delete', person.id)
  }
}
</script>

<style scoped>
.person-search {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.search-icon {
  font-size: 1.8rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.search-input-group {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  padding-right: 50px;
  border: 2px solid #e1e8ed;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: #e74c3c;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #c0392b;
  transform: translateY(-50%) scale(1.1);
}

.filter-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-results {
  margin-bottom: 20px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.no-results h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.person-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.person-avatar {
  font-size: 2.5rem;
  background: white;
  padding: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.person-info {
  flex: 1;
  min-width: 0;
}

.person-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.person-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.person-occupation,
.person-age,
.person-relationships {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.detail-icon {
  font-size: 0.9rem;
}

.person-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.gender-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gender-tag.male {
  background: #4a90e2;
  color: white;
}

.gender-tag.female {
  background: #e24a90;
  color: white;
}

.gender-tag.other {
  background: #90e24a;
  color: white;
}

.traits-tag {
  background: #95a5a6;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.person-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #74b9ff;
  color: white;
}

.edit-btn:hover {
  background: #0984e3;
  transform: scale(1.1);
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px solid #e1e8ed;
}

.summary-text {
  color: #2c3e50;
  font-weight: 600;
}

.summary-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-secondary {
  background: linear-gradient(45deg, #95a5a6, #7f8c8d);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }

  .filter-select {
    min-width: auto;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .person-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .person-actions {
    flex-direction: row;
    justify-content: center;
  }

  .search-summary {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
