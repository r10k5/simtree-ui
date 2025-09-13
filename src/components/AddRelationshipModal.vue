<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="form-icon">🔗</span>
          Добавить семейную связь
        </h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="form-section">
          <h3>Выберите персонажей</h3>

          <div class="person-selection">
            <div class="person-selector">
              <label for="person1">Первый персонаж</label>
              <select
                id="person1"
                v-model="selectedPerson1"
                class="form-select"
                @change="onPerson1Change"
              >
                <option value="">Выберите персонажа</option>
                <option v-for="person in availablePersons" :key="person.id" :value="person.id">
                  {{ person.name }} {{ person.surname || '' }}
                </option>
              </select>
              <div v-if="person1" class="selected-person-info">
                <span class="person-avatar">{{ getAvatarEmoji(person1.gender) }}</span>
                <span class="person-name">{{ person1.name }} {{ person1.surname || '' }}</span>
              </div>
            </div>

            <div class="relationship-type-selector">
              <label>Тип связи</label>
              <div class="relationship-options">
                <label class="relationship-option">
                  <input
                    v-model="relationshipType"
                    type="radio"
                    value="parent"
                    class="relationship-radio"
                  />
                  <div class="relationship-card">
                    <span class="relationship-icon">👨‍👩‍👧‍👦</span>
                    <span class="relationship-label">Родитель</span>
                    <span class="relationship-desc">Первый является родителем второго</span>
                  </div>
                </label>

                <label class="relationship-option">
                  <input
                    v-model="relationshipType"
                    type="radio"
                    value="sibling"
                    class="relationship-radio"
                  />
                  <div class="relationship-card">
                    <span class="relationship-icon">👫</span>
                    <span class="relationship-label">Брат/Сестра</span>
                    <span class="relationship-desc">Братья или сестры</span>
                  </div>
                </label>

                <label class="relationship-option">
                  <input
                    v-model="relationshipType"
                    type="radio"
                    value="partner"
                    class="relationship-radio"
                  />
                  <div class="relationship-card">
                    <span class="relationship-icon">💕</span>
                    <span class="relationship-label">Партнер</span>
                    <span class="relationship-desc">Партнеры или супруги</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="person-selector">
              <label for="person2">Второй персонаж</label>
              <select
                id="person2"
                v-model="selectedPerson2"
                class="form-select"
                @change="onPerson2Change"
              >
                <option value="">Выберите персонажа</option>
                <option v-for="person in availablePersons2" :key="person.id" :value="person.id">
                  {{ person.name }} {{ person.surname || '' }}
                </option>
              </select>
              <div v-if="person2" class="selected-person-info">
                <span class="person-avatar">{{ getAvatarEmoji(person2.gender) }}</span>
                <span class="person-name">{{ person2.name }} {{ person2.surname || '' }}</span>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="relationshipPreview" class="relationship-preview">
            <h4>Предварительный просмотр связи:</h4>
            <div class="preview-content">
              <div class="preview-person">
                <span class="person-avatar">{{ getAvatarEmoji(person1!.gender) }}</span>
                <span class="person-name">{{ person1!.name }} {{ person1!.surname || '' }}</span>
              </div>
              <div class="preview-relationship">
                <span class="relationship-arrow">{{ getRelationshipArrow() }}</span>
                <span class="relationship-text">{{ getRelationshipText() }}</span>
              </div>
              <div class="preview-person">
                <span class="person-avatar">{{ getAvatarEmoji(person2!.gender) }}</span>
                <span class="person-name">{{ person2!.name }} {{ person2!.surname || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="action-buttons">
          <button type="button" class="btn btn-secondary" @click="close">Отмена</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="addRelationship"
            :disabled="!canAddRelationship"
          >
            <span class="icon">🔗</span>
            Добавить связь
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import type { Person, RelationshipType } from '@/types/family'

interface Emits {
  (e: 'close'): void
  (e: 'relationship-added'): void
}

const emit = defineEmits<Emits>()

const familyTreeStore = useFamilyTreeStore()
const { familyTree, getPersonById, addRelationship: addRelationshipToStore } = familyTreeStore

const selectedPerson1 = ref('')
const selectedPerson2 = ref('')
const relationshipType = ref<RelationshipType>('parent')
const errorMessage = ref('')

const person1 = computed(() =>
  selectedPerson1.value ? getPersonById.value(selectedPerson1.value) : null,
)

const person2 = computed(() =>
  selectedPerson2.value ? getPersonById.value(selectedPerson2.value) : null,
)

const availablePersons = computed(() => familyTree.persons)

const availablePersons2 = computed(() => {
  if (!selectedPerson1.value) return familyTree.persons
  return familyTree.persons.filter((person) => person.id !== selectedPerson1.value)
})

const relationshipPreview = computed(() => {
  return person1.value && person2.value && relationshipType.value
})

const canAddRelationship = computed(() => {
  return person1.value && person2.value && relationshipType.value && !errorMessage.value
})

const getAvatarEmoji = (gender: string) => {
  const emojis = {
    male: '👨',
    female: '👩',
    other: '🧑',
  }
  return emojis[gender as keyof typeof emojis] || '🧑'
}

const getRelationshipArrow = () => {
  const arrows = {
    parent: '⬇️',
    sibling: '↔️',
    partner: '💕',
  }
  return arrows[relationshipType.value] || '↔️'
}

const getRelationshipText = () => {
  const texts = {
    parent: 'родитель',
    sibling: 'брат/сестра',
    partner: 'партнер',
  }
  return texts[relationshipType.value] || 'связь'
}

const validateRelationship = () => {
  errorMessage.value = ''

  if (!person1.value || !person2.value) return

  // Check if relationship already exists
  const existingRelationship = familyTree.relationships.find(
    (rel) =>
      (rel.person1Id === person1.value!.id && rel.person2Id === person2.value!.id) ||
      (rel.person1Id === person2.value!.id && rel.person2Id === person1.value!.id),
  )

  if (existingRelationship) {
    errorMessage.value = 'Связь между этими персонажами уже существует'
    return
  }

  // Check for logical inconsistencies
  if (relationshipType.value === 'parent') {
    // Can't be parent of someone older
    if (person1.value.birthDate && person2.value.birthDate) {
      const person1Age = new Date(person1.value.birthDate)
      const person2Age = new Date(person2.value.birthDate)
      if (person1Age >= person2Age) {
        errorMessage.value = 'Родитель не может быть старше или ровесником ребенка'
        return
      }
    }

    // Can't be parent of themselves
    if (person1.value.id === person2.value.id) {
      errorMessage.value = 'Персонаж не может быть родителем самому себе'
      return
    }
  }

  if (relationshipType.value === 'sibling') {
    // Can't be sibling of themselves
    if (person1.value.id === person2.value.id) {
      errorMessage.value = 'Персонаж не может быть братом/сестрой самому себе'
      return
    }
  }
}

const onPerson1Change = () => {
  selectedPerson2.value = ''
  validateRelationship()
}

const onPerson2Change = () => {
  validateRelationship()
}

const addRelationship = () => {
  if (!canAddRelationship.value) return

  addRelationshipToStore(person1.value!.id, person2.value!.id, relationshipType.value)
  emit('relationship-added')
  close()
}

const close = () => {
  emit('close')
}

// Watch for changes in relationship type
watch(relationshipType, validateRelationship)
watch([person1, person2], validateRelationship)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.form-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
}

.form-section h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.person-selection {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.person-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.person-selector label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.form-select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.selected-person-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px solid #e1e8ed;
}

.person-avatar {
  font-size: 1.5rem;
  background: white;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.person-name {
  font-weight: 600;
  color: #2c3e50;
}

.relationship-type-selector {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.relationship-type-selector label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.relationship-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.relationship-option {
  cursor: pointer;
}

.relationship-radio {
  display: none;
}

.relationship-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 15px;
  transition: all 0.3s ease;
  background: white;
  text-align: center;
}

.relationship-radio:checked + .relationship-card {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.relationship-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.relationship-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.relationship-desc {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #fcc;
  font-weight: 600;
  text-align: center;
}

.relationship-preview {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  border: 2px solid #e1e8ed;
}

.relationship-preview h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.preview-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-relationship {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.relationship-arrow {
  font-size: 1.5rem;
}

.relationship-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 2px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 0 0 20px 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #95a5a6, #7f8c8d);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
}

.icon {
  font-size: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 20px;
  }

  .relationship-options {
    grid-template-columns: 1fr;
  }

  .preview-content {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
