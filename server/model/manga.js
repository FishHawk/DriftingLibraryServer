const MangaStatus = Object.freeze({
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  UNKNOWN: 'unknown',

  parse(x) {
    if (x === this.COMPLETED || x === this.ONGOING || x === this.UNKNOWN)
      return x;
    else return null;
  },
});


class Chapter {
  id;
  name;
  title;

  constructor(chapter) {
    Object.assign(this, chapter);
  }
}

class Tag {
  key;
  value = [];

  constructor(tag) {
    Object.assign(this, tag);
  }
}

class Collection {
  title;
  chapters;

  constructor(collection) {
    Object.assign(this, collection);
  }
}

class MangaOutline {
  id;
  title;
  thumb;
  author;
  status;
  update;

  constructor(outline) {
    Object.assign(this, outline);
  }
}

class MangaDetail {
  source;
  id;
  title;
  thumb;
  author;
  status;
  update;

  description;

  tags = [];
  collections = [];

  constructor(outline) {
    Object.assign(this, outline);
  }
}

export { MangaStatus, MangaOutline, MangaDetail, Tag, Collection, Chapter };
