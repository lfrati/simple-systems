//const tf = require('@tensorflow/tfjs');
class Brain {
    constructor(inputSize, hiddenSize, outputSize, mutationRate) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        this.mutationRate = mutationRate;
        let inputConfig = { shape: [inputSize] };
        let hiddenConfig = {
            units: hiddenSize,
            activation: 'tanh',
            kernelInitializer: 'glorotNormal',
            biasInitializer: 'glorotNormal'
        };
        let outConfig = {
            units: outputSize,
            activation: 'linear',
            kernelInitializer: 'glorotNormal',
            biasInitializer: 'glorotNormal'
        };
        this.model = tf.tidy(() => {
            // Define input, which has a size of 5 (not including batch dimension).
            const input = tf.input(inputConfig);
            // First dense layer uses relu activation.
            const denseLayer1 = tf.layers.dense(hiddenConfig);
            // Second dense layer uses linear activation.
            const denseLayer2 = tf.layers.dense(outConfig);
            // Obtain the output symbolic tensor by applying the layers on the input.
            const output = denseLayer2.apply(denseLayer1.apply(input));
            return tf.model({ inputs: input, outputs: output });
        });
        // Create the model based on the inputs.
    }

    think(input) {
        return tf.tidy(() => {
            const data = tf.tensor2d(input, [1, this.inputSize]);
            let activation = this.model.predict(data);
            return Array.from(activation.dataSync());
        });
    }

    mutate(parent) {
        const mutated = parent.model.getWeights().reduce((mutations, layer) => {
            const data = Array.from(layer.dataSync());
            const numMutations = getBinomial(data.length, this.mutationRate);
            for (let i = 0; i < numMutations; i++) {
                const loc = getRandomInt(0, data.length);
                const newVal = data[loc] + Math.random() * 2 - 1;
                data[loc] = newVal;
            }
            let newLayer = tf.tensor(data, layer.shape);
            mutations.push(newLayer);
            return mutations;
        }, []);

        this.model.setWeights(mutated);

        mutated.forEach(element => {
            element.dispose();
        });
    }

    die() {
        this.model.getWeights().forEach(element => element.dispose());
        //this.bias.dispose();
    }

    toJSON() {
        let weights = Array.from(this.weights.dataSync());
        let wShape = this.weights.shape;
        let bias = Array.from(this.bias.dataSync());
        let bShape = this.bias.shape;
        return { weights: { data: weights, shape: wShape }, bias: { data: bias, shape: bShape } };
    }

    fromJSON(JSON) {
        const old_w = this.weights;
        const old_b = this.bias;
        tf.tidy(() => {
            this.weights = tf.keep(tf.tensor(JSON.weights.data, JSON.weights.shape));
            this.bias = tf.keep(tf.tensor(JSON.bias.data, JSON.bias.shape));
        });
        old_w.dispose();
        old_b.dispose();
    }

    display() {
        this.weights.print();
        this.bias.print();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Brain
    };
}
