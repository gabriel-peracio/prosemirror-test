import { inPxHeight, mmPxHeight } from "./utils";

export enum PageSizeNames {
  A4 = "A4",
}

export enum PageOrientation {
  Portrait = "Portrait",
  Landscape = "Landscape",
}

export const PageSizes: Record<
  PageSizeNames,
  { width: number; height: number }
> = {
  [PageSizeNames.A4]: {
    width: 210 * mmPxHeight,
    height: 297 * mmPxHeight,
  },
};

function parseMargins(margins: marginDef): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  let top = 0,
    right = 0,
    bottom = 0,
    left = 0;

  if (margins) {
    if ("value" in margins) {
      top = right = bottom = left = margins.value;
    } else if ("horizontal" in margins) {
      top = bottom = margins.vertical;
      right = left = margins.horizontal;
    } else {
      top = margins.top;
      right = margins.right;
      bottom = margins.bottom;
      left = margins.left;
    }
  }

  switch (margins?.unit) {
    case "mm":
      top *= mmPxHeight;
      right *= mmPxHeight;
      bottom *= mmPxHeight;
      left *= mmPxHeight;
      break;
    case "in":
      top *= inPxHeight;
      right *= inPxHeight;
      bottom *= inPxHeight;
      left *= inPxHeight;
      break;
  }

  return {
    top,
    right,
    bottom,
    left,
  };
}

type marginDef =
  | undefined
  | ({
      unit: "px" | "mm" | "in";
    } & (
      | { value: number }
      | { horizontal: number; vertical: number }
      | { top: number; right: number; bottom: number; left: number }
    ));

export class Page {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  constructor(
    sizeName: PageSizeNames = PageSizeNames.A4,
    orientation: PageOrientation = PageOrientation.Portrait,
    margins?: marginDef
  ) {
    this.width = PageSizes[sizeName].width;
    this.height = PageSizes[sizeName].height;
    if (orientation === PageOrientation.Landscape) {
      this.width = PageSizes[sizeName].height;
      this.height = PageSizes[sizeName].width;
    }
    const parsedMargins = parseMargins(margins);
    this.margins = parsedMargins;

    this.innerWidth = this.width - this.margins.left - this.margins.right;
    this.innerHeight = this.height - this.margins.top - this.margins.bottom;
  }
  getInnerTop(pageIdx: number) {
    return this.margins.top + pageIdx * this.innerHeight;
  }
  getInnerBottom(pageIdx: number) {
    return this.getInnerTop(pageIdx) + this.innerHeight;
  }
}
