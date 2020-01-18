export interface Data {
  slideshow?: Slideshow;
}

export interface Slideshow {
  author?: string;
  date?: string;
  slides?: Slide[];
  title?: string;
}

export interface Slide {
  title?: string;
  type?: string;
  items?: string[];
}
