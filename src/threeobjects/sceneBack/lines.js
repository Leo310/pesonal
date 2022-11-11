import globalstateobj from "../../globalstate";
import * as THREE from "three";

export default function Lines() {
  this.group = new THREE.Group()
  let pointsDown = [];
  pointsDown.push(new THREE.Vector3(500, -175, 0));
  pointsDown.push(new THREE.Vector3(-45, 13, 0));
  pointsDown.push(new THREE.Vector3(-500, -175, 0));

  let pointsUp = [];
  pointsUp.push(new THREE.Vector3(-500, 175, 0));
  pointsUp.push(new THREE.Vector3(45, -13, 0));
  pointsUp.push(new THREE.Vector3(500, 175, 0));
  this.points = [pointsDown, pointsUp]

  this.lastScrollPosition = 0;

  this.group.translateZ(-8);
  this.lines = []
  this.lineRate = 5;
  this.accurateScrollPosition = 0;

  this.farestZIndex = 0;

  this.addLine(0, false);
  this.addLine(1, false);
  this.lines = []
}

Lines.prototype.addLine = function(position, back) {
  let line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(this.points[position]),
    new THREE.LineBasicMaterial({
      color: 0x8be9fd, transparent: true,
      linewidth: 2
    }));
  if (back) {
    line.translateZ(this.farestZIndex);
  }
  this.group.add(line);
  this.lines.push(line)
}

Lines.prototype.update = function() {
  let scrollDiff = globalstateobj.scrollPositionBody - this.lastScrollPosition;
  if (scrollDiff < 0) {
    if (this.accurateScrollPosition % this.lineRate == 0) {
      this.addLine(0, false);
      this.addLine(1, false);
    }
    this.lines.forEach((line, index, lines) => {
      if (line.isLine) {
        line.translateZ(-1);
        line.material.opacity = 1 / (line.position.z * line.position.z / 1000);
        if (line.position.z <= -300) {
          this.group.remove(this.group.children[index]);
          lines.splice(index, 1);
        }
      }
    });
    this.accurateScrollPosition++;
  } else if (scrollDiff > 0) {
    if (this.accurateScrollPosition % this.lineRate == 0) {
      this.addLine(0, true);
      this.addLine(1, true);
    }
    this.lines.forEach((line, index, lines) => {
      if (line.isLine) {
        line.translateZ(1);
        if (this.farestZIndex > line.position.z)
          this.farestZIndex = line.position.z;
        line.material.opacity = 1 / (line.position.z * line.position.z / 1000);
        if (line.position.z > 0) {
          this.group.remove(this.lines[index]);
          lines.splice(index, 1);
        }
      }
    });
    this.accurateScrollPosition++;
  }
  this.lastScrollPosition = globalstateobj.scrollPositionBody;
};
