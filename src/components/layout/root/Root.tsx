import { ClientOnly } from '~/components/common/ClientOnly'
import { ThemeSwitcher } from '~/components/ui/theme-switcher'

import { Content } from '../content/Content'

export const Root: Component = ({ children }) => {
  return (
    <>
      <header />
      <Content>{children}</Content>

      <footer className="flex justify-end p-5">
        <ThemeSwitcher />
      </footer>
      <ClientOnly>{/* TODO */}</ClientOnly>
    </>
  )
}
