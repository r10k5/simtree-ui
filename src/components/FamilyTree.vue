<template>
  <div class="family-tree-container">
    <div class="family-tree-header">
      <h1 class="family-tree-title">{{ familyTree.name }}</h1>
      <div class="family-tree-actions">
        <button class="btn btn-primary" @click="addNewPerson">
          <span class="icon">👤</span>
          Добавить персонажа
        </button>
        <button class="btn btn-secondary" @click="openAddRelationship">
          <span class="icon">🔗</span>
          Добавить связь
        </button>
        <button class="btn btn-secondary" @click="initializeSampleData">
          <span class="icon">🎲</span>
          Загрузить пример
        </button>
        <button class="btn btn-secondary" @click="exportData">
          <span class="icon">📤</span>
          Экспорт
        </button>
        <button class="btn btn-secondary" @click="clearData">
          <span class="icon">🗑️</span>
          Очистить все
        </button>
      </div>
    </div>

    <!-- Person Search -->
    <PersonSearch
      v-if="familyTree.persons.length > 0"
      @person-selected="onPersonSelected"
      @person-edit="editPerson"
      @person-delete="deletePerson"
    />

    <!-- Family Statistics -->
    <FamilyStats v-if="familyTree.persons.length > 0" />

    <div class="family-tree-content">
      <!-- Relationship Tree View -->
      <div v-if="familyTree.persons.length > 0" class="tree-header">
        <h2 class="tree-title">🌳 Дерево связей</h2>
        <p class="tree-description">
          Интерактивное семейное древо с возможностью масштабирования и навигации
        </p>
      </div>
      <div class="relationship-tree-wrapper">
        <RelationshipTree :persons="familyTree.persons" :relationships="familyTree.relationships" />
      </div>

      <div v-if="familyTree.persons.length === 0" class="empty-state">
        <div class="empty-state-icon">🌳</div>
        <h3>Ваше семейное древо пусто</h3>
        <p>Начните с добавления первого персонажа!</p>
        <button class="btn btn-primary" @click="addNewPerson">Добавить первого персонажа</button>
      </div>
    </div>

    <!-- Person Details Modal -->
    <PersonDetailsModal
      v-if="selectedPerson"
      :person="selectedPerson"
      @close="closePersonDetails"
      @edit="editPerson"
      @delete="deletePerson"
      @add-relationship="addRelationshipToPerson"
    />

    <!-- Add/Edit Person Modal -->
    <PersonFormModal
      v-if="isAddingPerson || isEditingPerson"
      :person="isEditingPerson ? selectedPerson : null"
      @save="savePerson"
      @close="closePersonForm"
    />

    <!-- Add Relationship Modal -->
    <AddRelationshipModal
      v-if="isAddingRelationship"
      @close="closeAddRelationship"
      @relationship-added="onRelationshipAdded"
    />

    <!-- Export Modal -->
    <ExportModal v-if="isExporting" @close="closeExport" />

    <!-- Notifications -->
    <NotificationToast
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import PersonDetailsModal from './PersonDetailsModal.vue'
import AddRelationshipModal from './AddRelationshipModal.vue'
import FamilyStats from './FamilyStats.vue'
import PersonSearch from './PersonSearch.vue'
import ExportModal from './ExportModal.vue'
import NotificationToast from './NotificationToast.vue'
import { useNotifications } from '@/composables/useNotifications'
import type { Person, RelationshipType } from '@/types/family'
import PersonFormModal from './PersonFormModal.vue'
import RelationshipTree from './RelationshipTree.vue'
import { storeToRefs } from 'pinia'

// OrgChart interface

const familyTreeStore = useFamilyTreeStore()
const { familyTree, selectedPerson, isAddingPerson, isEditingPerson } = storeToRefs(familyTreeStore)
const {
  setSelectedPerson,
  setIsAddingPerson,
  setIsEditingPerson,
  addPerson,
  updatePerson,
  deletePerson: deletePersonFromStore,
  addRelationship: addRelationshipToStore,
  initializeSampleData: initSampleData,
  loadFromLocalStorage,
  clearLocalStorage,
} = familyTreeStore

