/**
 * Fractal Drawing with CSS Houdini
 *
 * @link https://houdini.how/
 * @link https://github.com/GoogleChromeLabs/houdini.how
 * @link https://developer.mozilla.org/en-US/docs/Web/Houdini
 * @link https://fractalfoundation.org/resources/what-are-fractals/
 * @link https://en.wikipedia.org/wiki/
 * @link https://mathworld.wolfram.com/Fractal.html
 * @link https://www.wired.com/2010/09/fractal-patterns-in-nature/
 * @author Conrad Sollitt (https://conradsollitt.com)
 * @license CC0 "Public Domain" license
 */
class Fractals {
    /**
     * Required Houdini API for Custom Properties
     */
    static get inputProperties() {
        return [
            '--colors',
            '--angle',
            '--starting-length-percent',
            '--next-line-size',
            '--max-draw-count',
            '--debug-to-console',
        ];
    }

    /**
     * Houdini API
     *
     * @param {PaintRenderingContext2D} ctx
     * @param {object} size
     * @param {object} props
     */
    paint(ctx, size, props) {
        // Optional debug info to console
        const debugToConsole = (props.get('--debug-to-console').toString().trim() === '1');
        let startDate;
        if (debugToConsole) {
            startDate = new Date();
            console.log('-'.repeat(80))
            console.log(`Starting CSS [paint(fractals)] at: ${startDate.toLocaleTimeString()}`);
            console.log(size);
            console.log(props);
        }

        // Default angle to 30%
        this.angle = parseInt(props.get('--angle'), 10) || 30;

        // Starting Line Length - Default to 22 %
        let startingLengthPct = parseInt(props.get('--starting-length-percent'), 10);
        if (isNaN(startingLengthPct) || startingLengthPct < 5 || startingLengthPct > 95) {
            startingLengthPct = 22;
        }
        const length = (size.height / (100 / startingLengthPct));

        // Next line size - defaults to 0.8 for 80%
        this.nextLineSize = parseFloat(props.get('--next-line-size'));
        if (isNaN(this.nextLineSize) || this.nextLineSize < 0.1 || this.nextLineSize > 0.9) {
            this.nextLineSize = 0.8;
        }

        // For safety due to recursive function or by design if the number
        // is small only half (give or take) the the drawing will render.
        this.maxDrawCount = parseInt(props.get('--max-draw-count'), 10) || 100000;
        this.drawCount = 0;

        // Other Defaults
        const x = (size.width / 2);
        const y = (size.height);
        this.colors = props.get('--colors').toString().trim().split(' ').map(s => s.trim());
        this.colorCount = this.colors.length;

        // Start call to recursive `draw()`
        this.draw(ctx, x, y, length, 0);
        if (debugToConsole) {
            const endDate = new Date();
            const duration = endDate.getTime() - startDate.getTime();
            console.log(`Finished CSS [paint(fractals)] at: ${startDate.toLocaleTimeString()}`);
            console.log(`Duration in milliseconds: ${duration}`);
            console.log(`Function calls: ${this.drawCount}`)
        }
    }

    /**
     * Recursive function that draws the fractals
     *
     * @param {PaintRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} length
     * @param {number} angle
     */
    draw(ctx, x, y, length, angle) {
        // Draw Line Stroke
        ctx.beginPath();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.moveTo(0, 0);
        if (this.colorCount > 0) {
            const colorIndex = this.drawCount % this.colorCount;
            ctx.strokeStyle = this.colors[colorIndex];
        }
        ctx.lineTo(0, -length);
        ctx.stroke();

        // Exit once the line length becomes too small or
        // if the number of max function calls is exceeded.
        this.drawCount++;
        if (this.drawCount > this.maxDrawCount || length < 10) {
            ctx.restore();
            return;
        }

        // Recursively call this function twice, once for the left side and once for the right side
        this.draw(ctx, 0, -length, length * this.nextLineSize, -this.angle);
        this.draw(ctx, 0, -length, length * this.nextLineSize, this.angle);
        ctx.restore();
    }
}

registerPaint('fractals', Fractals);
