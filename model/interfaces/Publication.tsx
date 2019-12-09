import {Image} from "./Image";
import {Profile} from "./Profile";

export interface Institution {
    name: string,
    abbreviation?: string,
    link?: string,
    email?: string,
    icon?: Image
}

export interface Author {
    name: string,
    abbreviation?: string,
    email?: string,
    institution?: Institution,
    link?: string,
    avatar?: Image,
    profiles?: Profile[]
}

export interface Event {
    name: string,
    abbreviation?: string,
    link?: string,
    icon?: Image,
}

export interface Magazine {
    name: string,
    abbreviation?: string,
    link?: string,
    icon?: Image,
}

export interface Publication {
    relevance?: number
    title:  string,
    summary: string,
    authors: Author[],
    releaseDate: Date,
    event?: Event,
    magazine?: Magazine,
    keywords?: string[],
    thumbnail?: Image,
    link?: string,
}