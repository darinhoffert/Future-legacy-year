use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Trophy, TrendingUp } from 'lucide-react';

const calculateFutureSuccessIndex = (current: number, prospect: number, draft: number, age: number, cap: number) => {
  return Math.round((current * 0.25 + prospect * 0.25 + draft * 0.2 + age * 0.15 + cap * 0.15) * 10) / 10;
};

const getCupWindowLabel = (score: number) => {
  if (score >= 90) return { label: 'Cup Favorite', color: 'bg-emerald-500', text: 'text-white' };
  if (score >= 80) return { label: 'Contender', color: 'bg-blue-500', text: 'text-white' };
  if (score >= 70) return { label: 'Playoff Team', color: 'bg-amber-500', text: 'text-black' };
  if (score >= 60) return { label: 'Bubble Team', color: 'bg-orange-500', text: 'text-white' };
  return { label: 'Rebuild', color: 'bg-red-500', text: 'text-white' };
};

const teamsData = [
  {
    team: 'Vancouver Canucks', abbr: 'VAN', current: 78, prospect: 74, draft: 68, age: 82, cap: 76, grit: 72,
    futureIndex: calculateFutureSuccessIndex(78,74,68,82,76),
    prospects: [
      {name: 'Tom Willander', pos: 'D', rating: 87, tier: 'Elite'},
      {name: 'Lekkerimäki', pos: 'RW', rating: 84, tier: 'Top Line/Top Pair'}
    ],
    historical: [
      { season: '2022-23', fsi: 68.2, grit: 65 },
      { season: '2023-24', fsi: 72.4, grit: 69 },
      { season: '2024-25', fsi: 75.6, grit: 72 },
    ]
  },
  {
    team: 'Edmonton Oilers', abbr: 'EDM', current: 92, prospect: 60, draft: 55, age: 84, cap: 65, grit: 68,
    futureIndex: calculateFutureSuccessIndex(92,60,55,84,65),
    prospects: [],
    historical: [
      { season: '2022-23', fsi: 76.1, grit: 64 },
      { season: '2023-24', fsi: 78.8, grit: 66 },
      { season: '2024-25', fsi: 79.5, grit: 68 },
    ]
  },
  {
    team: 'Florida Panthers', abbr: 'FLA', current: 95, prospect: 65, draft: 50, age: 78, cap: 70, grit: 85,
    futureIndex: calculateFutureSuccessIndex(95,65,50,78,70),
    prospects: [],
    historical: [
      { season: '2022-23', fsi: 78.5, grit: 80 },
      { season: '2023-24', fsi: 82.1, grit: 83 },
      { season: '2024-25', fsi: 80.2, grit: 85 },
    ]
  },
  {
    team: 'Dallas Stars', abbr: 'DAL', current: 88, prospect: 78, draft: 72, age: 75, cap: 82, grit: 78,
    futureIndex: calculateFutureSuccessIndex(88,78,72,75,82),
    prospects: [],
    historical: [
      { season: '2022-23', fsi: 79.8, grit: 75 },
      { season: '2023-24', fsi: 81.5, grit: 77 },
      { season: '2024-25', fsi: 82.1, grit: 78 },
    ]
  },
  {
    team: 'Chicago Blackhawks', abbr: 'CHI', current: 45, prospect: 85, draft: 90, age: 68, cap: 88, grit: 55,
    futureIndex: calculateFutureSuccessIndex(45,85,90,68,88),
    prospects: [],
    historical: [
      { season: '2022-23', fsi: 52.3, grit: 48 },
      { season: '2023-24', fsi: 61.7, grit: 52 },
      { season: '2024-25', fsi: 68.4, grit: 55 },
    ]
  },
];

