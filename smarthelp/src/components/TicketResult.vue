<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: { type: Object, required: true },
  ticketId: { type: String, required: true },
  submittedAt: { type: String, required: true },
})

function badgeClass(status) {
  if (!status) return 'status-badge outline'
  const s = status.toLowerCase()
  if (s.includes('refus') || s.includes('rejet')) return 'status-badge danger'
  if (s.includes('vérif') || s.includes('verif') || s.includes('examin')) return 'status-badge warning'
  return 'status-badge'
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/("[\w_]+")\s*:/g, '<span class="k">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="v">$1</span>')
    .replace(/:\s*([\d.]+)/g, ': <span class="v">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="v">$1</span>')
}

const copied = ref(false)
async function copyJson() {
  await navigator.clipboard.writeText(JSON.stringify(props.content, null, 2))
  copied.value = true
  setTimeout(() => { copied.value = false }, 1800)
}
</script>

<template>
  <div class="result show">

    <div class="status-row">
      <span :class="badgeClass(content.proposed_status)">
        <v-icon v-if="content.proposed_status" name="hi-check" scale="0.7" />
        {{ content.proposed_status ?? 'À vérifier' }}
      </span>
      <div class="ticket-meta">
        <v-icon name="hi-document-text" scale="0.8" /> Ticket {{ ticketId }}<br />
        <v-icon name="hi-clock" scale="0.8" /> {{ submittedAt }}
      </div>
    </div>

    <!-- Transcription audio -->
    <div v-if="content.transcribed_text" class="data-card">
      <span class="dc-label"><v-icon name="hi-microphone" scale="0.8" /> Transcription audio</span>
      <p>{{ content.transcribed_text }}</p>
    </div>

    <!-- Analyse visuelle -->
    <div v-if="content.vision_diagnosis" class="data-card">
      <span class="dc-label"><v-icon name="hi-photograph" scale="0.8" /> Analyse de l'image</span>
      <p>
        {{ content.vision_diagnosis.categorie }}
        <template v-if="content.vision_diagnosis.confiance != null">
          — confiance {{ (content.vision_diagnosis.confiance * 100).toFixed(0) }}%
        </template>
      </p>
    </div>

    <!-- Règle interne -->
    <div class="data-card">
      <span class="dc-label"><v-icon name="hi-document-text" scale="0.8" /> Règle interne trouvée</span>
      <p>{{ content.matched_policy ?? 'Aucune règle correspondante trouvée.' }}</p>
    </div>

    <!-- Score de similarité -->
    <div class="data-card">
      <span class="dc-label">Score de similarité</span>
      <p>{{ content.similarity_score }}</p>
    </div>

    <!-- JSON brut -->
    <div class="json-block">
      <div class="json-head">
        <span class="dc-label">Réponse JSON</span>
        <button type="button" class="copy-btn" @click="copyJson">
          {{ copied ? 'Copié ✓' : 'Copier' }}
        </button>
      </div>
      <pre v-html="prettyJson(content)"></pre>
    </div>

  </div>
</template>
