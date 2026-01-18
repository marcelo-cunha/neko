<template>
  <div class="neko-emoji" v-on-clickaway="onClickAway">
    <div class="tabs">
      <button :class="{ active: activeTab === 'emoji' }" @click="activeTab = 'emoji'">Emoji</button>
      <button :class="{ active: activeTab === '7tv' }" @click="activeTab = '7tv'">7TV</button>
    </div>
    <div class="search">
      <div class="search-contianer">
        <input type="text" ref="search" v-model="search" />
      </div>
    </div>
    <!-- Emoji Tab -->
    <template v-if="activeTab === 'emoji'">
      <div class="list" ref="scroll" @scroll="onScroll">
        <ul :class="['group-list']" :style="{ display: search === '' ? 'flex' : 'none' }">
          <li v-for="(group, index) in groups" :key="index" class="group" ref="groups">
            <span class="label">{{ group.name }}</span>
            <ul class="emoji-list">
              <li
                v-for="emoji in index === 0 ? recent : group.list"
                :key="`${group.id}-${emoji}`"
                :class="['emoji-container', hovered === emoji ? 'active' : '']"
              >
                <span
                  :class="['emoji']"
                  @mouseenter.stop.prevent="onMouseEnter($event, emoji)"
                  @click.stop.prevent="onClick($event, emoji)"
                  :data-emoji="emoji"
                ></span>
              </li>
            </ul>
          </li>
        </ul>
        <ul :class="['emoji-container']" :style="{ display: search === '' ? 'none' : 'flex' }">
          <li v-for="emoji in filtered" :key="emoji" :class="['emoji-item', hovered === emoji ? 'active' : '']">
            <span
              :class="['emoji']"
              @mouseenter.stop.prevent="onMouseEnter($event, emoji)"
              @click.stop.prevent="onClick($event, emoji)"
              :data-emoji="emoji"
            ></span>
          </li>
        </ul>
      </div>
      <div class="details">
        <div class="details-container" v-if="hovered !== ''">
          <span :class="['emoji']" :data-emoji="hovered" /><span class="emoji-id">:{{ hovered }}:</span>
        </div>
      </div>
      <div class="groups">
        <ul>
          <li
            v-for="(group, index) in groups"
            :key="index"
            :class="[group.id, active.id === group.id && search === '' ? 'active' : '']"
            @click.stop.prevent="scrollTo($event, index)"
          >
            <span :class="[`group-${group.id} fas`]" />
          </li>
        </ul>
      </div>
    </template>
    <!-- 7TV Tab -->
    <template v-if="activeTab === '7tv'">
      <div class="list seventv-list" ref="seventvScroll" @scroll="onSevenTVScroll">
        <!-- Recentes -->
        <div v-show="recentSevenTV.length > 0 && search === ''" class="seventv-group">
          <span class="label">Recent</span>
          <ul class="seventv-emote-list">
            <li
              v-for="emote in recentSevenTV"
              :key="'recent-' + emote.name"
              :class="['seventv-emote-container', hoveredSevenTV === emote.name ? 'active' : '']"
              @mouseenter.stop.prevent="onSevenTVMouseEnter($event, emote)"
              @click.stop.prevent="onSevenTVClick($event, emote)"
            >
              <img :src="emote.url" :alt="emote.name" :title="emote.name" loading="lazy" />
            </li>
          </ul>
        </div>
        <!-- Todos os emotes -->
        <div class="seventv-group">
          <span class="label" v-show="search === ''">All Emotes</span>
          <ul class="seventv-emote-list">
            <li
              v-for="(emote, idx) in seventvEmotes"
              :key="emote.name"
              v-show="isSevenTVEmoteVisible(emote, idx)"
              :class="['seventv-emote-container', hoveredSevenTV === emote.name ? 'active' : '']"
              @mouseenter.stop.prevent="onSevenTVMouseEnter($event, emote)"
              @click.stop.prevent="onSevenTVClick($event, emote)"
            >
              <img v-if="idx < seventvLoadedCount" :src="emote.url" :alt="emote.name" :title="emote.name" loading="lazy" />
            </li>
          </ul>
          <div v-if="search === '' && seventvLoadedCount < seventvEmotes.length" class="load-more">
            Loading more...
          </div>
        </div>
      </div>
      <div class="details">
        <div class="details-container" v-if="hoveredSevenTV !== ''">
          <img :src="hoveredSevenTVUrl" class="seventv-preview" /><span class="emoji-id">{{ hoveredSevenTV }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  $emoji-width: 300px;

  .neko-emoji {
    position: absolute;
    z-index: 10000;
    width: $emoji-width;
    height: 350px;
    background: $background-secondary;
    bottom: 75px;
    right: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: $elevation-high;

    .tabs {
      display: flex;
      flex-shrink: 0;
      border-bottom: 1px solid $background-tertiary;

      button {
        flex: 1;
        padding: 8px;
        background: transparent;
        border: none;
        color: $text-muted;
        cursor: pointer;
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
        transition: all 0.2s;

        &:hover {
          background: $background-tertiary;
        }

        &.active {
          color: $text-normal;
          border-bottom: 2px solid $style-primary;
        }
      }
    }

    .search {
      flex-shrink: 0;
      border-bottom: 1px solid $background-tertiary;
      padding: 10px;

      .search-contianer {
        border-radius: 5px;
        color: $interactive-normal;
        position: relative;
        display: flex;
        flex-direction: column;
        align-content: center;
        overflow: hidden;

        &::before {
          content: '\f002';
          font-weight: 900;
          font-family: 'Font Awesome 6 Free';
          position: absolute;
          width: 15px;
          height: 15px;
          top: 6px;
          right: 6px;
          opacity: 0.5;
        }

        input {
          border: none;
          background-color: $background-floating;
          color: $interactive-normal;
          padding: 5px;
          font-weight: 500;

          &::placeholder {
            color: $text-muted;
            font-weight: 500;
          }
        }
      }
    }

    .list {
      position: relative;
      flex-grow: 1;
      overflow-y: scroll;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: $background-tertiary transparent;
      scroll-behavior: smooth;
      padding: 5px;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $background-tertiary;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: $background-floating;
      }

      .group-list {
        width: $emoji-width;
        display: flex;
        flex-direction: column;

        li {
          &.group {
            .label {
              z-index: 2;
              text-transform: uppercase;
              font-weight: 500;
              font-size: 12px;
              position: sticky;
              top: -5px;
              background-color: rgba($color: $background-secondary, $alpha: 0.9);
              width: 100%;
              display: block;
              padding: 8px 0;
            }
          }
        }
      }

      .emoji-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        li {
          &.emoji-container {
            padding: 2px;
            border-radius: 3px;
            cursor: pointer;

            &.active {
              background-color: $background-floating;
            }
          }
        }
      }

      &.seventv-list {
        .seventv-group {
          margin-bottom: 10px;

          .label {
            z-index: 2;
            text-transform: uppercase;
            font-weight: 500;
            font-size: 12px;
            position: sticky;
            top: -5px;
            background-color: rgba($color: $background-secondary, $alpha: 0.9);
            width: 100%;
            display: block;
            padding: 8px 0;
          }
        }

        .seventv-emote-list {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 4px;

          .seventv-emote-container {
            padding: 4px;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;

            &.active {
              background-color: $background-floating;
            }

            img {
              height: 28px;
              width: auto;
              max-width: 56px;
              object-fit: contain;
            }
          }
        }

        .load-more {
          text-align: center;
          padding: 10px;
          color: $text-muted;
          font-size: 12px;
        }
      }
    }

    .details {
      flex-shrink: 0;
      display: flex;
      align-content: center;
      justify-content: center;
      flex-direction: column;
      height: 36px;
      background: $background-tertiary;

      .details-container {
        display: flex;
        align-content: center;
        flex-direction: row;
        height: 20px;

        span {
          cursor: default;

          &.emoji {
            margin: 0 5px 0 10px;
          }

          &.emoji-id {
            line-height: 20px;
            font-size: 16px;
            font-weight: 500;
          }
        }

        .seventv-preview {
          height: 20px;
          width: auto;
          margin: 0 5px 0 10px;
        }
      }
    }

    .groups {
      flex-shrink: 0;
      height: 30px;
      background: $background-floating;
      padding: 0 5px;

      ul {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        li {
          flex-grow: 1;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          flex-direction: column;
          height: 27px;
          cursor: pointer;

          &.active {
            border-bottom: 3px solid $style-primary;
          }

          span {
            margin: 0 auto;
            height: 20px;
            width: 20px;
            font-size: 16px;
            line-height: 20px;
            text-align: center;

            &.group-recent::before {
              content: '\f017';
            }
            &.group-neko::before {
              content: '\f6be';
            }
            &.group-emotion::before {
              content: '\f118';
            }
            &.group-people::before {
              content: '\f0c0';
            }
            &.group-nature::before {
              content: '\f1b0';
            }
            &.group-food::before {
              content: '\f5d1';
            }
            &.group-activity::before {
              content: '\f44e';
            }
            &.group-travel::before {
              content: '\f1b9';
            }
            &.group-objects::before {
              content: '\f0eb';
            }
            &.group-symbols::before {
              content: '\f86d';
            }
            &.group-flags::before {
              content: '\f024';
            }
          }
        }
      }
    }
  }
