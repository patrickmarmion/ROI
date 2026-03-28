export let sseClient = null
export let lastRecipient = null

export function setSseClient(client) {
  sseClient = client
}

export function setLastRecipient(recipient) {
  lastRecipient = recipient
}
