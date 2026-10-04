<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ChatInput from './components/ChatInput.vue'
import ChatMessage from './components/ChatMessage.vue'
import { checkHealth, submitTicket } from './services/api.js'

const apiOnline = ref(false)
const messages = ref([])
const loading = ref(false)
const messagesContainer = ref(null)

onMounted(async () => {
  apiOnline.value = await checkHealth()
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, scrollToBottom, { deep: true })

async function handleSubmit({ description, audio, image }) {
  if (loading.value) return

  messages.value.push({
    role: 'user',
    content: description || 'Analyse de la réclamation',
    audio,
    image,
    timestamp: new Date().toLocaleTimeString(),
  })
  loading.value = true

  const stepMessage = {
    role: 'assistant',
    content: '',
    isStep: true,
    steps: [],
    timestamp: new Date().toLocaleTimeString(),
  }
  messages.value.push(stepMessage)

  try {
    for (let step = 1; step <= 4; step++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      stepMessage.steps = Array.from({ length: step }, (_, index) => index + 1)
      const stepIndex = messages.value.findIndex(message => message.isStep)
      if (stepIndex !== -1) messages.value[stepIndex] = { ...stepMessage }
      scrollToBottom()
    }

    const content = await submitTicket({
      description: description || (image ? "Analyse de l'image" : ''),
      audio,
      image,
    })

    const stepIndex = messages.value.indexOf(stepMessage)
    const assistantMessage = {
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString(),
      ticketId: content.ticket_id ?? `#SH-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      submittedAt: new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date()),
    }

    if (stepIndex !== -1) messages.value[stepIndex] = assistantMessage
    else messages.value.push(assistantMessage)
  } catch (error) {
    const stepIndex = messages.value.findIndex(message => message.isStep)
    const errorMessage = {
      role: 'assistant',
      content: { error: error.message },
      isError: true,
      timestamp: new Date().toLocaleTimeString(),
    }
    if (stepIndex !== -1) messages.value[stepIndex] = errorMessage
    else messages.value.push(errorMessage)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="shell">
    <AppHeader :api-online="apiOnline" />

    <div ref="messagesContainer" class="chat-container">
      <div v-if="messages.length === 0" class="empty-chat">
        <h1>Analyser une réclamation</h1>
        <p>Décrivez l'incident, joignez une note vocale ou une photo. SmartHelp transcrit, analyse et retrouve la règle interne applicable.</p>
      </div>

      <ChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :msg="message"
      />
    </div>

    <ChatInput :loading="loading" @submit="handleSubmit" />
  </div>
</template>
