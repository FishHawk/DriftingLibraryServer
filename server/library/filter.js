class MatchPattern {
  key = '';
  value = '';
  isExclusionMode = false;
  isExactMode = false;

  constructor(token) {
    if (token.startsWith('-')) {
      this.isExclusionMode = true;
      token = token.substring(1);
    }
    if (token.endsWith('$')) {
      this.isExactMode = true;
      token = token.substring(0, token.length - 1);
    }
    const splitPosition = token.indexOf(':');
    if (splitPosition != -1) {
      this.key = token.substring(0, splitPosition);
      this.value = token.substring(splitPosition + 1, token.length);
    } else {
      this.value = token;
    }
  }

  isMatched(ivs) {
    return this.isExactMode
      ? ivs.indexOf(this.value) != -1
      : ivs.find((iv) => iv.includes(this.value)) != undefined;
  }

  isPassed(title, tags) {
    let interestedValues = [];

    if (this.key == '') {
      interestedValues.push(title);
    }

    tags.forEach((tag) => {
      if (this.key == '' || this.key == tag.key)
        interestedValues = interestedValues.concat(tag.value);
    });

    return this.isMatched(interestedValues) ^ this.isExclusionMode;
  }

  print() {
    console.log(
      `key:${this.key} `,
      `value:${this.value} `,
      `exa:${this.isExactMode} `,
      `exc:${this.isExclusionMode}`
    );
  }
}

class Filter {
  patterns = [];

  constructor(filterString) {
    filterString.split(';').forEach((token) => {
      if (token.length > 0) this.patterns.push(new MatchPattern(token));
    });
  }

  check(title, tags) {
    for (const index in this.patterns) {
      if (!this.patterns[index].isPassed(title, tags)) return false;
    }
    return true;
  }
}

export default Filter;
