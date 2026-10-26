import { describe, expect, it } from 'vitest'
import { plataforma } from './instalar'

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  androidWebView: 'Mozilla/5.0 (Linux; Android 14; SM-A515F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36',
  ipadNovo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
}

describe('plataforma para instalar', () => {
  it('identifica iPhone no Safari e em outro navegador', () => {
    expect(plataforma(UA.iphoneSafari)).toBe('iphone-safari')
    expect(plataforma(UA.iphoneChrome)).toBe('iphone-outro')
  })

  it('identifica navegador interno de app (Instagram, WhatsApp, WebView)', () => {
    expect(plataforma(UA.iphoneInstagram)).toBe('app-interno')
    expect(plataforma(UA.androidWebView)).toBe('app-interno')
  })

  it('identifica Android, iPad novo e computador', () => {
    expect(plataforma(UA.android)).toBe('android')
    expect(plataforma(UA.ipadNovo, 5)).toBe('iphone-safari')
    expect(plataforma(UA.mac)).toBe('computador')
  })
})
