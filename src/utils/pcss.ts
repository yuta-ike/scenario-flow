// ref: https://qiita.com/lookman/items/efae7683703b62ebfe9d
const colorMap = new Map([
  [
    "V",
    [
      "#D40045",
      "#EE0026",
      "#FD1A1C",
      "#FE4118",
      "#FF590B",
      "#FF7F00",
      "#FFCC00",
      "#CFBB03",
      "#CCE700",
      "#99CF15",
      "#66B82B",
      "#33A23D",
      "#008F62",
      "#008678",
      "#007A87",
      "#055D87",
      "#093F86",
      "#0F218B",
      "#1D1A88",
      "#281285",
      "#340C81",
      "#56007D",
      "#770071",
      "#AF0065",
    ],
  ],
  [
    "b",
    [
      "#ED3B6B",
      "#FA344D",
      "#FC3633",
      "#FC4E33",
      "#FF6E2B",
      "#FF9913",
      "#FFCB1F",
      "#FFF231",
      "#CDE52F",
      "#99D02C",
      "#55A73B",
      "#32A65D",
      "#2DA380",
      "#1AA28E",
      "#1FB3B3",
      "#1C86AE",
      "#2B78B0",
      "#396BB0",
      "#5468AD",
      "#6A64AE",
      "#8561AB",
      "#A459AB",
      "#C75BB1",
      "#DF4C93",
    ],
  ],
  [
    "s",
    [
      "#B01040",
      "#CA1028",
      "#CC2211",
      "#CC4613",
      "#D45F10",
      "#D97610",
      "#D19711",
      "#CCB914",
      "#B3B514",
      "#8CA114",
      "#41941E",
      "#28853F",
      "#287A52",
      "#297364",
      "#26707B",
      "#205B85",
      "#224A87",
      "#243B8B",
      "#241F86",
      "#3D1C84",
      "#4E2283",
      "#5F2883",
      "#8C1D84",
      "#9A0F50",
    ],
  ],
  [
    "dp",
    [
      "#870042",
      "#9D002B",
      "#A20715",
      "#A51200",
      "#A42F03",
      "#A24A02",
      "#A46603",
      "#A48204",
      "#949110",
      "#518517",
      "#307A25",
      "#306F42",
      "#186A53",
      "#025865",
      "#034F69",
      "#04436E",
      "#05426F",
      "#073E74",
      "#152A6B",
      "#232266",
      "#3F1B63",
      "#531560",
      "#690C5C",
      "#75004F",
    ],
  ],
  [
    "lt",
    [
      "#EE7296",
      "#FB7482",
      "#FA7272",
      "#FB8071",
      "#FA996F",
      "#FDB56D",
      "#FCD474",
      "#FEF27A",
      "#DDED71",
      "#B3DE6A",
      "#9AD47F",
      "#7FC97E",
      "#72C591",
      "#66C1AF",
      "#66C4C4",
      "#67B1CA",
      "#67A9C9",
      "#689ECA",
      "#7288C2",
      "#817DBA",
      "#9678B8",
      "#B173B6",
      "#C972B6",
      "#E170A4",
    ],
  ],
  [
    "sf",
    [
      "#BD576F",
      "#C95F6B",
      "#CF5E5A",
      "#D77957",
      "#D6763A",
      "#D89048",
      "#D29F34",
      "#CCBA4C",
      "#C0B647",
      "#B3B140",
      "#79B055",
      "#66AC78",
      "#5BA37E",
      "#4E9B87",
      "#4E9995",
      "#4F8B96",
      "#4E7592",
      "#516691",
      "#535A90",
      "#5C5791",
      "#77568F",
      "#8B5587",
      "#9E5485",
      "#B05076",
    ],
  ],
  [
    "d",
    [
      "#8C355F",
      "#994052",
      "#A6424C",
      "#B24443",
      "#B34D3E",
      "#B25939",
      "#A66E3D",
      "#997F42",
      "#8C8946",
      "#757E47",
      "#678049",
      "#5A814C",
      "#39764D",
      "#2A6A69",
      "#256B75",
      "#1D6283",
      "#204F79",
      "#214275",
      "#2E3A76",
      "#39367B",
      "#493278",
      "#5F3179",
      "#772D7A",
      "#802A69",
    ],
  ],
  [
    "dk",
    [
      "#632534",
      "#632A31",
      "#6B2B29",
      "#743526",
      "#6E3D1F",
      "#6B4919",
      "#695018",
      "#6A5B18",
      "#6E6E26",
      "#56561A",
      "#506B3E",
      "#355935",
      "#28523A",
      "#1E4B44",
      "#154D4E",
      "#0E4250",
      "#123B4F",
      "#163450",
      "#222A4E",
      "#312C4C",
      "#3E2E49",
      "#4A304B",
      "#57304B",
      "#643142",
    ],
  ],
  [
    "p",
    [
      "#EEAFCE",
      "#FBB4C4",
      "#FAB6B5",
      "#FDCDB7",
      "#FBD8B0",
      "#FEE6AA",
      "#FCF1AF",
      "#FEFFB3",
      "#EEFAB2",
      "#E6F5B0",
      "#D9F6C0",
      "#CCEAC4",
      "#C0EBCD",
      "#B3E2D8",
      "#B4DDDF",
      "#B4D7DD",
      "#B5D2E0",
      "#B3CEE3",
      "#B4C2DD",
      "#B2B6D9",
      "#BCB2D5",
      "#CAB2D6",
      "#DAAFDC",
      "#E4ADD5",
    ],
  ],
  [
    "ltg",
    [
      "#C99FB3",
      "#D7A4B5",
      "#D6A9A4",
      "#D7AFA7",
      "#D9B59F",
      "#D8BA96",
      "#D9C098",
      "#D9C69B",
      "#C5CB9B",
      "#AAC09A",
      "#A0BD9E",
      "#9EBCA4",
      "#99BAA7",
      "#92B8AD",
      "#91B8B7",
      "#91AFBA",
      "#92A9B9",
      "#91A4B5",
      "#9199B0",
      "#9191AD",
      "#9C93AE",
      "#A997B1",
      "#B89AB6",
      "#C09FB4",
    ],
  ],
  [
    "g",
    [
      "#6B455A",
      "#7D4F5A",
      "#7C575E",
      "#7D5F61",
      "#7E6261",
      "#7C6764",
      "#7C6A5E",
      "#7E6F5A",
      "#72755A",
      "#636F5B",
      "#586E57",
      "#476C5B",
      "#416863",
      "#395B64",
      "#38555D",
      "#384E5C",
      "#38475A",
      "#394158",
      "#353654",
      "#3F3051",
      "#463353",
      "#4A3753",
      "#553857",
      "#5B3A55",
    ],
  ],
  [
    "dkg",
    [
      "#3C2D30",
      "#3A2B2E",
      "#3B2B2C",
      "#3A2C2B",
      "#40322F",
      "#463B35",
      "#453B31",
      "#47402C",
      "#42412F",
      "#3E3F31",
      "#2C382A",
      "#24332C",
      "#23342E",
      "#253532",
      "#253535",
      "#283639",
      "#232C33",
      "#212832",
      "#242331",
      "#282530",
      "#2A2730",
      "#2D2A31",
      "#362C34",
      "#392D31",
    ],
  ],
] as const)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const colors = colorMap.get("V")!
const sectionedColor: string[][] = []
for (let i = 0; i < colors.length; i++) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  sectionedColor[i % 4] =
    sectionedColor[i % 4] == null
      ? [colors[i]]
      : // @ts-expect-error
        [colors[i], ...sectionedColor[i % 4]]
}

export const COLORS = sectionedColor.flat()
