export type DocsLang = 'en' | 'fr';

export interface DocItem {
  readonly label: string;
  readonly slug: string;
}

export interface DocSection {
  readonly label: string;
  readonly items: readonly DocItem[];
}

export interface DocVersion {
  readonly slug: string;
  readonly label: string;
}
