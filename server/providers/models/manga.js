class MangaOutline {
  id;
  title;
  thumb;
  author;
  update;
}

class Chapter {
  id;
  title;
}

class MangaDetail {
  id;
  title;
  thumb;
  tags = {};
  collections = {};

  add_tag(key, value) {
    if (!(key in this.tags)) this.tags[key] = [];
    this.tags[key].push(value);
  }

  add_chapter(collection, chapter) {
    if (!(collection in this.collections)) this.collections[collection] = [];
    this.collections[collection].push(chapter);
  }
}

export { MangaOutline, MangaDetail, Chapter };
