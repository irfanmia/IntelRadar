export function shareToTwitter(text: string) {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
}
export function shareToWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
export function shareToTelegram(text: string) {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(text)}`, '_blank')
}
export function shareToFacebook(text: string) {
  window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank')
}
export function shareToLinkedIn(text: string) {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(text)}`, '_blank')
}