</style>

<script lang="ts">
  import { Component, Ref, Vue } from 'vue-property-decorator'
  import { directive as onClickaway } from 'vue-clickaway'
  import { get, set } from '../utils/localstorage'
  import { SevenTVEmote } from '../utils/emotes'

  @Component({
    name: 'neko-emoji',
    directives: {
      onClickaway,
    },
  })
  export default class extends Vue {
    @Ref('scroll') readonly _scroll!: HTMLElement
    @Ref('search') readonly _search!: HTMLInputElement
    @Ref('groups') readonly _groups!: HTMLElement[]
    @Ref('seventvScroll') readonly _seventvScroll!: HTMLElement

    waitingForPaint = false
    search = ''
    index = 0
    hovered = ''
    recent: string[] = JSON.parse(get('emoji_recent', '[]'))
    recentSevenTV: SevenTVEmote[] = JSON.parse(get('seventv_recent', '[]'))
    activeTab: 'emoji' | '7tv' = '7tv'
    hoveredSevenTV = ''
    hoveredSevenTVUrl = ''
    seventvLoadedCount = 50 // Começa carregando 50 emotes
    seventvSearchCache: { [key: string]: boolean } = {} // Cache para busca

    get active() {
      return this.$accessor.emoji.groups[this.index]
    }

    get keywords() {
      return this.$accessor.emoji.keywords
    }

    get groups() {
      return this.$accessor.emoji.groups
    }

    get list() {
      return this.$accessor.emoji.list
    }

    get seventvEmotes() {
      return this.$accessor.emoji.seventv
    }

    // Verifica se o emote deve estar visível (baseado na busca)
    isSevenTVEmoteVisible(emote: SevenTVEmote, idx: number): boolean {
      if (this.search === '') {
        return idx < this.seventvLoadedCount
      }
      const searchLower = this.search.toLowerCase()
      return emote.name.toLowerCase().includes(searchLower)
    }

    // Carrega mais emotes conforme scroll
    onSevenTVScroll() {
      if (!this._seventvScroll || this.search !== '') return
      
      const { scrollTop, scrollHeight, clientHeight } = this._seventvScroll
      // Se está perto do final (100px), carrega mais
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (this.seventvLoadedCount < this.seventvEmotes.length) {
          this.seventvLoadedCount = Math.min(
            this.seventvLoadedCount + 50,
            this.seventvEmotes.length
          )
        }
      }
    }

    get filtered() {
      const filtered = []
      for (const emoji of this.list) {
        if (
          emoji.includes(this.search) || typeof this.keywords[emoji] !== 'undefined'
            ? this.keywords[emoji].some((keyword) => keyword.includes(this.search))
            : false
        ) {
          filtered.push(emoji)
        }
      }
      return filtered
    }

    scrollTo(event: MouseEvent, index: number) {
      if (!this._groups[index]) {
        return
      }
      this._scroll.scrollTop = index == 0 ? 0 : this._groups[index].offsetTop
    }

    onScroll() {
      if (!this.waitingForPaint) {
        this.waitingForPaint = true
        window.requestAnimationFrame(this.onScrollPaint.bind(this))
      }
    }

    onScrollPaint() {
      this.waitingForPaint = false
      let scrollTop = this._scroll.scrollTop
      let active = 0
      for (const [i] of this.groups.entries()) {
        let component = this._groups[i]
        if (component && component.offsetTop > scrollTop) {
          break
        }
        active = i
      }
      if (this.index !== active) {
        this.index = active
      }
    }

    onMouseExit() {
      this.hovered = ''
    }

    onMouseEnter(event: MouseEvent, emoji: string) {
      this.hovered = emoji
      this._search.placeholder = `:${emoji}:`
    }

    onClick(event: MouseEvent, emoji: string) {
      this.$accessor.emoji.setRecent(emoji)
      this.$emit('picked', emoji)
    }

    onSevenTVMouseEnter(event: MouseEvent, emote: SevenTVEmote) {
      this.hoveredSevenTV = emote.name
      this.hoveredSevenTVUrl = emote.url
      this._search.placeholder = emote.name
    }

    onSevenTVClick(event: MouseEvent, emote: SevenTVEmote) {
      // Adicionar aos recentes do 7TV
      const existingIndex = this.recentSevenTV.findIndex(e => e.name === emote.name)
      if (existingIndex !== -1) {
        this.recentSevenTV.splice(existingIndex, 1)
      }
      this.recentSevenTV.unshift(emote)
      if (this.recentSevenTV.length > 30) {
        this.recentSevenTV.pop()
      }
      set('seventv_recent', JSON.stringify(this.recentSevenTV))
      // Limpar hover ao selecionar
      this.hoveredSevenTV = ''
      this.hoveredSevenTVUrl = ''
      this.$emit('picked-seventv', emote.name)
    }

    onClickAway() {
      this.$emit('done')
    }
  }
</script>
