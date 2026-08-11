import ModernTemplate from './ModernTemplate'
import ClassicTemplate from './ClassicTemplate'
import MinimalTemplate from './MinimalTemplate'
import VertTemplate from './VertTemplate'

export const templates = {
  vert: { label: 'Vert', Component: VertTemplate, defaultAccent: '#86c06a' },
  modern: { label: 'Moderne', Component: ModernTemplate, defaultAccent: '#4f46e5' },
  classic: { label: 'Classique', Component: ClassicTemplate, defaultAccent: '#1e3a5f' },
  minimal: { label: 'Minimal', Component: MinimalTemplate, defaultAccent: '#0d9488' },
}

export const templateKeys = Object.keys(templates)
