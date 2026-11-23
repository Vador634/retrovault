import { Link } from 'react-router-dom'
import { EmptyState } from '../components/States'

export default function NotFound() {
  return (
    <EmptyState title="GAME OVER">
      Cette page n'existe pas.{' '}
      <Link to="/" className="text-accent underline">
        Continuer ?
      </Link>
    </EmptyState>
  )
}
