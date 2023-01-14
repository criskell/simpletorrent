/**
-x x

*/

export const parseArgs = (list) => {
  const args = {
    values: [],
    shortOptions: {},
    longOptions: {},
  };

  for (let i = 0; i < list.length; i++) {
    const value = list[i];

    if (value.startsWith("-")) {
      let nextValue = list[++i];

      if (!nextValue || nextValue.startsWith("-")) {
        nextValue = "";
        i--;
      }

      if (value.startsWith("--")) {
        const key = value.slice(2);

        args.longOptions[key] = nextValue;
      } else {
        const key = value.slice(1);

        args.shortOptions[key] = nextValue;
      }
    } else {
      args.values.push(value);
    }
  }

  return args;
};