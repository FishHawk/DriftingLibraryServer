const Status = Object.freeze({
  COMPLETED: 0,
  ONGOING: 1,
  UNKNOWN: 2,
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

  constructor(collection) {
    Object.assign(this, collection);
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
  genre;

  tags = [];
  collections = [];

  constructor(outline) {
    Object.assign(this, outline);
  }
}

export { Status, MangaOutline, MangaDetail, Tag, Collection, Chapter };
