export class Input {
  mouseX = 0;
  mouseY = 0;
  clicked = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
    });

    canvas.addEventListener("mousedown", () => {
      this.clicked = true;
    });
  }

  consumeClick() {
    const was = this.clicked;
    this.clicked = false;
    return was;
  }
}
