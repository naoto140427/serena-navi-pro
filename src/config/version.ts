export const APP_VERSION = "0.9.4 Beta";
export const BUILD_DATE = "2026.01.05"; // 旅行開始日に合わせるか、今日の日付

export type ReleaseNote = {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "0.9.0",
    date: "2026.01.05",
    type: "minor",
    changes: [
      "Added Highway Sign Widget (所要時間案内板の実装)",
      "Added Traffic Information Ticker (交通情報テロップの実装)",
      "Performance improvements for Cockpit view"
    ]
  },
  {
    version: "0.6.2",
    date: "2026.01.05",
    type: "patch",
    changes: [
      "Fixed Firebase connection errors",
      "Fixed Co-Pilot page crash issues",
      "Optimized Store performance"
    ]
  },
  {
    version: "0.6.0",
    date: "2026.01.05",
    type: "minor",
    changes: [
      "Implemented Firebase Realtime Database",
      "Enabled Sync between devices (Driver/Passenger)",
      "Added Notification System"
    ]
  },
  {
    version: "0.5.0",
    date: "2026.01.04",
    type: "minor",
    changes: [
      "Responsive Design for iPhone/Smartphone",
      "UI/UX improvements for Cockpit"
    ]
  },
  {
    version: "0.1.0",
    date: "2025.12.30",
    type: "major",
    changes: [
      "Initial Release",
      "Basic Navigation System",
      "ProPILOT UI Concept"
    ]
  }
];