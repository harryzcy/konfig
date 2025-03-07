export const getLastPathname = (url: string, desc: string): string => {
  const { pathname } = new URL(url)
  const lastPart = pathname.split('/').pop() || ''
  if (lastPart === '') {
    throw new Error(`invalid input: ${desc} is not defined`)
  }
  return lastPart
}

/**
 * Get the nth last pathname of a url
 * @param url url of the request
 * @param number number of last pathname, starting from 0
 */
export const getNthLastPathname = (
  url: string,
  number: number,
  desc: string
): string => {
  const { pathname } = new URL(url)
  const parts = pathname.split('/')
  if (parts.length <= number) {
    throw new Error(`invalid input: ${desc} is not defined`)
  }
  const part = parts[parts.length - 1 - number]
  if (part === '') {
    throw new Error(`invalid input: ${desc} is not defined`)
  }
  return part
}
