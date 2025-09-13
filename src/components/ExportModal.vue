<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="form-icon">📤</span>
          Экспорт семейного древа
        </h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="export-section">
          <h3>Выберите формат экспорта</h3>

          <div class="export-options">
            <div
              class="export-option"
              @click="selectFormat('json')"
              :class="{ active: selectedFormat === 'json' }"
            >
              <div class="export-icon">📄</div>
              <div class="export-info">
                <h4>JSON</h4>
                <p>Структурированные данные для программного использования</p>
              </div>
            </div>

            <div
              class="export-option"
              @click="selectFormat('csv')"
              :class="{ active: selectedFormat === 'csv' }"
            >
              <div class="export-icon">📊</div>
              <div class="export-info">
                <h4>CSV</h4>
                <p>Табличные данные для Excel и других программ</p>
              </div>
            </div>

            <div
              class="export-option"
              @click="selectFormat('pdf')"
              :class="{ active: selectedFormat === 'pdf' }"
            >
              <div class="export-icon">📋</div>
              <div class="export-info">
                <h4>PDF</h4>
                <p>Печатная версия семейного древа</p>
              </div>
            </div>

            <div
              class="export-option"
              @click="selectFormat('image')"
              :class="{ active: selectedFormat === 'image' }"
            >
              <div class="export-icon">🖼️</div>
              <div class="export-info">
                <h4>Изображение</h4>
                <p>PNG или JPG изображение древа</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedFormat" class="export-settings">
          <h3>Настройки экспорта</h3>

          <div class="settings-grid">
            <div class="setting-group">
              <label>Имя файла</label>
              <input v-model="fileName" type="text" class="form-input" placeholder="family-tree" />
            </div>

            <div v-if="selectedFormat === 'image'" class="setting-group">
              <label>Формат изображения</label>
              <select v-model="imageFormat" class="form-select">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>

            <div v-if="selectedFormat === 'pdf'" class="setting-group">
              <label>Размер страницы</label>
              <select v-model="pageSize" class="form-select">
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <div v-if="selectedFormat === 'csv'" class="setting-group">
              <label>Разделитель</label>
              <select v-model="csvDelimiter" class="form-select">
                <option value=",">Запятая (,)</option>
                <option value=";">Точка с запятой (;)</option>
                <option value="\t">Табуляция</option>
              </select>
            </div>
          </div>

          <div class="export-options-checkboxes">
            <label class="checkbox-label">
              <input v-model="includePhotos" type="checkbox" class="checkbox-input" />
              <span class="checkbox-text">Включить фотографии</span>
            </label>

            <label class="checkbox-label">
              <input
                v-model="includeRelationships"
                type="checkbox"
                class="checkbox-input"
                checked
              />
              <span class="checkbox-text">Включить семейные связи</span>
            </label>

            <label class="checkbox-label">
              <input v-model="includeStatistics" type="checkbox" class="checkbox-input" checked />
              <span class="checkbox-text">Включить статистику</span>
            </label>
          </div>
        </div>

        <div v-if="selectedFormat" class="export-preview">
          <h3>Предварительный просмотр</h3>
          <div class="preview-content">
            <div class="preview-stats">
              <div class="preview-stat">
                <span class="stat-label">Персонажей:</span>
                <span class="stat-value">{{ familyTree.persons.length }}</span>
              </div>
              <div class="preview-stat">
                <span class="stat-label">Связей:</span>
                <span class="stat-value">{{ familyTree.relationships.length }}</span>
              </div>
              <div class="preview-stat">
                <span class="stat-label">Размер файла:</span>
                <span class="stat-value">{{ estimatedFileSize }}</span>
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
            @click="exportData"
            :disabled="!selectedFormat"
          >
            <span class="icon">📤</span>
            Экспортировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/familyTree'
import type { Person, Relationship } from '@/types/family'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const familyTreeStore = useFamilyTreeStore()
const { familyTree } = familyTreeStore

const selectedFormat = ref('')
const fileName = ref('family-tree')
const imageFormat = ref('png')
const pageSize = ref('A4')
const csvDelimiter = ref(',')
const includePhotos = ref(true)
const includeRelationships = ref(true)
const includeStatistics = ref(true)

