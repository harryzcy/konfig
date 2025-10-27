import { StrictMode } from 'hono/jsx'

export const App = () => {
  return (
    <StrictMode>
      <h1 className="text-3xl font-bold underline">Hello!</h1>
    </StrictMode>
  )
}
