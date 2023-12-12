import axios from 'axios'

import { API_URL } from '~/constants/env'

import PKG from '../../package.json'
import { getToken } from './cookie'
import { isClientSide, isDev, isServerSide } from './env'

const uuidStorageKey = 'x-uuid'
const genUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const uuid = genUUID()

if (isClientSide) {
  if (!sessionStorage.getItem(uuidStorageKey))
    sessionStorage.setItem(uuidStorageKey, uuid)
}

export const $axios = axios.create({
  baseURL: API_URL,
})

$axios.defaults.timeout = 8000

if (typeof window === 'undefined')
  $axios.defaults.headers.common['User-Agent'] =
    `NextJS/v${PKG.dependencies.next} ${PKG.name}/${PKG.version}`

$axios.interceptors.request.use((config) => {
  const token = getToken()
  if (config.headers) {
    if (token) {
      config.headers['Authorization'] = `bearer ${token}`
    }
    config.headers['x-session-uuid'] =
      globalThis?.sessionStorage?.getItem(uuidStorageKey) ?? uuid
  }

  if (isDev && isServerSide) {
    console.log(`[Request]: ${config.url}`)
  }

  return config
})
