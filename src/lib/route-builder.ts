export const enum Routes {
  Home = '',

  PageDeletd = '/common/deleted',
}

type Noop = never
type Pagination = {
  size?: number
  page?: number
}

type WithId = {
  id: string | number
}
type HomeParams = Noop
export type PostsParams = Pagination & {
  sortBy?: string
  orderBy?: 'desc' | 'asc'
}

type PostParams = {
  category: string
  slug: string
}
type NotesParams = Noop
type NoteParams = WithId & {
  password?: string
}
type TimelineParams = {
  type: 'note' | 'post' | 'all'
  selectId?: string
}

type OnlySlug = {
  slug: string
}

type OnlyId = {
  id: string
}
export type RouteParams<T extends Routes> = T extends Routes.Home
  ? HomeParams
  : {}

export function routeBuilder<T extends Routes>(
  route: T,
  params: RouteParams<typeof route>,
) {
  let href: string = route
  switch (route) {
    case Routes.Home: {
      href = '/'
      break
    }
  }
  return href
}
