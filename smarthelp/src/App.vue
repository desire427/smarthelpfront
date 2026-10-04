<script setup>
import { ref } from 'vue'
import ChatInput from './components/ChatInput.vue'
import TicketResult from './components/TicketResult.vue'
import AppHeader from './components/AppHeader.vue'
import { submitTicket } from './services/api.js'

const loading = ref(false)
const result = ref(null)

async function handleSubmit(data) {
  loading.value = true
  try {
    const response = await submitTicket(data)
    result.value = {
      content: response,
      ticketId: response.ticket_id,
      submittedAt: new Date().toLocaleString('fr-FR')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert(`Erreur: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div id="app">
    <AppHeader />
    <main class="container">
      <ChatInput @submit="handleSubmit" :loading="loading" />
      <TicketResult
        v-if="result"
        :content="result.content"
        :ticket-id="result.ticketId"
        :submitted-at="result.submittedAt"
      />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main.container {
  flex: 1;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
</style>
