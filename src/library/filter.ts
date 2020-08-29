import { Tag } from '../entity/manga_detail';

class MatchPattern {
  readonly key: string;
  readonly value: string;
  readonly isExclusionMode: boolean;
  readonly isExactMode: boolean;

  constructor(token: string) {
    this.isExclusionMode = token.startsWith('-');
    if (this.isExclusionMode) token = token.substring(1);

    this.isExactMode = token.endsWith('$');
    if (this.isExactMode) token = token.substring(0, token.length - 1);

    const splitPosition = token.indexOf(':');
    if (splitPosition !== -1) {
      this.key = token.substring(0, splitPosition);
      this.value = token.substring(splitPosition + 1, token.length);
    } else {
      this.key = '';
      this.value = token;
    }
  }

  private isKeyEmpty() {
    return this.key === '';
  }

  private isKeyMatch(key: string) {
    return this.isKeyEmpty() || this.key === key;
  }

  private isIvsMatched(ivs: string[]) {
    return this.isExactMode
      ? ivs.indexOf(this.value) != -1
      : ivs.find((iv) => iv.includes(this.value)) != undefined;
  }

  isPassed(entry: MatchEntry) {
    let interestedValues: string[] = [];

    if (this.isKeyEmpty()) {
      interestedValues.push(entry.title);
      if (entry.authors !== undefined) interestedValues.push(...entry.authors);
    }

    entry.tags.forEach((tag) => {
      if (this.isKeyMatch(tag.key)) interestedValues.push(...tag.value);
    });

    return this.isIvsMatched(interestedValues) !== this.isExclusionMode;
  }
}

export interface MatchEntry {
  title: string;
  authors?: string[];
  tags: Tag[];
}

export class Filter {
  patterns: MatchPattern[] = [];

  constructor(keywords: string) {
    keywords.split(';').forEach((token) => {
      token = token.trim();
      if (token.length > 0) this.patterns.push(new MatchPattern(token));
    });
  }

  check(entry: MatchEntry) {
    for (const pattern of this.patterns) {
      if (!pattern.isPassed(entry)) return false;
    }
    return true;
  }
}
