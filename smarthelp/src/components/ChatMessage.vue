<script setup>
import TicketResult from './TicketResult.vue'

defineProps({
  msg: { type: Object, required: true },
})
</script>

<template>
  <div class="message-wrapper">

    <!-- Message utilisateur -->
    <div v-if="msg.role === 'user'" class="message user-message">
      <div class="message-content">
        <div class="message-header">
          <span class="message-role">Vous</span>
          <span class="message-time">{{ msg.timestamp }}</span>
        </div>
        <div class="message-text">{{ msg.content }}</div>
        <div v-if="msg.audio" class="message-attachment">
          <v-icon name="hi-microphone" scale="0.8" /> {{ msg.audio.name }}
        </div>
        <div v-if="msg.image" class="message-attachment">
          <v-icon name="hi-photograph" scale="0.8" /> {{ msg.image.name }}
        </div>
      </div>
    </div>

    <!-- Message assistant - étapes de progression -->
    <div v-else-if="msg.isStep" class="message assistant-message">
      <div class="message-content">
        <div class="message-header">
          <span class="message-role">SmartHelp</span>
          <span class="message-time">{{ msg.timestamp }}</span>
        </div>
        <div class="steps">
          <div
            v-for="(label, i) in ['Transcription audio', 'Analyse visuelle', 'Recherche dans la base interne', 'Synthèse du diagnostic']"
            :key="i"
            class="step"
            :class="{ done: msg.steps.includes(i + 1) }"
          >
            <span class="mark">
              <v-icon v-if="msg.steps.includes(i + 1)" name="hi-check" scale="0.7" fill="white" />
            </span>
            {{ label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Message assistant - résultat -->
    <div v-else-if="msg.role === 'assistant' && !msg.isError" class="message assistant-message">
      <div class="message-content">
        <div class="message-header">
          <span class="message-role">SmartHelp</span>
          <span class="message-time">{{ msg.timestamp }}</span>
        </div>
        <TicketResult
          :content="msg.content"
          :ticket-id="msg.ticketId"
          :submitted-at="msg.submittedAt"
        />
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="msg.isError" class="message assistant-message error-message">
      <div class="message-content">
        <div class="message-header">
          <span class="message-role">SmartHelp</span>
          <span class="message-time">{{ msg.timestamp }}</span>
        </div>
        <div class="error-text">
          <v-icon name="hi-x" scale="0.8" /> {{ msg.content.error }}
        </div>
      </div>
    </div>

  </div>
</template>
