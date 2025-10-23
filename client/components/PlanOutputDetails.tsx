import { CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export default function PlanOutputDetails() {
    return (
        <CardContent className="space-y-6 text-sm">
            <ScrollArea className="h-[85vh] pb-2">
                {/* Training Plan Section */}
                <div>
                    <h3 className="font-semibold text-base mb-1">5-Week Half Marathon Plan</h3>
                    <p className="text-muted-foreground mb-2">
                        5 training days per week • ~30 km total • Intermediate level
                    </p>

                    {/* Week 1 */}
                    <h4 className="font-medium">Week 1</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                        <li>Mon — Rest</li>
                        <li>Tue — 5 km easy run</li>
                        <li>Wed — Cross-training (45 min cycling or swim)</li>
                        <li>Thu — 6 km tempo run</li>
                        <li>Fri — Rest</li>
                        <li>Sat — 9 km long run</li>
                        <li>Sun — 4 km recovery jog</li>
                    </ul>

                    {/* Week 2 */}
                    <h4 className="font-medium">Week 2</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                        <li>Mon — Rest</li>
                        <li>Tue — 6 km easy run + core stability</li>
                        <li>Wed — Cross-training (45 min spin)</li>
                        <li>Thu — 7 km tempo (3 × 1 km at goal pace)</li>
                        <li>Fri — Rest</li>
                        <li>Sat — 10 km long run</li>
                        <li>Sun — Yoga or foam-rolling</li>
                    </ul>

                    {/* Week 3 */}
                    <h4 className="font-medium">Week 3</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                        <li>Mon — Rest</li>
                        <li>Tue — 6 km easy + strides</li>
                        <li>Wed — Cross-training (tempo bike 40 min)</li>
                        <li>Thu — 8 km tempo (2 × 3 km at goal pace)</li>
                        <li>Fri — Rest</li>
                        <li>Sat — 11 km long run at 5:45 min/km</li>
                        <li>Sun — Recovery jog 3 km + stretch</li>
                    </ul>

                    {/* Week 4 */}
                    <h4 className="font-medium">Week 4 (taper begins)</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                        <li>Mon — Rest</li>
                        <li>Tue — 5 km easy + form drills</li>
                        <li>Wed — Cross-training (light swim 30 min)</li>
                        <li>Thu — 6 km at goal pace (steady effort)</li>
                        <li>Fri — Rest</li>
                        <li>Sat — 8 km long run easy</li>
                        <li>Sun — Yoga + foam-rolling</li>
                    </ul>

                    {/* Week 5 */}
                    <h4 className="font-medium">Week 5 – Race Week 🎯</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Mon — Rest + hydration focus</li>
                        <li>Tue — 4 km shake-out run</li>
                        <li>Wed — Optional 20 min cross-train (low effort)</li>
                        <li>Thu — Rest</li>
                        <li>Fri — 2 km easy jog + stretch</li>
                        <li>Sat — Rest & prepare race gear</li>
                        <li>Sun — 🏁 Race Day — Half Marathon (21.1 km)</li>
                    </ul>
                </div>

                {/* Race Day Plan Section */}
                <div className="pt-4 border-t border-muted">
                    <h3 className="font-semibold text-base mb-1">Race Day Plan</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Wake up 3 hours before start; eat a light meal (~400 kcal carbs + protein).</li>
                        <li>Start pacing around 5:40 – 5:45 min/km for a sub-2h finish.</li>
                        <li>Take 1 energy gel every 45 minutes + sips of isotonic drink.</li>
                        <li>Use the first 2 km to settle into rhythm; don’t go too fast early.</li>
                        <li>Hydrate every 2–3 km (100–150 ml water at each station).</li>
                    </ul>
                </div>

                {/* Safety Section */}
                <div className="pt-4 border-t border-muted">
                    <h3 className="font-semibold text-base mb-1">Safety Tips (Hot & Humid Singapore)</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Run before 8 a.m. or after 6 p.m. to avoid heat stress.</li>
                        <li>Wear breathable clothing and apply anti-chafing balm.</li>
                        <li>Watch for dizziness or elevated heart rate in humidity.</li>
                        <li>Let someone know your route when training solo.</li>
                        <li>Use sunscreen and a cap for UV protection.</li>
                    </ul>
                </div>

                {/* Hydration Section */}
                <div className="pt-4 border-t border-muted">
                    <h3 className="font-semibold text-base mb-1">Hydration Tips</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Pre-run: Drink 300–500 ml water 30 min before starting.</li>
                        <li>During: Sip 100 ml every 2 km; alternate water and sports drink.</li>
                        <li>Post-run: Replace fluids + electrolytes (1.5× weight lost in kg = L to drink).</li>
                        <li>Use electrolyte tabs to prevent cramps in humid conditions.</li>
                        <li>Check urine color (light yellow = well hydrated).</li>
                    </ul>
                </div>
            </ScrollArea>
        </CardContent>

    )
}
