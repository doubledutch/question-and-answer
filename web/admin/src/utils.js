import qs from 'qs'

export function parseQueryString() {
  return qs.parse(document.location.search.substr(1))
}

export function openTab(url) {
  window.open(url, '_blank')
}