const isAddingRelationship = ref(false)
const isExporting = ref(false)

// Notifications
const { notifications, removeNotification, success, error, warning } = useNotifications()

// Methods
const addNewPerson = () => {
  console.log('Adding new person...')
  setSelectedPerson(null)
  setIsAddingPerson(true)
}

const editPerson = (person: Person) => {
  setSelectedPerson(person)
  setIsEditingPerson(true)
}

const deletePerson = (personId: string) => {
  const person = familyTree.value.persons.find((p) => p.id === personId)
  if (person) {
    deletePersonFromStore(personId)
    setSelectedPerson(null)
    success('Удалено!', `${person.name} был удален из семейного древа`)
  }
}

const addRelationshipToPerson = (person1Id: string, person2Id: string, type: RelationshipType) => {
  addRelationshipToStore(person1Id, person2Id, type)
}

const savePerson = (personData: Record<string, unknown>) => {
  console.log('Saving person:', personData)
  try {
    const currentSelectedPerson = selectedPerson.value
    if (isEditingPerson.value && currentSelectedPerson) {
      console.log('Updating existing person')
      updatePerson(currentSelectedPerson.id, personData)
      success('Успешно!', `${personData.name as string} был обновлен`)
    } else {
      console.log('Adding new person')
      const newPerson = addPerson(personData as Omit<Person, 'id' | 'relationships'>)
      console.log('New person created:', newPerson)
      // If we're adding a child to someone, create the relationship
      if (currentSelectedPerson) {
        console.log('Adding relationship to parent')
        addRelationshipToStore(currentSelectedPerson.id, newPerson.id, 'parent')
      }
      success('Успешно!', `${personData.name as string} был добавлен в семейное древо`)
    }
    closePersonForm()
  } catch (err) {
    console.error('Error saving person:', err)
    error('Ошибка!', 'Не удалось сохранить персонажа')
  }
}

const closePersonDetails = () => {
  setSelectedPerson(null)
}

const closePersonForm = () => {
  console.log('Closing person form')
  setIsAddingPerson(false)
  setIsEditingPerson(false)
  setSelectedPerson(null)
}

const initializeSampleData = () => {
  console.log('Initializing sample data...')
  initSampleData()
  success('Пример загружен!', 'Демонстрационные данные были добавлены')
}

const openAddRelationship = () => {
  isAddingRelationship.value = true
}

const closeAddRelationship = () => {
  isAddingRelationship.value = false
}

const onRelationshipAdded = () => {
  success('Связь добавлена!', 'Новая семейная связь была создана')
}

const onPersonSelected = (person: Person) => {
  setSelectedPerson(person)
}

const exportData = () => {
  isExporting.value = true
}

const closeExport = () => {
  isExporting.value = false
}

const clearData = () => {
  if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
    clearLocalStorage()
    familyTree.value.persons = []
    familyTree.value.relationships = []
    familyTree.value.updatedAt = new Date().toISOString()
    setSelectedPerson(null)
    warning('Данные очищены!', 'Все данные семейного древа были удалены')
  }
}

onMounted(async () => {
  console.log('Component mounted!')
  // Try to load from localStorage first
  const loaded = loadFromLocalStorage()
  if (loaded) {
    console.log('Data loaded from localStorage')
    success('Данные загружены!', 'Ваше семейное древо было восстановлено')
  } else {
    // If no saved data, show empty state
    console.log('No saved data found, starting with empty tree')
  }

  // Wait for DOM to be fully rendered
  await nextTick()
  console.log('DOM ready!')
})
</script>

<style scoped>
.family-tree-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.family-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.family-tree-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.family-tree-actions {
  display: flex;
  gap: 15px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(116, 185, 255, 0.4);
}

.icon {
  font-size: 1.2rem;
}

.family-tree-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  min-height: 600px;
}

.tree-header {
  text-align: center;
  margin-bottom: 20px;
}

.tree-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.tree-description {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.relationship-tree-wrapper {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e1e8ed;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

/* Responsive design */
@media (max-width: 768px) {
  .family-tree-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .family-tree-title {
    font-size: 2rem;
  }

  .family-tree-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
