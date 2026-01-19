import TwitchEmoticons from '@mkody/twitch-emoticons'
const { EmoteFetcher, EmoteParser } = TwitchEmoticons

export interface SevenTVEmote {
  name: string
  url: string
}

class EmoteService {
  private fetcher: InstanceType<typeof EmoteFetcher>
  private parser: InstanceType<typeof EmoteParser> | null = null
  private initialized = false
  private initializing = false
  private initPromise: Promise<void> | null = null
  private onReadyCallbacks: (() => void)[] = []

  constructor() {
    // Não precisa de credenciais do Twitch para usar apenas 7TV
    this.fetcher = new EmoteFetcher()
  }

  async init(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initializing = true
    this.initPromise = this._doInit()
    return this.initPromise
  }

  private async _doInit(): Promise<void> {
    try {
      // Buscar apenas emotes globais do 7TV
      await this.fetcher.fetchSevenTVEmotes(58115154)

      // Criar o parser com template HTML customizado
      // Match: qualquer sequência de caracteres não-espaço (aceita :3, eu??, etc)
      this.parser = new EmoteParser(this.fetcher, {
        template: '<img class="seventv-emote" alt="{name}" title="{name}" src="{link}">',
        match: /(\S+)/g,
      })

      this.initialized = true
      console.log('[7TV] Emotes carregados:', this.fetcher.emotes.size)
      
      // Notificar callbacks registrados
      this.onReadyCallbacks.forEach(cb => cb())
      this.onReadyCallbacks = []
    } catch (error) {
      console.error('[7TV] Erro ao carregar emotes:', error)
      this.initPromise = null // Permite tentar novamente
    } finally {
      this.initializing = false
    }
  }

  // Registra callback para quando os emotes estiverem prontos
  onReady(callback: () => void): void {
    if (this.initialized) {
      callback()
    } else {
      this.onReadyCallbacks.push(callback)
    }
  }

  parse(text: string): string {
    if (!this.initialized || !this.parser) {
      return text
    }

    try {
      return this.parser.parse(text)
    } catch (error) {
      console.error('[7TV] Erro ao fazer parse:', error)
      return text
    }
  }

  isReady(): boolean {
    return this.initialized
  }

  getEmotes(): SevenTVEmote[] {
    if (!this.initialized) {
      return []
    }

    const emotes: SevenTVEmote[] = []
    this.fetcher.emotes.forEach((emote: any) => {
      // Só pegar emotes do 7TV
      if (emote.type === '7tv') {
        emotes.push({
          name: emote.code,
          url: emote.toLink(),
        })
      }
    })

    return emotes.sort((a, b) => a.name.localeCompare(b.name))
  }
}

// Singleton
export const emoteService = new EmoteService()
