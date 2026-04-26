// The Shed — project + quarterly review data
// Edit this file to add new quarters or images.
// Image files live in /assets/<project-id>/<quarter-folder>/<filename>

window.SHED = window.SHED || {};

SHED.config = {
    workerUrl: 'https://the-shed-ratings.j-sundby.workers.dev',
    studioName: 'Superthoughts Studio',
    contactEmail: 'josh@joshsundby.com',
};

SHED.projects = [
    {
        id: 'watershed-spa',
        name: 'Watershed Spa',
        tagline: 'Quarterly visual content for the Bath House',
        summary: 'New imagery and environmental visuals for the Bath House at Watershed Spa. Each quarter, a new batch of content. Mark approve or pass on each one, leave a note if anything sparks.',
        client: 'Nell',
        status: 'active',
        quarters: [
            {
                id: 'q1-2026-spring',
                label: 'Spring 2026',
                description: 'The first delivery of new visual content for the Bath House. Landscapes, night skies, natural stills. Presented March 2026.',
                date: '2026-03',
                status: 'in-review',
                images: [
                    {
                        id: 'purple-asters-at-dusk',
                        title: 'Purple Asters at Dusk',
                        filename: 'q1-2026-spring/01-purple-asters-at-dusk.png',
                        notes: 'Wild asters against a warm horizon. Grounded, soft, alive.',
                    },
                    {
                        id: 'waterfall-with-petals',
                        title: 'Waterfall with Petals',
                        filename: 'q1-2026-spring/02-waterfall-with-petals.png',
                        notes: 'Slow falling water, scattered white petals. Continuous motion, quiet sound.',
                    },
                    {
                        id: 'ferns-at-sunset',
                        title: 'Ferns at Sunset',
                        filename: 'q1-2026-spring/03-ferns-at-sunset.png',
                        notes: 'Silhouetted ferns in front of a burning sky. Warm, low, grounding.',
                    },
                    {
                        id: 'starlit-forest',
                        title: 'Starlit Forest',
                        filename: 'q1-2026-spring/04-starlit-forest.png',
                        notes: 'Treeline under a deep teal night sky. Meditative, vast, still.',
                    },
                    {
                        id: 'orchid-light-forest',
                        title: 'Orchid Light Forest',
                        filename: 'q1-2026-spring/05-orchid-light-forest.png',
                        notes: 'Shafts of green light through hanging vines, orchids in the foreground. Dreamlike.',
                    },
                    {
                        id: 'crimson-mountain-sunset',
                        title: 'Crimson Mountain Sunset',
                        filename: 'q1-2026-spring/06-crimson-mountain-sunset.png',
                        notes: 'Mountain silhouettes under dramatic crimson clouds. Bold, cinematic.',
                    },
                    {
                        id: 'nebula-i',
                        title: 'Nebula I',
                        filename: 'q1-2026-spring/07-nebula-i.png',
                        notes: 'Cosmic gas and star clusters. Cool blues shot through with warm rust. Cosmic, quiet.',
                    },
                    {
                        id: 'midnight-sky',
                        title: 'Midnight Sky',
                        filename: 'q1-2026-spring/08-midnight-sky.png',
                        notes: 'Starfield with soft cloud drift. Subtle, slow moving, restful.',
                    },
                    {
                        id: 'nebula-ii',
                        title: 'Nebula II',
                        filename: 'q1-2026-spring/09-nebula-ii.png',
                        notes: 'Teal and coral gas clouds, deeper and more saturated. Paired companion to Nebula I.',
                    },
                    {
                        id: 'above-the-clouds',
                        title: 'Above the Clouds',
                        filename: 'q1-2026-spring/10-above-the-clouds.png',
                        notes: 'The view from a plane window at altitude. Soft horizon, warm golden light.',
                    },
                    {
                        id: 'aurora-borealis',
                        title: 'Aurora Borealis',
                        filename: 'q1-2026-spring/11-aurora-borealis.png',
                        notes: 'Green and crimson aurora ribbons dancing across the sky. High-energy, bold color.',
                    },
                    {
                        id: 'evening-dunes',
                        title: 'Evening Dunes',
                        filename: 'q1-2026-spring/12-evening-dunes.png',
                        notes: 'Moonlit dunes and beach grasses under a starlit sky. Wide horizon, soft and quiet.',
                    },
                ],
            },
        ],
    },
];
