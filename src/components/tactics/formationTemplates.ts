import type {
  FormationKey,
  FormationPosition,
} from "./types";

export const formationTemplates: Record<
  FormationKey,
  FormationPosition[]
> = {
  "4-2-3-1": [
    { id: "GK", label: "TW", x: 50, y: 91 },

    { id: "LB", label: "LV", x: 16, y: 73 },
    { id: "LCB", label: "IV", x: 38, y: 78 },
    { id: "RCB", label: "IV", x: 62, y: 78 },
    { id: "RB", label: "RV", x: 84, y: 73 },

    { id: "LDM", label: "ZDM", x: 37, y: 58 },
    { id: "RDM", label: "ZDM", x: 63, y: 58 },

    { id: "LAM", label: "LM", x: 18, y: 37 },
    { id: "CAM", label: "ZOM", x: 50, y: 40 },
    { id: "RAM", label: "RM", x: 82, y: 37 },

    { id: "ST", label: "ST", x: 50, y: 17 },
  ],

  "4-3-3": [
    { id: "GK", label: "TW", x: 50, y: 91 },

    { id: "LB", label: "LV", x: 16, y: 73 },
    { id: "LCB", label: "IV", x: 38, y: 78 },
    { id: "RCB", label: "IV", x: 62, y: 78 },
    { id: "RB", label: "RV", x: 84, y: 73 },

    { id: "LCM", label: "ZM", x: 28, y: 53 },
    { id: "CM", label: "ZM", x: 50, y: 58 },
    { id: "RCM", label: "ZM", x: 72, y: 53 },

    { id: "LW", label: "LF", x: 18, y: 24 },
    { id: "ST", label: "ST", x: 50, y: 17 },
    { id: "RW", label: "RF", x: 82, y: 24 },
  ],

  "4-4-2": [
    { id: "GK", label: "TW", x: 50, y: 91 },

    { id: "LB", label: "LV", x: 16, y: 73 },
    { id: "LCB", label: "IV", x: 38, y: 78 },
    { id: "RCB", label: "IV", x: 62, y: 78 },
    { id: "RB", label: "RV", x: 84, y: 73 },

    { id: "LM", label: "LM", x: 16, y: 48 },
    { id: "LCM", label: "ZM", x: 38, y: 53 },
    { id: "RCM", label: "ZM", x: 62, y: 53 },
    { id: "RM", label: "RM", x: 84, y: 48 },

    { id: "LST", label: "ST", x: 38, y: 20 },
    { id: "RST", label: "ST", x: 62, y: 20 },
  ],

  "3-5-2": [
    { id: "GK", label: "TW", x: 50, y: 91 },

    { id: "LCB", label: "IV", x: 28, y: 75 },
    { id: "CB", label: "IV", x: 50, y: 79 },
    { id: "RCB", label: "IV", x: 72, y: 75 },

    { id: "LM", label: "LM", x: 12, y: 49 },
    { id: "LCM", label: "ZM", x: 34, y: 54 },
    { id: "CAM", label: "ZOM", x: 50, y: 42 },
    { id: "RCM", label: "ZM", x: 66, y: 54 },
    { id: "RM", label: "RM", x: 88, y: 49 },

    { id: "LST", label: "ST", x: 39, y: 19 },
    { id: "RST", label: "ST", x: 61, y: 19 },
  ],
};