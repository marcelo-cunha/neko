import TwitchEmoticons from '@mkody/twitch-emoticons'
const { EmoteFetcher, EmoteParser } = TwitchEmoticons

class EmoteService {
  private fetcher: InstanceType<typeof EmoteFetcher>
  private parser: InstanceType<typeof EmoteParser> | null = null
  private initialized = false
  private initializing = false

  constructor() {
    // Não precisa de credenciais do Twitch para usar apenas 7TV
    this.fetcher = new EmoteFetcher()
  }

  async init(): Promise<void> {
    if (this.initialized || this.initializing) return

    this.initializing = true

    try {
      // Buscar apenas emotes globais do 7TV
      await this.fetcher.fetchSevenTVEmotes(58115154)

      // Criar o parser com template HTML customizado
      // Match: qualquer palavra (sem :colons:)
      this.parser = new EmoteParser(this.fetcher, {
        template: '<img class="seventv-emote" alt="{name}" title="{name}" src="{link}">',
        match: /(\w{2,})/g,
      })

      this.initialized = true
      console.log('[7TV] Emotes carregados:', this.fetcher.emotes.size)
    } catch (error) {
      console.error('[7TV] Erro ao carregar emotes:', error)
    } finally {
      this.initializing = false
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
}

// Singleton
export const emoteService = new EmoteService()
