export class SmartTargeter {
    static findTarget(tower, enemies, range, logic = 'first') {
        const inRange = enemies.filter(e => e.position.distanceTo(tower.position) <= range);
        if (inRange.length === 0) return null;
        switch(logic) {
            case 'strongest': return inRange.sort((a,b) => b.hp - a.hp)[0];
            case 'closest':   return inRange.sort((a,b) => a.position.distanceTo(tower.position) - b.position.distanceTo(tower.position))[0];
            default:          return inRange[0]; // 'first'
        }
    }
}
