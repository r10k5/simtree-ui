<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="person-avatar">{{ getAvatarEmoji(person.gender) }}</span>
          {{ person.name }} {{ person.surname || '' }}
        </h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="person-info">
          <div class="info-section">
            <h3>Основная информация</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Пол:</label>
                <span class="gender-badge" :class="person.gender">
                  {{ getGenderText(person.gender) }}
                </span>
              </div>
              <div class="info-item" v-if="person.birthDate">
                <label>Дата рождения:</label>
                <span>{{ formatDate(person.birthDate) }}</span>
              </div>
              <div class="info-item" v-if="person.deathDate">
                <label>Дата смерти:</label>
                <span>{{ formatDate(person.deathDate) }}</span>
              </div>
              <div class="info-item" v-if="person.occupation">
                <label>Профессия:</label>
                <span>{{ person.occupation }}</span>
              </div>
            </div>
          </div>

          <div class="relationships-section">
            <h3>Семейные связи</h3>

            <div class="relationship-group" v-if="relationships.parents.length > 0">
              <h4>Родители</h4>
              <div class="relationship-list">
                <div
                  v-for="parent in relationships.parents"
                  :key="parent.id"
                  class="relationship-item"
                  @click="selectPerson(parent)"
                >
                  <span class="relationship-avatar">{{ getAvatarEmoji(parent.gender) }}</span>
                  <span class="relationship-name"
                    >{{ parent.name }} {{ parent.surname || '' }}</span
                  >
                  <button
                    class="remove-relationship-btn"
                    @click.stop="removeRelationship(person.id, parent.id, 'parent')"
                    title="Удалить связь"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="relationship-group" v-if="relationships.children.length > 0">
              <h4>Дети</h4>
              <div class="relationship-list">
                <div
                  v-for="child in relationships.children"
                  :key="child.id"
                  class="relationship-item"
                  @click="selectPerson(child)"
                >
                  <span class="relationship-avatar">{{ getAvatarEmoji(child.gender) }}</span>
                  <span class="relationship-name">{{ child.name }} {{ child.surname || '' }}</span>
                  <button
                    class="remove-relationship-btn"
                    @click.stop="removeRelationship(person.id, child.id, 'parent')"
                    title="Удалить связь"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="relationship-group" v-if="relationships.siblings.length > 0">
              <h4>Братья и сестры</h4>
              <div class="relationship-list">
                <div
                  v-for="sibling in relationships.siblings"
                  :key="sibling.id"
                  class="relationship-item"
                  @click="selectPerson(sibling)"
                >
                  <span class="relationship-avatar">{{ getAvatarEmoji(sibling.gender) }}</span>
                  <span class="relationship-name"
                    >{{ sibling.name }} {{ sibling.surname || '' }}</span
                  >
                  <button
                    class="remove-relationship-btn"
                    @click.stop="removeRelationship(person.id, sibling.id, 'sibling')"
                    title="Удалить связь"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="relationship-group" v-if="relationships.partners.length > 0">
              <h4>Партнеры</h4>
              <div class="relationship-list">
                <div
                  v-for="partner in relationships.partners"
                  :key="partner.id"
                  class="relationship-item"
                  @click="selectPerson(partner)"
                >
                  <span class="relationship-avatar">{{ getAvatarEmoji(partner.gender) }}</span>
                  <span class="relationship-name"
                    >{{ partner.name }} {{ partner.surname || '' }}</span
                  >
                  <button
                    class="remove-relationship-btn"
                    @click.stop="removeRelationship(person.id, partner.id, 'partner')"
                    title="Удалить связь"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="addRelationship">
            <span class="icon">🔗</span>
            Добавить связь
          </button>
          <button class="btn btn-primary" @click="edit">
            <span class="icon">✏️</span>
            Редактировать
          </button>
          <button class="btn btn-danger" @click="deletePerson">
            <span class="icon">🗑️</span>
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import type { Person, RelationshipType } from '@/types/family'

interface Props {
  person: Person
}

interface Emits {
  (e: 'close'): void
  (e: 'edit', person: Person): void
  (e: 'delete', personId: string): void
  (e: 'add-relationship', person1Id: string, person2Id: string, type: RelationshipType): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const familyTreeStore = useFamilyTreeStore()
const { getPersonRelationships, removeRelationship: removeRelationshipFromStore } = familyTreeStore

const relationships = computed(() => getPersonRelationships(props.person.id))

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
    male: 'Мужской',
    female: 'Женский',
    other: 'Другой',
  }
  return texts[gender as keyof typeof texts] || 'Не указан'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const selectPerson = (person: Person) => {
  // This could be used to navigate to another person's details
  console.log('Selected person:', person.name)
}

const removeRelationship = (person1Id: string, person2Id: string, type: RelationshipType) => {
  if (confirm('Удалить эту семейную связь?')) {
    removeRelationshipFromStore(person1Id, person2Id, type)
  }
}

const addRelationship = () => {
  // This will be handled by the parent component
  emit('add-relationship', props.person.id, '', 'parent')
}

const edit = () => {
  emit('edit', props.person)
}

const deletePerson = () => {
  if (confirm(`Удалить ${props.person.name} из семейного древа?`)) {
    emit('delete', props.person.id)
  }
}

const close = () => {
  emit('close')
}
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
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
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

.person-avatar {
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

.person-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section h3,
.relationships-section h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #2c3e50;
  font-size: 1.1rem;
}

.gender-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gender-badge.male {
  background: #4a90e2;
  color: white;
}

.gender-badge.female {
  background: #e24a90;
  color: white;
}

.gender-badge.other {
  background: #90e24a;
  color: white;
}

.relationship-group {
  margin-bottom: 25px;
}

.relationship-group h4 {
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.relationship-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relationship-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.relationship-item:hover {
  background: #e9ecef;
  border-color: #667eea;
  transform: translateX(5px);
}

.relationship-avatar {
  font-size: 1.5rem;
  background: white;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.relationship-name {
  flex: 1;
  font-weight: 600;
  color: #2c3e50;
}

.remove-relationship-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-relationship-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
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
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(116, 185, 255, 0.4);
}

.btn-danger {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
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

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
