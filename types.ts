export enum FormatMode {
  BASIC = 'BASIC',
  SMART_AI = 'SMART_AI'
}

export interface FormatStats {
  originalLength: number;
  formattedLength: number;
  sentencesCount: number;
}

export interface TextRange {
  start: number;
  end: number;
}

export interface SyncState {
  inputRange: TextRange | null;
  outputRange: TextRange | null;
}
