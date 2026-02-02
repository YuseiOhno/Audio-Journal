import { createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v5";

export const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}
