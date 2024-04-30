export default function getVisitorID(): string {
  const visitorID = localStorage.getItem('visitorID')
  if (visitorID == null) {
    return getCookie('_fpjsvid')
  }
  return visitorID
}

function getCookie(name: string): string {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return matches ? decodeURIComponent(matches[1]) : ''
}