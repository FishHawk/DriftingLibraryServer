class MangaOutline {
  id;
  title;
  thumb;
  source;
  author;
  update;
}

class Chapter {
  id;
  title;
}

class Tag {
  key;
  value = [];
  constructor(key) {
    this.key = key;
  }
}

class Collection {
  title;
  chapters = [];
  constructor(title) {
    this.title = title;
  }
}

class MangaDetail {
  id;
  title;
  thumb;
  source;
  tags = [];
  collections = [];
}

export { MangaOutline, MangaDetail, Chapter, Collection, Tag };
