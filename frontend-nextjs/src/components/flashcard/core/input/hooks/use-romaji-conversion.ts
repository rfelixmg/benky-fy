/**
 * @deprecated Use @/components/japanese/core/input/romaji/hooks/use-romaji-conversion instead
 */

import { useState, useCallback } from "react";
import {
  detectScript,
  romajiToHiragana,
  romajiToKatakana,
  convertInputForField,
} from "@/components/japanese/core/input/romaji";

// ... rest of the file ...