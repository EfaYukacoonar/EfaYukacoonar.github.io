import {
    Vecter3, Raycaster
} from 'three';
import {
    getAirDensity,
    getNormalGravity,
    getSpeedOfSound
} from './earth.js';
export const Kinematics = {
    _raycaster: new Raycaster(),
    update(
        entity, world, dt,
        collidableObjects = []
    ) {
        (Sub-stepping)
        const subSteps = 5;
        const subDt = dt / subSteps;
        for (let i = 0;
            i < subSteps;
            i++
        ){
            this.computePhysics(
                entity, world, subDt, collidableObjects
            );
            if (entity.isDestroyed) break;
        }
        this.updateThermals(entity, world, dt);
    },
    computePhysics(
        entity, world, dt, collidableObjects
    ){
        if (
            entity.isDestroyed
        ) return;
        const prevPos = entity.position.clone();
        const vel = entity.velocity;
        const mass = entity.isBolt ? entity.specs.mechanics.boltCattier.mass : entity.specs.physics.mass.boltCattier;
        const alt = entity.position.y;
        const rho = getAirDensity(alt, world);
    }
}