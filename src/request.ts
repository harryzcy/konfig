export const getLastPathname = (url: string, desc: string): string => {
  const { pathname } = new URL(url)
  const lastPart = pathname.split('/').pop() || ''
  if (lastPart === '') {
    throw new Error('invalid input: environment name is not defined')
  }
  return lastPart
}
