import full_flock from './sketch_1';
import align_separ_cohes from './sketch_0';
//import neuro_evo from './sketch_2';

import P5 from 'p5';

// runs the sketch
new P5(align_separ_cohes, 'boids'); // 2nd param can be a canvas html element
new P5(full_flock, 'full_flock'); // 2nd param can be a canvas html element
//new P5(neuro_evo, 'exp'); // 2nd param can be a canvas html element
