const Utils = require('./Utils');

const Constants = require('./Constants');

module.exports = class Sword {
    constructor() {
        this.length = 20;
        this.damage = 30;

        this.minRange = 0;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 2,
            y: -5,
        };

        this.offsetAngle = Math.PI / 4;

        this.status = 'holding';

        this.type = 'sword';
    }

    attack(holder, target, facing) {
        if (this.status === 'holding') {
            this.status = 'out';
        }

        if (this.status === 'out') {
            this.currAttackFrame++;

            const pointing = facing - this.offsetAngle;

            const normalX = Math.cos(pointing);
            const normalY = Math.sin(pointing);

            const diff = {
                x: target.position.x - holder.position.x,
                y: target.position.y - holder.position.y,
            };

            const dist = Math.abs(diff.x * normalX + diff.y * normalY);

            if (dist < 5) {
                this.status = 'back';

                const combatDir = Utils.normalize(diff);
                const attackAngle = Utils.dot(combatDir, target.facing);

                target.handleAttack(this, attackAngle);

                // const rand = Math.random();
                //
                // if (attackAngle < -0.5) {
                //     if (rand > 0.9) {
                //         target.receiveDamage(this.damage);
                //     }
                // } else {
                //     if (rand > 0.2) {
                //         target.receiveDamage(this.damage);
                //     }
                // }
            }
        } else if (this.status === 'back') {
            this.currAttackFrame--;

            if (this.currAttackFrame === 0) {
                this.status = 'holding';
            }
        }
    }

    defend(attackWeapon, attackAngle) {
        const blockChance = Constants.BLOCK_CHANCE[this.type];

        const rand = Math.random();

        if (attackAngle < blockChance.angle) {
            if (rand > blockChance[attackWeapon.type]) {
                return attackWeapon.damage;
            }
        } else {
            if (rand > 0.2) {
                return attackWeapon.damage;
            }
        }

        return 0;
    }

    render(ctx) {

        this.offsetAngle = Math.PI / 4 * (1 - this.currAttackFrame / 30);
        ctx.save();
        ctx.rotate(this.offsetAngle);

        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.startPos.x, this.startPos.y - this.length);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}