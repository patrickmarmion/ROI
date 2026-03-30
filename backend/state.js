export let sseClient = null
export let lastRecipient = null
export let sessionToken = null

export function setSseClient(client) {
  sseClient = client
}

export function setLastRecipient(recipient) {
  lastRecipient = recipient
}

export function setSessionToken(token) {
  sessionToken = token
}
