// vite.config.ts
import {configureable} from "@baleada/prepare";
console.log(new configureable.Vite().pages);
var vite_config_default = new configureable.Vite().alias({
  "@src": `/src`
}).includeDeps([
  "@baleada/logic"
]).vue().pages({
  pagesDir: "tests/stubs/app/src/pages",
  extensions: ["vue"]
}).configure();
export {
  vite_config_default as default
};
