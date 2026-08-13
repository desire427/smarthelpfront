<!-- fichier HelloWorld.vue -->
<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { checkHealth, submitTicket } from '../services/api.js'
import AppHeader from './AppHeader.vue'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

// État de santé du backend
const apiOnline = ref(false)
onMounted(async () => {
  apiOnline.value = await checkHealth()
})

// Messages du chat
const messages = ref([])
const loading = ref(false)

// Faire défiler vers le bas
const messagesContainer = ref(null)
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
watch(messages, () => { scrollToBottom() }, { deep: true })

// Soumission
async function handleSubmit({ description, audio, image }) {
  if (loading.value) return

  // Message utilisateur
  messages.value.push({
    role: 'user',
    content: description || 'Analyse de la réclamation',
    audio,
    image,
    timestamp: new Date().toLocaleTimeString(),
  })

  loading.value = true

  try {
    // Message de progression
    const stepMessage = {
      role: 'assistant',
      content: '',
      isStep: true,
      steps: [],
      timestamp: new Date().toLocaleTimeString(),
    }
    messages.value.push(stepMessage)

    for (let i = 1; i <= 4; i++) {
      await new Promise(r => setTimeout(r, 600))
      stepMessage.steps = Array.from({ length: i }, (_, k) => k + 1)
      const idx = messages.value.findIndex(m => m.isStep)
      if (idx !== -1) messages.value[idx] = { ...stepMessage }
      scrollToBottom()
    }

    // Appel API
    const data = await submitTicket({
      description: description || (image ? "Analyse de l'image" : ''),
      audio,
      image,
    })

    const assistantMessage = {
      role: 'assistant',
      content: data,
      timestamp: new Date().toLocaleTimeString(),
      ticketId: '#SH-' + String(Math.floor(Math.random() * 9000) + 1000),
      submittedAt: new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date()),
    }

    const stepIdx = messages.value.indexOf(stepMessage)
    if (stepIdx !== -1) {
      messages.value[stepIdx] = assistantMessage
    } else {
      messages.value.push(assistantMessage)
    }
  } catch (err) {
    const errorMsg = {
      role: 'assistant',
      content: { error: err.message },
      isError: true,
      timestamp: new Date().toLocaleTimeString(),
    }
    const stepIdx = messages.value.findIndex(m => m.isStep)
    if (stepIdx !== -1) {
      messages.value[stepIdx] = errorMsg
    } else {
      messages.value.push(errorMsg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="shell">

    <AppHeader :api-online="apiOnline" />

    <!-- Zone de chat -->
    <div class="chat-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <h1>Analyser une réclamation</h1>
        <p>Décrivez l'incident, joignez une note vocale ou une photo. SmartHelp transcrit, analyse et retrouve la règle interne applicable.</p>
      </div>

      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :msg="msg"
      />
    </div>

    <ChatInput :loading="loading" @submit="handleSubmit" />

  </div>
</template>
