export default function getVisitorID(): string {
  const visitorID = localStorage.getItem('visitorID')
  if (visitorID == null) {
    return ''
  }
  return visitorID
}
