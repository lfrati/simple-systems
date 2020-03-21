function poisson_disc(r, ratio) {
  let k = 30;
  let grid = [];
  let w = r / Math.sqrt(2);
  let active = [];
  let cols, rows;
  let ordered = [];

  // STEP 0
  cols = floor((width / w) * ratio);
  rows = floor((height / w) * ratio);
  for (let i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }

  // STEP 1
  let x = width / 2;
  let y = height / 2;
  let i = floor(x / w);
  let j = floor(y / w);
  let pos = createVector(x, y);
  grid[i + j * cols] = pos;
  active.push(pos);
  //frameRate(1);

  while (active.length > 0) {
    let randIndex = floor(random(active.length));
    let pos = active[randIndex];
    let found = false;
    for (let n = 0; n < k; n++) {
      let sample = p5.Vector.random2D();
      let m = random(r, 2 * r);
      sample.setMag(m);
      sample.add(pos);

      let col = floor(sample.x / w);
      let row = floor(sample.y / w);

      if (col > -1 && row > -1 && col < cols && row < rows && !grid[col + row * cols]) {
        let ok = true;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            let index = col + i + (row + j) * cols;
            let neighbor = grid[index];
            if (neighbor) {
              let d = p5.Vector.dist(sample, neighbor);
              if (d < r) {
                ok = false;
              }
            }
          }
        }
        if (ok) {
          found = true;
          grid[col + row * cols] = sample;
          active.push(sample);
          ordered.push(sample);
          // Should we break?
          break;
        }
      }
    }

    if (!found) {
      active.splice(randIndex, 1);
    }
  }

  return ordered.map(pos => {
    pos.x += (width * (1 - ratio)) / 2;
    pos.y += (height * (1 - ratio)) / 2;
    return pos;
  });
}


