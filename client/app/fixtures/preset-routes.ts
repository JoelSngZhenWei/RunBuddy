// Collection of popular running routes in Singapore from greatruns.com
export interface PresetRoute {
    name: string;
    description: string;
    distance: number;
    location: string;
    difficulty: "Easy" | "Moderate" | "Challenging";
    surfaceType: string;
    highlights: string[];
    websiteLink: string;
}

export const singaporeRoutes: PresetRoute[] = [
    {
        name: "East Coast Park Route",
        description: "One of Singapore's most popular running spots. Wide paths along the beach, plenty of facilities.",
        distance: 15, // Can be done in segments
        location: "East Coast Park",
        difficulty: "Easy",
        surfaceType: "Paved paths",
        highlights: [
            "Scenic coastal views",
            "Well-lit paths",
            "Many water points and restrooms",
            "Multiple entry/exit points"
        ],
        websiteLink: "https://greatruns.com/singapore-east-coast-park/"
    },
    {
        name: "MacRitchie Reservoir Loop",
        description: "Beautiful nature trail around Singapore's oldest reservoir. Mix of boardwalk and trail running.",
        distance: 11,
        location: "MacRitchie Reservoir Park",
        difficulty: "Moderate",
        surfaceType: "Mixed (boardwalk, trail, gravel)",
        highlights: [
            "Nature trails",
            "TreeTop Walk",
            "Wildlife spotting",
            "Water views"
        ],
        websiteLink: "https://greatruns.com/singapore-macritchie-reservoir/"
    },
    {
        name: "Gardens by the Bay",
        description: "Iconic waterfront gardens with stunning views of Marina Bay Sands and the Singapore skyline.",
        distance: 5,
        location: "Gardens by the Bay",
        difficulty: "Easy",
        surfaceType: "Paved paths",
        highlights: [
            "Marina Bay views",
            "Supertree Grove",
            "Well-lit at night",
            "Flat terrain"
        ],
        websiteLink: "https://greatruns.com/singapore-marina-bay-gardens-by-the-bay/"
    },
    {
        name: "Southern Ridges Trail",
        description: "A green corridor connecting parks along Singapore's southern ridge, featuring iconic bridges.",
        distance: 9,
        location: "Mount Faber Park",
        difficulty: "Challenging",
        surfaceType: "Mixed (paths, stairs, bridges)",
        highlights: [
            "Henderson Waves bridge",
            "Canopy walks",
            "Forest trails",
            "City views"
        ],
        websiteLink: "https://greatruns.com/singapore-southern-ridges-trail/"
    }
];