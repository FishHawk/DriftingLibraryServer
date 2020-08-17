enum DownloadTaskStatus {
  WAITING = 'waiting',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  ERROR = 'error',
}

const a = DownloadTaskStatus.WAITING;
console.log(a)
console.log(a == 'waiting')
console.log(a === 'waiting')
