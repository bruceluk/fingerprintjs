export default function getToken(): string {
  const token = localStorage.getItem('token')
  if (token == null) {
    return ''
  }
  return token
}
