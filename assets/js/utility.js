// Format large numbers
const nFormatter =
  /* Format large numbers with the existing display suffixes. */ (num) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(
        /* Handle this control using the current view state and transition owner. */ function (
          item,
        ) {
          return num >= item.value;
        },
      );
    return item
      ? (num / item.value).toFixed(2).replace(rx, "$1") + item.symbol
      : "0";
  };

// Get a randomized number between 2 integers
const randomizeNum =
  /* Draw an integer using the original inclusive range formula. */ (
    min,
    max,
  ) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.floor(Math.random() * (max - min + 1)) + min); //The maximum is inclusive and the minimum is inclusive
  };

// Get a randomized decimal between 2 numbers
const randomizeDecimal =
  /* Draw a decimal using the original range formula. */ (min, max) => {
    return Math.random() * (max - min) + min;
  };
