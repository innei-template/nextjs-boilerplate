import './plugins/css-plugin'

import { addDynamicIconSelectors } from '@iconify/tailwind'
import { nextui } from '@nextui-org/theme'
import radxiColors from '@radix-ui/colors'
import typography from '@tailwindcss/typography'
import { withTV } from 'tailwind-variants/transformer'
import type { Config } from 'tailwindcss'
import { createPlugin } from 'windy-radix-palette'

const twConfig: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  safelist: [],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans),system-ui,-apple-system,PingFang SC,"Microsoft YaHei",Segoe UI,Roboto,Helvetica,noto sans sc,hiragino sans gb,"sans-serif",Apple Color Emoji,Segoe UI Emoji,Not Color Emoji',
        serif:
          '"Noto Serif CJK SC","Noto Serif SC",var(--font-serif),"Source Han Serif SC","Source Han Serif",source-han-serif-sc,SongTi SC,SimSum,"Hiragino Sans GB",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,"Microsoft YaHei","WenQuanYi Micro Hei",sans-serif',
        mono: `"OperatorMonoSSmLig Nerd Font","Cascadia Code PL","FantasqueSansMono Nerd Font","operator mono",JetBrainsMono,"Fira code Retina","Fira code","Consolas", Monaco, "Hannotate SC", monospace, -apple-system`,
      },
      screens: {
        'light-mode': { raw: '(prefers-color-scheme: light)' },
        'dark-mode': { raw: '(prefers-color-scheme: dark)' },

        'w-screen': '100vw',
        'h-screen': '100vh',
      },
      maxWidth: {
        screen: '100vw',
      },
      width: {
        screen: '100vw',
      },
      height: {
        screen: '100vh',
      },
      maxHeight: {
        screen: '100vh',
      },

      colors: {},
    },
  },

  plugins: [
    addDynamicIconSelectors(),

    typography,

    require('tailwind-scrollbar'),
    createPlugin({
      colors: radxiColors,
    }).plugin,
    nextui({
      prefix: 'next',
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: '#111827',

              foreground: '#000',
              '50': '#3f5a92',
              '100': '#364c7c',
              '200': '#2d3f67',
              '300': '#243252',
              '400': '#1a253c',
              '500': '#111827',
              '600': '#080b12',
              '700': '#000000',
              '800': '#000000',
              '900': '#000000',
            },
          },
        },
      },
      layout: {
        borderWidth: {
          small: '1px', // border-small
          medium: '1px', // border-medium (default)
          large: '2px', // border-large
        },
        radius: {
          small: '6px', // rounded-small
          medium: '6px', // rounded-medium
          large: '6px', // rounded-large
        },
      },
    }),
    require('./layer.css'),
  ],
}

export default withTV(twConfig)
