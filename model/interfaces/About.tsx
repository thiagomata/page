import {Profile} from "./Profile";
import {Image} from "./Image";

export interface About {
    name:  string,
    fullName: string,
    label: string,
    picture: Image,
    website: string,
    summary: string,
    email?: string,
    phone?: string,
    location?: string,
    profiles?: Profile[]
}