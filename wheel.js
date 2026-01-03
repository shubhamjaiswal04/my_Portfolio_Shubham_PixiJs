import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js';

(async () => {
    const app = new PIXI.Application();
    
    // 1. Initialization
    try {
        await app.init({ 
            width: 500, height: 500, 
            backgroundColor: 0x1a1a2e,
            antialias: true 
        });
        document.getElementById('pixi-canvas-container').appendChild(app.canvas);
    } catch (e) {
        console.error("Pixi Init Error:", e);
        return;
    }

    // --- Object Pooling Concept ---
    // Hum segments ko baar-baar delete/create karne ki jagah reuse karte hain
    const segmentPool = {
        _pool: [],
        get(color) {
            let item;
            if (this._pool.length > 0) {
                item = this._pool.pop();
                item.visible = true;
            } else {
                // New segment create karna agar pool khali hai
                item = new PIXI.Graphics();
            }
            // Reset look
            item.clear().poly([0,0, 150,-40, 150,40]).fill(color);
            return item;
        },
        recycle(item) {
            item.visible = false;
            this._pool.push(item);
        }
    };

    // --- Manifest loading (Wrap in try-catch) ---
    // Agar manifest file nahi hai, toh hum program ko crash hone se bachayenge
    let assets;
    try {
        await PIXI.Assets.init({ manifest: 'assets/manifest.json' });
        assets = await PIXI.Assets.loadBundle('spinGameAssets');
    } catch (e) {
        console.warn("Manifest not found, using generated graphics for portfolio demo.");
    }

    // --- Create Wheel ---
    const wheel = new PIXI.Container();
    wheel.x = 250; wheel.y = 250;
    app.stage.addChild(wheel);

    const colors = [0xff0066, 0x00f7ff, 0xffcc00, 0x39ff14, 0x9d00ff, 0xff5e00];
    
    // Pooling demonstration: Adding 6 segments
    for(let i=0; i<6; i++) {
        const seg = segmentPool.get(colors[i]);
        seg.rotation = (i * Math.PI * 2) / 6;
        wheel.addChild(seg);
    }

    // --- Spin Logic ---
    let isSpinning = false;
    let velocity = 0;

    const startSpin = () => {
        if(isSpinning) return;
        isSpinning = true;
        velocity = 0.5 + Math.random() * 0.5; // Random initial speed
    };

    document.getElementById('spinButton').onclick = startSpin;

    app.ticker.add((time) => {
        if (isSpinning) {
            wheel.rotation += velocity * time.deltaTime;
            velocity *= 0.985; // Friction (Optimization: Constant decay)

            if (velocity < 0.001) {
                isSpinning = false;
                velocity = 0;
            }
        }
    });

})();