const estimatedFileSize = computed(() => {
  const personCount = familyTree.persons.length
  const relationshipCount = familyTree.relationships.length

  switch (selectedFormat.value) {
    case 'json':
      return `${Math.round(personCount * 0.5 + relationshipCount * 0.2)} KB`
    case 'csv':
      return `${Math.round(personCount * 0.1 + relationshipCount * 0.05)} KB`
    case 'pdf':
      return `${Math.round(personCount * 0.3 + 50)} KB`
    case 'image':
      return `${Math.round(personCount * 0.2 + 100)} KB`
    default:
      return '0 KB'
  }
})

const selectFormat = (format: string) => {
  selectedFormat.value = format
}

const exportData = () => {
  if (!selectedFormat.value) return

  switch (selectedFormat.value) {
    case 'json':
      exportJSON()
      break
    case 'csv':
      exportCSV()
      break
    case 'pdf':
      exportPDF()
      break
    case 'image':
      exportImage()
      break
  }

  close()
}

const exportJSON = () => {
  const data = {
    familyTree: {
      ...familyTree,
      exportDate: new Date().toISOString(),
      exportFormat: 'json',
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadFile(blob, `${fileName.value}.json`)
}

const exportCSV = () => {
  const headers = [
    'ID',
    'Имя',
    'Фамилия',
    'Пол',
    'Дата рождения',
    'Дата смерти',
    'Профессия',
    'Родители',
    'Дети',
    'Братья/Сестры',
    'Партнеры',
  ]

  const rows = familyTree.persons.map((person) => [
    person.id,
    person.name,
    person.surname || '',
    person.gender,
    person.birthDate || '',
    person.deathDate || '',
    person.occupation || '',
    person.relationships.parents.join(';'),
    person.relationships.children.join(';'),
    person.relationships.siblings.join(';'),
    person.relationships.partners.join(';'),
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(csvDelimiter.value))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${fileName.value}.csv`)
}

const exportPDF = () => {
  // Create a simple PDF-like content
  const content = generatePDFContent()
  const blob = new Blob([content], { type: 'text/plain' })
  downloadFile(blob, `${fileName.value}.txt`)

  // In a real implementation, you would use a PDF library like jsPDF
  alert('PDF экспорт будет реализован в следующей версии. Сейчас экспортируется текстовый файл.')
}

const exportImage = () => {
  // Get the org chart container and convert to image
  const orgChartContainer = document.querySelector('.org-chart-container')
  if (orgChartContainer) {
    // In a real implementation, you would use html2canvas or similar
    alert('Экспорт изображения будет реализован в следующей версии.')
  }
}

const generatePDFContent = () => {
  let content = `СЕМЕЙНОЕ ДРЕВО\n`
  content += `Экспортировано: ${new Date().toLocaleDateString('ru-RU')}\n\n`

  if (includeStatistics.value) {
    content += `СТАТИСТИКА:\n`
    content += `Всего персонажей: ${familyTree.persons.length}\n`
    content += `Всего связей: ${familyTree.relationships.length}\n\n`
  }

  content += `ПЕРСОНАЖИ:\n`
  familyTree.persons.forEach((person) => {
    content += `\n${person.name} ${person.surname || ''}\n`
    content += `Пол: ${person.gender}\n`
    if (person.birthDate) content += `Дата рождения: ${person.birthDate}\n`
    if (person.occupation) content += `Профессия: ${person.occupation}\n`
    if (includeRelationships.value) {
      const relationships = familyTreeStore.getPersonRelationships(person.id)
      if (relationships.parents.length > 0) {
        content += `Родители: ${relationships.parents.map((p) => p.name).join(', ')}\n`
      }
      if (relationships.children.length > 0) {
        content += `Дети: ${relationships.children.map((p) => p.name).join(', ')}\n`
      }
    }
  })

  return content
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
  backdrop-filter: blur(5px);
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

.export-section,
.export-settings,
.export-preview {
  margin-bottom: 30px;
}

.export-section h3,
.export-settings h3,
.export-preview h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.export-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.export-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.export-icon {
  font-size: 2.5rem;
  background: white;
  padding: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.export-info h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 5px 0;
}

.export-info p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group label {
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

.export-options-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  background: rgba(102, 126, 234, 0.05);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.checkbox-text {
  color: #2c3e50;
  font-weight: 500;
}

.preview-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e1e8ed;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.preview-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.stat-label {
  color: #2c3e50;
  font-weight: 600;
}

.stat-value {
  color: #667eea;
  font-weight: 700;
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

  .export-options {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .preview-stats {
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
