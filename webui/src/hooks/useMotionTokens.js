export const MOTION = {
    durations: { xs: 0.09, sm: 0.16, md: 0.26, lg: 0.42 },
    easings: {
        in: [0.2, 0.9, 0.3, 1],
        out: [0.22, 0.9, 0.3, 1],
        expo: [0.16, 0.84, 0.44, 1]
    },
    spring: { stiffness: 320, damping: 34 }
}

export const useMotionTokens = () => MOTION;
