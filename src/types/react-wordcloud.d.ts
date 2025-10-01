declare module 'react-wordcloud' {
  import { ComponentType } from 'react'

  export interface Word {
    text: string
    value: number
    [key: string]: unknown
  }

  export interface Options {
    colors?: string[]
    enableTooltip?: boolean
    deterministic?: boolean
    fontFamily?: string
    fontSizes?: [number, number]
    fontStyle?: string
    fontWeight?: string | number
    padding?: number
    rotations?: number
    rotationAngles?: [number, number]
    scale?: 'linear' | 'log' | 'sqrt'
    spiral?: 'archimedean' | 'rectangular'
    transitionDuration?: number
    [key: string]: unknown
  }

  export interface Callbacks {
    getWordColor?: (word: Word) => string
    getWordTooltip?: (word: Word) => string
    onWordClick?: (word: Word, event?: MouseEvent) => void
    onWordMouseOut?: (word: Word, event?: MouseEvent) => void
    onWordMouseOver?: (word: Word, event?: MouseEvent) => void
    [key: string]: unknown
  }

  export interface ReactWordcloudProps {
    words: Word[]
    options?: Options
    callbacks?: Callbacks
    maxWords?: number
    minSize?: [number, number]
    size?: [number, number]
  }

  const ReactWordcloud: ComponentType<ReactWordcloudProps>
  export default ReactWordcloud
}
