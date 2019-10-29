import {Profile} from "./Profile";
import {Image} from "./Image";

export interface Show {
    name:  string,
    fullName: string,
    label: string,
    picture: Image,
    email: string,
    phone: string,
    website: string,
    summary: string,
    location: string,
    profiles: Profile[]
}