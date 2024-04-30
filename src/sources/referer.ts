export default function getReferer(): string {
  const ref = localStorage.getItem('referer')
  if (ref == null) {
    return location.href
  } else {
    return ref
  }
}
