const Soldier = require('./Soldier');
const Utils = require('./Utils');

const OVERCHARGE_FRAME = 60;
const COOLDOWN_FRAME = 10;

module.exports = class Horseman extends Soldier {
    constructor(x, y) {
        super(x, y, 'sword');

        this.maxMovingSpeed = 2;

        this.weapon.rotationSpeed = 0.04;

        this.overcharge = OVERCHARGE_FRAME;

        this.attackCooldown = 0;

        this.speed = 0;
    }

    simulate(frame, friendly, enemy) {
        if (!this.alive) {
            return;
        }

        const target = this.findTarget(enemy.soldiers, Math.PI / 3);

        let newFacingX, newFacingY;

        if (target === null) {
            if (this.overcharge === 0) {
                newFacingX = -this.facing.y;
                newFacingY = this.facing.x;
            } else {
                newFacingX = this.facing.x;
                newFacingY = this.facing.y;

                this.overcharge--;
            }
        } else {
            const dist = this.distTo(target);

            newFacingX = (target.position.x - this.position.x) / dist;
            newFacingY = (target.position.y - this.position.y) / dist;

            this.overcharge = OVERCHARGE_FRAME;
        }

        const newFacingAngle = Math.atan2(newFacingY, newFacingX);
        let currFacingAngle = Math.atan2(this.facing.y, this.facing.x);

        const rotationSpeed = this.weapon.rotationSpeed;

        if (newFacingAngle > currFacingAngle) {
            if (newFacingAngle - currFacingAngle < Math.PI) {
                currFacingAngle = Math.min(newFacingAngle, currFacingAngle + rotationSpeed);
            } else {
                currFacingAngle = Math.min(newFacingAngle, currFacingAngle - rotationSpeed);
            }
        } else {
            if (currFacingAngle - newFacingAngle < Math.PI) {
                currFacingAngle = Math.max(newFacingAngle, currFacingAngle - rotationSpeed);
            } else {
                currFacingAngle = Math.max(newFacingAngle, currFacingAngle + rotationSpeed);
            }
        }

        this.facing.x = Math.cos(currFacingAngle);
        this.facing.y = Math.sin(currFacingAngle);

        if (this.state === 'moving') {
            this.target = target;

            if (this.attackCooldown > 0) {
                this.attackCooldown--;
            }

            if (target && this.distTo(target) < this.weapon.length) {
                if (this.attackCooldown === 0) {
                    this.target.hp -= 50;
                    console.log(this.target.hp);
                    if (this.target.hp <= 0) {
                        this.target.alive = false;
                    }

                    this.attackCooldown = COOLDOWN_FRAME;
                }
            }

            if (this.speed < this.maxMovingSpeed) {
                this.speed += 0.1;
            }

            this.velocity.x = this.facing.x * this.speed;
            this.velocity.y = this.facing.y * this.speed;

            const speed = Utils.dim(this.velocity);

            if (speed > this.maxMovingSpeed) {
                this.velocity.x *= this.maxMovingSpeed / speed;
                this.velocity.y *= this.maxMovingSpeed / speed;
            }

            friendly.soldiers.forEach(f => {
                if (f === this || !f.alive) {
                    return;
                }

                // this.velocity.y += 0.01 * (f.velocity.y - this.velocity.y);
                // this.velocity.x += 0.01 * (f.velocity.x - this.velocity.x);

                const xDiff = f.position.x - this.position.x;
                const yDiff = f.position.y - this.position.y;

                const dist = Utils.distance(this.position, f.position);

                if (dist < 10) {
                    this.velocity.x -= 0.5 / dist * xDiff;
                    this.velocity.y -= 0.5 / dist * yDiff;
                }
            });

            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

        }

        const facing = Math.atan2(this.facing.y, this.facing.x) + Math.PI / 2;

        // this.weapon.simulate(this, target, facing);
    }

    handleAttack(attackWeapon, angle) {
        const damage = this.weapon.defend(attackWeapon, angle);

        if (damage > 0) {
            this.hp -= damage;

            this.speed *= 0.7;

            if (this.hp <= 0) {
                this.alive = false;
            }
        }
    }

    renderAlive(ctx) {
        ctx.beginPath();

        ctx.moveTo(0, -15);
        ctx.lineTo(10, 15);
        ctx.lineTo(-10, 15);

        ctx.closePath();

        ctx.stroke();
    }


}
