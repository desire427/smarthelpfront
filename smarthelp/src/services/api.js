const BASE = '/api'


export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`)
    if (!res.ok) return false
    const data = await res.json()
    return data.status === 'ok' || data.status === 'healthy'
  } catch {
    return false
  }
}


export async function submitTicket({ description = '', audio = null, image = null }) {
  const form = new FormData()

  if (description) form.append('description', description)
  if (audio)       form.append('audio', audio)
  if (image)       form.append('image', image)

  const res = await fetch(`${BASE}/support-ticket`, {
    method: 'POST',
    body: form,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? `Erreur ${res.status}`)
  }

  return data
}
