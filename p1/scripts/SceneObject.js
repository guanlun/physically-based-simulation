module.exports = class SceneObject {
    constructor(pos) {
        this._graphicsObject = null;

        this.radius = 1;

        this.pos = pos || new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.acc = new THREE.Vector3(0, 0, 0);

        this._forces = [];

        this.lastState = null;
    }

    setInitialVelocity(vel) {
        this.vel = vel;
    }

    addForce(f) {
        this._forces.push(f);
    }

    getGraphicsObject() {
        return this._graphicsObject;
    }

    calculateAcceleration() {
        this.acc.set(0, 0, 0);

        this._forces.forEach(f => f.apply(this));
    }

    integrate(deltaT) {
        this.vel.add(new THREE.Vector3(this.acc.x * deltaT, this.acc.y * deltaT, this.acc.z * deltaT));
        this.pos.add(new THREE.Vector3(this.vel.x * deltaT, this.vel.y * deltaT, this.vel.z * deltaT));
    }

    respondToCollision(collision) {
        const {
            point,
            normal,
        } = collision;

        const normalVel = normal.clone().multiplyScalar(this.vel.dot(normal));
        const tangentialVel = this.vel.clone().sub(normalVel);

        normalVel.multiplyScalar(-0.8);

        this.vel.set(normalVel.x + tangentialVel.x, normalVel.y + tangentialVel.y, normalVel.z + tangentialVel.z);
    }

    updateGraphics() {
        this._graphicsObject.position.set(this.pos.x, this.pos.y, this.pos.z);
    }

    restoreLastState() {
        const lastPos = this.lastState.pos;
        const lastVel = this.lastState.vel;
        this.pos.set(lastPos.x, lastPos.y, lastPos.z);
        this.vel.set(lastVel.x, lastVel.y, lastVel.z);
    }

    updateLastState() {
        this.lastState = {
            pos: new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z),
            vel: new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z),
        };
    }
}
