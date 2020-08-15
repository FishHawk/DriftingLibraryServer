import { Status } from "./manga_status";

export interface MangaOutline {
  id: string;
  title: string;
  thumb: string | undefined;

  status: Status | undefined;
  authors: string[] | undefined;
  updateTime: number | undefined;
}
