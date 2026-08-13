<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const audioFile = ref(null)
const imageFile = ref(null)
const description = ref('')
const textArea = ref(null)

const recording = ref(false)
const recordError = ref(null)
const recordSeconds = ref(0)

let mediaRecorder = null
let audioChunks = []
let timerInterval = null

function autoResize() {
  if (textArea.value) {
    textArea.value.style.height = 'auto'
    textArea.value.style.height = Math.min(textArea.value.scrollHeight, 120) + 'px'
  }
}

function formatDuration(s) {
  const m = Math.floor(s / 60)
  const sec = String(s % 60).padStart(2, '0')
  return `${m}:${sec}`
}

function onAudioChange(e) {
  audioFile.value = e.target.files[0] ?? null
  if (recording.value) stopRecording()
}

function onImageChange(e) {
  imageFile.value = e.target.files[0] ?? null
}

function removeAudio() {
  audioFile.value = null
  const el = document.getElementById('file-audio')
  if (el) el.value = ''
}

function removeImage() {
  imageFile.value = null
  const el = document.getElementById('file-image')
  if (el) el.value = ''
}

async function startRecording() {
  recordError.value = null
  audioChunks = []
  recordSeconds.value = 0

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    recordError.value = "Votre navigateur ne supporte pas l'accès au micro."
    return
  }

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    recordError.value = `${err.name} : ${err.message}`
    return
  }

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  mediaRecorder = new MediaRecorder(stream, { mimeType })

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }

  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop())
    const blob = new Blob(audioChunks, { type: mimeType })
    const ext = mimeType.includes('webm') ? 'webm' : 'ogg'
    audioFile.value = new File([blob], `enregistrement-${Date.now()}.${ext}`, { type: mimeType })
    const el = document.getElementById('file-audio')
    if (el) el.value = ''
    clearInterval(timerInterval)
    recording.value = false
  }

  mediaRecorder.start(200)
  recording.value = true
  timerInterval = setInterval(() => { recordSeconds.value++ }, 1000)
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

function handleSubmit() {
  emit('submit', {
    description: description.value,
    audio: audioFile.value,
    image: imageFile.value,
  })

  // Réinitialiser
  description.value = ''
  if (textArea.value) textArea.value.style.height = 'auto'
  const audioEl = document.getElementById('file-audio')
  if (audioEl) audioEl.value = ''
  const imageEl = document.getElementById('file-image')
  if (imageEl) imageEl.value = ''
  audioFile.value = null
  imageFile.value = null
}
</script>

<template>
  <div class="input-area">
    <form @submit.prevent="handleSubmit" class="input-form">
      <div class="input-fields">
        <textarea
          v-model="description"
          placeholder="Décrivez votre réclamation..."
          :disabled="loading"
          rows="1"
          @input="autoResize"
          ref="textArea"
        ></textarea>

        <div class="file-inputs">
          <label class="file-label" title="Ajouter un fichier audio">
            <input type="file" id="file-audio" accept=".mp3,.wav" @change="onAudioChange" :disabled="loading || recording" />
            <v-icon name="hi-microphone" scale="1.2" />
          </label>
          <label class="file-label" title="Ajouter une image">
            <input type="file" id="file-image" accept=".png,.jpg,.jpeg,.webp" @change="onImageChange" :disabled="loading" />
            <v-icon name="hi-photograph" scale="1.2" />
          </label>
          <button
            v-if="recording"
            type="button"
            class="recording-btn"
            @click="stopRecording"
          >
            ⏹ {{ formatDuration(recordSeconds) }}
          </button>
          <button
            v-else-if="!audioFile"
            type="button"
            class="recording-btn"
            @click="startRecording"
            :disabled="loading"
          >
            <v-icon name="hi-microphone" scale="0.8" /> Enregistrer
          </button>
        </div>

        <button
          type="submit"
          class="send-btn"
          :disabled="loading || (!description && !audioFile && !imageFile)"
        >
          <v-icon v-if="!loading" name="hi-upload" scale="1.2" />
          <span v-else>...</span>
        </button>
      </div>

      <!-- Erreur micro -->
      <div v-if="recordError" class="error-text" style="margin-top: 6px; font-size: 0.85rem;">
        {{ recordError }}
      </div>

      <!-- Fichiers sélectionnés -->
      <div v-if="audioFile || imageFile" class="selected-files">
        <span v-if="audioFile" class="file-tag">
          <v-icon name="hi-microphone" scale="0.8" /> {{ audioFile.name }}
          <button type="button" @click="removeAudio">
            <v-icon name="hi-x" scale="0.8" />
          </button>
        </span>
        <span v-if="imageFile" class="file-tag">
          <v-icon name="hi-photograph" scale="0.8" /> {{ imageFile.name }}
          <button type="button" @click="removeImage">
            <v-icon name="hi-x" scale="0.8" />
          </button>
        </span>
      </div>
    </form>
  </div>
</template>
