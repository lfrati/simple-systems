let nodes_dict = [
  {
    name: "san francisco",
    degree: 4,
    color: "blue",
    coords: [37.774929, -122.419418],
    text_offset: [0, 0]
  },
  {
    name: "chicago",
    degree: 5,
    color: "blue",
    coords: [41.85003, -87.65005],
    text_offset: [0, 0]
  },
  {
    name: "montr\u00e9al",
    degree: 3,
    color: "blue",
    coords: [45.50169, -73.567253],
    text_offset: [0, 0]
  },
  {
    name: "new york city",
    degree: 4,
    color: "blue",
    coords: [40.712776, -74.00597],
    text_offset: [0, 0]
  },
  {
    name: "washington",
    degree: 4,
    color: "blue",
    coords: [38.907192, -77.036873],
    text_offset: [0, 0]
  },
  {
    name: "atlanta",
    degree: 3,
    color: "blue",
    coords: [33.748997, -84.14389],
    text_offset: [0, 0]
  },
  {
    name: "madrid",
    degree: 5,
    color: "blue",
    coords: [40.416775, -3.70379],
    text_offset: [0, 0]
  },
  {
    name: "london",
    degree: 4,
    color: "blue",
    coords: [51.507351, -0.127758],
    text_offset: [0, 0]
  },
  {
    name: "paris",
    degree: 5,
    color: "blue",
    coords: [48.856613, 2.352222],
    text_offset: [0, 0]
  },
  {
    name: "essen",
    degree: 4,
    color: "blue",
    coords: [51.45657, 7.01228],
    text_offset: [0, 0]
  },
  {
    name: "milan",
    degree: 3,
    color: "blue",
    coords: [45.464203, 9.189982],
    text_offset: [0, 0]
  },
  {
    name: "st. petersburg",
    degree: 3,
    color: "blue",
    coords: [59.93848, 30.312481],
    text_offset: [0, 0]
  },
  {
    name: "algiers",
    degree: 4,
    color: "black",
    coords: [36.73225, 3.08746],
    text_offset: [0, 0]
  },
  {
    name: "istanbul",
    degree: 6,
    color: "black",
    coords: [41.01384, 28.94966],
    text_offset: [0, 0]
  },
  {
    name: "moscow",
    degree: 3,
    color: "black",
    coords: [55.755825, 37.617298],
    text_offset: [0, 0]
  },
  {
    name: "cairo",
    degree: 5,
    color: "black",
    coords: [30.04442, 31.235712],
    text_offset: [0, 0]
  },
  {
    name: "baghdad",
    degree: 5,
    color: "black",
    coords: [33.34058, 44.40088],
    text_offset: [0, 0]
  },
  {
    name: "tehran",
    degree: 4,
    color: "black",
    coords: [35.69439, 51.42151],
    text_offset: [0, 0]
  },
  {
    name: "delhi",
    degree: 5,
    color: "black",
    coords: [28.70406, 77.102493],
    text_offset: [0, 0]
  },
  {
    name: "karachi",
    degree: 5,
    color: "black",
    coords: [24.8608, 67.0104],
    text_offset: [0, 0]
  },
  {
    name: "riyadh",
    degree: 3,
    color: "black",
    coords: [24.68773, 46.72185],
    text_offset: [0, 0]
  },
  {
    name: "mumbai",
    degree: 3,
    color: "black",
    coords: [19.07283, 72.88261],
    text_offset: [0, 0]
  },
  {
    name: "chennai",
    degree: 5,
    color: "black",
    coords: [13.08784, 80.27847],
    text_offset: [0, 0]
  },
  {
    name: "kolkata",
    degree: 4,
    color: "black",
    coords: [22.56263, 88.36304],
    text_offset: [0, 0]
  },
  {
    name: "beijing",
    degree: 2,
    color: "red",
    coords: [39.9075, 116.39723],
    text_offset: [0, 0]
  },
  {
    name: "seoul",
    degree: 3,
    color: "red",
    coords: [37.566, 126.9784],
    text_offset: [0, 0]
  },
  {
    name: "tokyo",
    degree: 4,
    color: "red",
    coords: [35.6895, 139.69171],
    text_offset: [0, 0]
  },
  {
    name: "shanghai",
    degree: 5,
    color: "red",
    coords: [31.22222, 121.45806],
    text_offset: [0, 0]
  },
  {
    name: "hong kong",
    degree: 6,
    color: "red",
    coords: [22.27832, 114.17469],
    text_offset: [0, 0]
  },
  {
    name: "taipei",
    degree: 4,
    color: "red",
    coords: [25.04776, 121.53185],
    text_offset: [0, 0]
  },
  {
    name: "osaka",
    degree: 2,
    color: "red",
    coords: [34.69374, 135.50218],
    text_offset: [0, 0]
  },
  {
    name: "bangkok",
    degree: 5,
    color: "red",
    coords: [13.75398, 100.50144],
    text_offset: [0, 0]
  },
  {
    name: "ho chi minh city",
    degree: 4,
    color: "red",
    coords: [10.82302, 106.62965],
    text_offset: [0, 0]
  },
  {
    name: "manila",
    degree: 5,
    color: "red",
    coords: [14.599512, 120.984222],
    text_offset: [0, 0]
  },
  {
    name: "jakarta",
    degree: 4,
    color: "red",
    coords: [-6.21462, 106.84513],
    text_offset: [0, 0]
  },
  {
    name: "sydney",
    degree: 3,
    color: "red",
    coords: [-33.86882, 151.20929],
    text_offset: [0, 0]
  },
  {
    name: "khartoum",
    degree: 4,
    color: "yellow",
    coords: [15.55177, 32.53241],
    text_offset: [0, 0]
  },
  {
    name: "johannesburg",
    degree: 2,
    color: "yellow",
    coords: [-26.20227, 28.04363],
    text_offset: [0, 0]
  },
  {
    name: "kinshasa",
    degree: 3,
    color: "yellow",
    coords: [-4.32758, 15.31357],
    text_offset: [0, 0]
  },
  {
    name: "lagos",
    degree: 3,
    color: "yellow",
    coords: [6.524379, 3.379206],
    text_offset: [0, 0]
  },
  {
    name: "s\u00e3o paulo",
    degree: 4,
    color: "yellow",
    coords: [-23.5475, -46.63611],
    text_offset: [0, 0]
  },
  {
    name: "buenos aires",
    degree: 2,
    color: "yellow",
    coords: [-34.603683, -58.381557],
    text_offset: [0, 0]
  },
  {
    name: "santiago",
    degree: 1,
    color: "yellow",
    coords: [-33.448891, -70.669266],
    text_offset: [0, 0]
  },
  {
    name: "lima",
    degree: 3,
    color: "yellow",
    coords: [-12.046373, -77.042755],
    text_offset: [0, 0]
  },
  {
    name: "bogot\u00e1",
    degree: 5,
    color: "yellow",
    coords: [4.60971, -74.08175],
    text_offset: [0, 0]
  },
  {
    name: "mexico city",
    degree: 5,
    color: "yellow",
    coords: [19.42847, -99.12766],
    text_offset: [0, 0]
  },
  {
    name: "los angeles",
    degree: 4,
    color: "yellow",
    coords: [34.05223, -118.24368],
    text_offset: [0, 0]
  },
  {
    name: "miami",
    degree: 4,
    color: "yellow",
    coords: [25.761681, -80.191788],
    text_offset: [0, 0]
  }
];