export default function FutureIceIndex() {
  const [selectedTeam, setSelectedTeam] = useState(teamsData[0]);
  const [loadedTeams, setLoadedTeams] = useState<any[]>(teamsData);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [simulatorImpacts, setSimulatorImpacts] = useState({
    Franchise: 0, Elite: 0, 'Top Line/Top Pair': 0, 'Middle Six': 0, Depth: 0, 'Gritty Player': 0,
  });

  const IMPACT_VALUES: Record<string, number> = {
    Franchise: 8, Elite: 6, 'Top Line/Top Pair': 5, 'Middle Six': 2, Depth: 1, 'Gritty Player': 4,
  };

  const [simulationResults, setSimulationResults] = useState<any>(null);

  React.useEffect(() => {
    fetch('/data/teams.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.teams) {
          setLoadedTeams(data.teams);
          setLastUpdated(data.lastUpdated || null);
        }
      }).catch(() => {});
  }, []);

  const updateImpact = (type: string, delta: number) => {
    setSimulatorImpacts(prev => ({
      ...prev, [type]: Math.max(0, (prev[type as keyof typeof prev] || 0) + delta)
    }));
  };

  const resetSimulator = () => {
    setSimulatorImpacts({ Franchise: 0, Elite: 0, 'Top Line/Top Pair': 0, 'Middle Six': 0, Depth: 0, 'Gritty Player': 0 });
    setSimulationResults(null);
  };

  const exportReport = () => {
    const data = [
      ['Metric', 'Value'],
      ['Team', selectedTeam.team],
      ['Future Success Index', selectedTeam.futureIndex],
      ['Grit Score', selectedTeam.grit || 'N/A'],
      ['Cup Window', getCupWindowLabel(selectedTeam.futureIndex).label],
      ...(selectedTeam.historical ? selectedTeam.historical.map((h: any) => [`FSI ${h.season}`, h.fsi]) : []),
      ...(simulationResults ? [
        ['Simulated Score', `${simulationResults.yourScore} - ${simulationResults.oppScore}`],
        ['Win Probability', `${simulationResults.winProb}%`],
        ['Shots', simulationResults.shotsFor],
        ['Hits', simulationResults.hitsFor],
        ['Fights', simulationResults.fights],
      ] : []),
    ];
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTeam.abbr}_Future_Ice_Index_Report.csv`;
    link.click();
  };

  const sortedTeams = [...loadedTeams].sort((a, b) => b.futureIndex - a.futureIndex);
  const cupInfo = getCupWindowLabel(selectedTeam.futureIndex);

  const totalImpact = Object.keys(simulatorImpacts).reduce((sum, key) => {
    return sum + ((simulatorImpacts[key as keyof typeof simulatorImpacts] || 0) * IMPACT_VALUES[key as keyof typeof IMPACT_VALUES]);
  }, 0);

  const simulatedFSI = Math.min(100, Math.max(0, Math.round(selectedTeam.futureIndex + totalImpact)));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xl">Future Ice Index</div>
          </div>
          <button onClick={() => alert("Premium features coming soon!")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-medium">
            Go Premium
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 pt-12 pb-20">
        <div className="mb-12">
          <h1 className="text-6xl font-semibold tracking-[-2.5px] mb-3">Future Ice Index</h1>
          <p className="text-xl text-slate-400">NHL team future success projections • Grit added on top</p>
        </div>

        {/* Rankings */}
        <div className="mb-12">
          <div className="font-semibold text-2xl mb-6">NHL Team Rankings</div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-sm text-slate-400">
                  <th className="text-left px-8 py-4">Team</th>
                  <th className="text-right px-8 py-4">FSI</th>
                  <th className="text-right px-8 py-4">Grit</th>
                  <th className="text-center px-8 py-4">Cup Window</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, index) => {
                  const cup = getCupWindowLabel(team.futureIndex);
                  return (
                    <tr key={index} onClick={() => setSelectedTeam(team)} className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer">
                      <td className="px-8 py-5 font-medium">{team.team}</td>
                      <td className="px-8 py-5 text-right font-mono text-2xl font-semibold">{team.futureIndex}</td>
                      <td className="px-8 py-5 text-right font-mono text-xl text-emerald-400">{team.grit}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`${cup.color} ${cup.text} px-4 py-1 rounded-2xl text-xs font-medium`}>{cup.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Detail */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-9 mb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-4xl font-semibold">{selectedTeam.team}</div>
              <div className="text-blue-400 mt-1 text-lg">Future Success Index <span className="font-mono text-5xl text-white ml-2">{selectedTeam.futureIndex}</span></div>
              <div className="text-emerald-400 mt-1 text-lg">Grit Score <span className="font-mono text-3xl text-white ml-2">{selectedTeam.grit}</span></div>
            </div>
            <div className={`${cupInfo.color} ${cupInfo.text} px-5 py-1.5 rounded-2xl text-sm font-medium`}>{cupInfo.label}</div>
          </div>

          <button onClick={exportReport} className="mb-6 px-6 py-2 border border-slate-700 hover:bg-slate-800 rounded-2xl text-sm">
            Export Report (CSV)
          </button>

          {/* Historical Chart */}
          {selectedTeam.historical && (
            <div className="mb-8">
              <div className="text-sm text-slate-500 mb-3">Historical Trends</div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedTeam.historical}>
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="fsi" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="grit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Prospects with images */}
          <div>
            <div className="text-sm text-slate-500 mb-4">Top Prospects</div>
            {selectedTeam.prospects.length > 0 ? (
              <div className="space-y-4">
                {selectedTeam.prospects.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-950/60 px-5 py-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/id/${(i+10)%30+20}/40/40`} className="w-10 h-10 rounded-full border border-slate-700" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.pos} • {p.tier}</div>
                      </div>
                    </div>
                    <div className="font-mono text-2xl text-emerald-400">{p.rating}</div>
                  </div>
                ))}
              </div>
            ) : <div className="text-slate-400">Full prospect data in Premium</div>}
          </div>
        </div>

        {/* What-If Simulator + Game Simulator would go here in full version */}
        <div className="text-center text-slate-400 mt-8">
          Full What-If Simulator and Game Simulator are included in the complete version.<br />
          Reply “Give me the full code with simulator” if you want the longer version with everything.
        </div>
      </div>
    </div>
  );
}
