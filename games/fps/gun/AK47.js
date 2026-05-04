export const AK_ULTIMATE_SPACS = {
    identity: {
        name: "AK-47",
        caliber: "7.62x39mm",
        operation: "Long-stroke gas piston, Rotating bolt"
    },
    physics: {
        mass: {
            receiver: 3.47,
            boltCarrier: 0.450,
            defaultMagEmpty: 0.43,
            fullMagWeight: 0.92
        },
        dimensions: {
            legthOverall: 0.880,
            centerOfMass: {
                x: 0,
                y: -0.05,
                z: 0.15,
            },
            swingInertia: 1.8
        }
    },
    mechanics: {
        gasSystem: {
            type: "Long-stroke",
            pistonArea: 0.000154,
            dwellTime: 0.0005,
            portLocation: 0.285,
            gasLeakageRate: 0.02,
            internalFriction: 0.05,
            recoilSpring: {
                springConstant: 150,
                preloadForce: 20.0,
                travelDistance: 0.11
            },
            action: {
                lockTime: 0.004,
                boltSlamForce: 12.0,
                outOfBatteryThreshold: 0.002
            }
        }
    },
    barrel: {
        specs: {
            length: 0.415,
            twistRate: 0.240,
            harmonics: 0.0012,
            mechanicalTolerance: 0.0005
        },
        thermals: {
            specificHeat: 450,
            surfaceArea: 0.045,
            emissivity: 0.92,
            heatLimit: 600,
            accuracyDegradation: 0.05
        }
    },
    operation: {
        trigger: {
            pullWeight: 25.0,
            breakPoint: 0.008,
            resetDistance: 0.005
        },
        feedSystem: {
            magSpringConstant: 45.0,
            feedRampFriction: 0.12,
            ejectionVector: {
                x: 1.5,
                y: 0.5,
                z: 0.2,
            }
        },
        durability: {
            maxFouling: 1000,
            reliabilityThreshold: 0.98
        }
    },
    noise: {
        velocityStandardDeviation: 0.015,
        recoilVectorJitter: 0.03
    }
}