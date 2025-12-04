import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/editor/$id"!</div>
}
