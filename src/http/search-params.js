import { encodeComponent } from "./url-encoding";

export const encodeSearchParams = (params) => {
  const entries = Object.entries(params)
    .map(([key, value]) => `${encodeComponent(key)}=${encodeComponent(value)}`);

  return entries.length ? "?" + entries : "";
};