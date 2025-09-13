<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="form-icon">👤</span>
          {{ isEditing ? 'Редактировать персонажа' : 'Добавить персонажа' }}
        </h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <form @submit.prevent="save" class="modal-body">
        <div class="form-section">
          <h3>Основная информация</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="name">Имя *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                placeholder="Введите имя"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="surname">Фамилия</label>
              <input
                id="surname"
                v-model="formData.surname"
                type="text"
                placeholder="Введите фамилию"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="gender">Пол *</label>
              <select id="gender" v-model="formData.gender" required class="form-select">
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </div>

            <div class="form-group">
              <label for="occupation">Профессия</label>
              <input
                id="occupation"
                v-model="formData.occupation"
                type="text"
                placeholder="Введите профессию"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthDate">Дата рождения</label>
              <input id="birthDate" v-model="formData.birthDate" type="date" class="form-input" />
            </div>

            <div class="form-group">
              <label for="deathDate">Дата смерти</label>
              <input id="deathDate" v-model="formData.deathDate" type="date" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label for="avatar">Аватар</label>
            <div class="avatar-upload">
              <input
                id="avatar"
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                class="avatar-input"
              />
              <div class="avatar-preview" @click="triggerAvatarUpload">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar preview"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <span class="avatar-icon">📷</span>
                  <span class="avatar-text">Загрузить фото</span>
                </div>
              </div>
              <button
                v-if="avatarPreview"
                type="button"
                class="remove-avatar-btn"
                @click="removeAvatar"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="form-section" v-if="!isEditing">
          <h3>Семейные связи</h3>
          <p class="form-description">
            Выберите, кем этот персонаж приходится выбранному в дереве персонажу
          </p>

          <div class="relationship-options">
            <label class="relationship-option">
              <input
                v-model="relationshipType"
                type="radio"
                value="child"
                class="relationship-radio"
              />
              <div class="relationship-card">
                <span class="relationship-icon">👶</span>
                <span class="relationship-label">Ребенок</span>
                <span class="relationship-desc">Добавить как ребенка</span>
              </div>
            </label>

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
                <span class="relationship-desc">Добавить как родителя</span>
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
                <span class="relationship-desc">Добавить как брата или сестру</span>
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
                <span class="relationship-desc">Добавить как партнера/супруга</span>
              </div>
            </label>

            <label class="relationship-option">
              <input
                v-model="relationshipType"
                type="radio"
                value="none"
                class="relationship-radio"
              />
              <div class="relationship-card">
                <span class="relationship-icon">👤</span>
                <span class="relationship-label">Без связи</span>
                <span class="relationship-desc">Добавить как отдельного персонажа</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>Дополнительная информация</h3>

          <div class="form-group">
            <label for="traits">Черты характера</label>
            <input
              id="traits"
              v-model="traitsInput"
              type="text"
              placeholder="Введите черты через запятую (например: добрый, умный, веселый)"
              class="form-input"
              @blur="updateTraits"
            />
            <div class="traits-display" v-if="formData.traits && formData.traits.length > 0">
              <span v-for="trait in formData.traits" :key="trait" class="trait-tag">
                {{ trait }}
                <button type="button" @click="removeTrait(trait)" class="trait-remove">×</button>
              </span>
            </div>
          </div>
        </div>
      </form>

      <div class="modal-footer">
        <div class="action-buttons">
          <button type="button" class="btn btn-secondary" @click="close">Отмена</button>
          <button type="submit" class="btn btn-primary" @click="save" :disabled="!isFormValid">
            <span class="icon">{{ isEditing ? '💾' : '➕' }}</span>
            {{ isEditing ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Person } from '@/types/family'

interface Props {
  person?: Person | null
}

interface Emits {
  (e: 'save', personData: any): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.person)

const formData = ref({
  name: '',
  surname: '',
  gender: '',
  birthDate: '',
  deathDate: '',
  occupation: '',
  traits: [] as string[],
})

const traitsInput = ref('')
const relationshipType = ref('none')
const avatarInput = ref<HTMLInputElement>()
const avatarPreview = ref('')

const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && formData.value.gender !== ''
})

// Initialize form data
onMounted(() => {
  if (props.person) {
    formData.value = {
      name: props.person.name,
      surname: props.person.surname || '',
      gender: props.person.gender,
      birthDate: props.person.birthDate || '',
      deathDate: props.person.deathDate || '',
      occupation: props.person.occupation || '',
      traits: [...(props.person.traits || [])],
    }
    traitsInput.value = formData.value.traits.join(', ')
    avatarPreview.value = props.person.avatar || ''
  }
})

const updateTraits = () => {
  const traits = traitsInput.value
    .split(',')
    .map((trait) => trait.trim())
    .filter((trait) => trait !== '')
  formData.value.traits = traits
}

const removeTrait = (trait: string) => {
  formData.value.traits = formData.value.traits.filter((t) => t !== trait)
  traitsInput.value = formData.value.traits.join(', ')
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  avatarPreview.value = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const save = () => {
  if (!isFormValid.value) return

  const personData = {
    ...formData.value,
    avatar: avatarPreview.value || undefined,
    traits: formData.value.traits.length > 0 ? formData.value.traits : undefined,
  }

  // Remove empty strings
  Object.keys(personData).forEach((key) => {
    if (personData[key as keyof typeof personData] === '') {
      delete personData[key as keyof typeof personData]
    }
  })

  emit('save', personData)
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
  max-width: 700px;
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

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.5;
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

.traits-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.trait-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.trait-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.trait-remove:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.avatar-upload {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-input {
  display: none;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border: 2px dashed #e1e8ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.avatar-preview:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
}

.avatar-icon {
  font-size: 2rem;
}

.avatar-text {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.remove-avatar-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.remove-avatar-btn:hover {
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

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .relationship-options {
    grid-template-columns: 1fr;
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
