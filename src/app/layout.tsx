import '~/styles/index.css'

import type { Viewport } from 'next'
import { ToastContainer } from 'react-toastify'

import { HydrationEndDetector } from '~/components/common/HydrationEndDetector'
import { ScrollTop } from '~/components/common/ScrollTop'
import { Root } from '~/components/layout/root/Root'
import { attachUAAndRealIp } from '~/lib/attach-ua'
import { sansFont, serifFont } from '~/lib/fonts'

import { Providers } from '../providers/root'
import { ClientInit } from './ClientInit'
import { init } from './init'
import { InitInClient } from './InitInClient'

init()

export const revalidate = 60

export function generateViewport(): Viewport {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: '#000212' },
      { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    ],
  }
}

export const generateMetadata = async () => {
  const url = {
    webUrl: 'https://innei.in',
    apiUrl: 'https://innei.ren',
  }
  const seo = {
    title: 'Innei',
    description: 'Innei',
    keywords: ['Innei', 'innei', '博客', 'blog', 'nextjs', 'react'],
  }
  const user = {
    username: 'innei',
    name: 'Innei',
    avatar: '',
  }
  return {
    metadataBase: new URL(url.webUrl),
    title: {
      template: `%s - ${seo.title}`,
      default: `${seo.title} - ${seo.description}`,
    },
    description: seo.description,
    keywords: seo.keywords?.join(',') || '',
    icons: [],

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: {
        default: seo.title,
        template: `%s | ${seo.title}`,
      },
      description: seo.description,
      siteName: `${seo.title}`,
      locale: 'zh_CN',
      type: 'website',
      url: url.webUrl,
      images: {
        url: user.avatar,
        username: user.name,
      },
    },
    twitter: {
      creator: `@${user.username}`,
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await attachUAAndRealIp()

  return (
    <>
      <ClientInit />
      <html lang="zh-CN" suppressHydrationWarning>
        <head>
          <HydrationEndDetector />
        </head>
        <body
          className={`${sansFont.variable} ${serifFont.variable} m-0 h-full p-0 font-sans`}
        >
          <Providers>
            <div data-theme>
              <Root>{children}</Root>
            </div>
          </Providers>
          <ToastContainer />
          <ScrollTop />
          <InitInClient />
        </body>
      </html>
    </>
  )
}
