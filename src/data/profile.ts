// ─────────────────────────────────────────────────────────────
// All site content lives here. Edit this file to update the site
// without touching any component code.
// ─────────────────────────────────────────────────────────────

export const identity = {
  name: "Khaled El Nagdy",
  title: "Analytics Engineer & BI Developer",
  location: "Cairo, Egypt · Open to remote",
  tagline: "From raw data to decisions people trust.",
  summary:
    "I'm happiest with data while it's still a mess. Working out the real grain of a table, chasing down why two reports disagree, then modelling it until the number finally stops moving: that's the part I genuinely enjoy. Professionally that means Snowflake, dbt, and Power BI, currently for a Canadian retailer. Outside of work I keep building things for the problems that annoy me, an open-source warehouse and eleven small tools, all free on this site.",
  cvPath: "cv/Khaled-El-Nagdy-CV.pdf",
};

export const contact = {
  email: "knagdyknagdy@gmail.com",
  phone: "+20 100 482 1893",
  phoneHref: "tel:+201004821893",
  whatsapp: "https://wa.me/201004821893",
  linkedin: "https://linkedin.com/in/nagdii",
  github: "https://github.com/Nagdii",
};

export const stats = [
  { value: "3+", label: "Years in analytics and BI" },
  { value: "5", label: "Companies, startup to enterprise" },
  { value: "3", label: "Countries delivered for" },
  // Backed by the QNB AL-AHLI case study, which the tile links to
  { value: "0", label: "Manual refreshes left after automation", href: "#projects" },
];

export interface Role {
  title: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
}

export const experience: Role[] = [
  {
    title: "Analytics Engineer II",
    company: "FlairsTech",
    period: "04/2024 – 08/2026",
    location: "Cairo, Egypt",
    bullets: [
      "Employer of record for a two year consulting engagement, working embedded with Groupe Dynamite in Montreal. The delivery detail sits under that entry below.",
      "Tuned SQL queries, stored procedures, and scheduled jobs so client reporting refreshed faster and processed consistently.",
    ],
  },
  {
    title: "Analytics Engineer Consultant",
    company: "Groupe Dynamite",
    period: "04/2024 – 08/2026",
    location: "Montreal, Canada · Remote · Contract",
    bullets: [
      "Engaged through FlairsTech as an embedded analytics consultant, working directly with their teams.",
      "Built analytics solutions end to end in Snowflake, dbt, and Power BI, turning raw source data into models the business could rely on for critical reporting.",
      "Engineered semantic models with DAX and Power Query, which cut refresh times and improved accuracy across every reporting layer.",
      "Built and maintained pipelines pulling from REST APIs and SQL Server, so insights stayed current without anyone chasing them.",
      "Automated monitoring and alerting in Power Automate, which meant far less manual validation before each publish.",
      "Delivered executive dashboards and paginated reports used by Planning, Sales Ops, Finance, Marketing, and Executive teams.",
    ],
  },
  {
    title: "Business Intelligence Developer",
    company: "Dukan",
    period: "02/2025 – 04/2025",
    location: "Saudi Arabia · Remote · Contract",
    bullets: [
      "Delivered executive dashboards and paginated reports in Power BI and Report Builder to support finance and strategic decisions.",
      "Worked with Finance leadership to audit how reporting actually ran, and surfaced where it would break as the business grew.",
      "Proposed a modernization roadmap covering data architecture, governance, and reporting efficiency.",
      "Standardized semantic models and measures, and tightened deployment and version control using Tabular Editor.",
    ],
  },
  {
    title: "E-Business Reporting Executive",
    company: "QNB AL-AHLI",
    period: "07/2023 – 04/2024",
    location: "Cairo, Egypt",
    bullets: [
      "Built and maintained enterprise Power BI dashboards and paginated reports covering marketing campaigns, KPIs, and departmental performance.",
      "Ran ETL with SQL and PL/SQL across SQL Server and Oracle inside a heavily regulated environment.",
      "Replaced a manual daily refresh with scheduled distribution and row level security, so Marketing, Executive, and POS teams each received exactly their own numbers.",
      "Tracked down and resolved data discrepancies to keep regulated reporting trustworthy.",
    ],
  },
  {
    title: "Frontend Developer",
    company: "IntraZero",
    period: "12/2022 – 06/2023",
    location: "Cairo, Egypt",
    bullets: [
      "Built responsive web applications with React, HTML, CSS, and REST APIs, shipping production features alongside backend developers and designers.",
      "Improved front end performance and cross browser behaviour, and handled version control with Git.",
    ],
  },
  {
    title: "System Analyst",
    company: "IntraZero",
    period: "06/2021 – 11/2022",
    location: "Cairo, Egypt",
    bullets: [
      "Gathered and documented business and technical requirements for web and mobile systems.",
      "Produced UML diagrams, ERDs, and technical specifications across the full delivery cycle in Agile teams.",
    ],
  },
];

export interface Service {
  title: string;
  description: string;
  icon: string; // key into the icon map in Services.tsx
}

export const services: Service[] = [
  {
    title: "Executive Dashboards & Reports",
    description:
      "Power BI dashboards, paginated reports, and Sigma workbooks built for people who have five minutes and a decision to make. Clear KPIs, quick refresh, and a layout that survives contact with real stakeholders.",
    icon: "dashboard",
  },
  {
    title: "Data Modeling & Semantic Layers",
    description:
      "Star schemas and semantic models built with DAX, Power Query, and Tabular Editor. The goal is a model your team can still reason about a year from now, not just one that works today.",
    icon: "model",
  },
  {
    title: "Pipelines & Warehousing",
    description:
      "Pipelines on Snowflake and dbt that pull from REST APIs, SQL Server, and whatever else your data lives in, then turn it into clean, tested, analytics ready models.",
    icon: "pipeline",
  },
  {
    title: "Reporting Automation & Alerting",
    description:
      "Scheduled delivery, row level security, and anomaly monitoring in Power Automate. Reports arrive on time, already checked, without anyone babysitting a refresh.",
    icon: "automation",
  },
  {
    title: "SQL Optimization",
    description:
      "Tuning queries, stored procedures, and scheduled jobs across SQL Server and Oracle. Usually the difference between a report that loads and one people quietly stop using.",
    icon: "sql",
  },
  {
    title: "BI Audits & Modernization",
    description:
      "An honest look at your current reporting setup, followed by a roadmap you can act on. Architecture, governance, versioning, and the gaps that are costing you time every week.",
    icon: "audit",
  },
];

export interface Project {
  title: string;
  context: string;
  problem: string;
  solution: string;
  outcome: string;
  stack: string[];
  repo?: string;
  repoLabel?: string;
}

export const projects: Project[] = [
  {
    title: "Retail Analytics Platform, open source",
    context: "Demo project · Runs in one command",
    problem:
      "Client analytics work sits behind NDAs, which means the modelling decisions that actually matter stay invisible to anyone trying to judge the work.",
    solution:
      "So I built a complete warehouse on synthetic retail data. Staging through to marts, a star schema with two facts and four conformed dimensions, hashed surrogate keys, and 95 automated checks including a reconciliation test that catches silent row loss in a join.",
    outcome:
      "Clone it, run dbt build, and you have a working tested warehouse in about a minute with no cloud account. It runs unchanged on DuckDB or Snowflake.",
    stack: ["dbt", "DuckDB", "Snowflake", "SQL", "Star schema", "CI"],
    repo: "https://github.com/Nagdii/retail-analytics-platform",
    repoLabel: "View on GitHub",
  },
  {
    title: "Data Quality Detection, Proven",
    context: "Demo project · Open source",
    problem:
      "Most data quality code is written, deployed, and never tested against data that is actually broken. It runs green forever, and nobody finds out it does nothing until a stakeholder spots a wrong number first.",
    solution:
      "Planted six known faults in a 180 day metrics feed (a spike, a collapse, missing days, a null flood, a duplicate load), then built rolling-baseline detection with severity routing and a runbook for responding to each.",
    outcome:
      "Two tests assert every planted fault is caught and nothing else is flagged. Six planted, six caught, zero false positives, checked on every push.",
    stack: ["dbt", "DuckDB", "SQL", "Power Automate", "Alerting", "CI"],
    repo: "https://github.com/Nagdii/analytics-data-quality",
    repoLabel: "View on GitHub",
  },
  {
    title: "Power BI Semantic Model as Code",
    context: "Demo project · Open source",
    problem:
      "A .pbix is a binary blob. You can't diff it, review it, or see why a measure was written the way it was, so the most interesting part of BI work stays invisible.",
    solution:
      "Rebuilt a production-shaped model entirely as text: TMDL definitions, 23 documented measures, dynamic row level security, a written naming standard, and 10 Best Practice Analyzer rules that enforce it.",
    outcome:
      "CI validates the model on every push without Power BI installed, catching renamed columns, broken RLS and unguarded division before anyone opens a report.",
    stack: ["Power BI", "TMDL", "DAX", "Tabular Editor", "RLS", "CI"],
    repo: "https://github.com/Nagdii/powerbi-semantic-model",
    repoLabel: "View on GitHub",
  },
  {
    title: "End-to-End Analytics Platform on Snowflake and dbt",
    context: "Groupe Dynamite · via FlairsTech",
    problem:
      "Data was scattered across REST APIs, SQL Server, and external sources, with no single trustworthy layer underneath the reporting the business depended on.",
    solution:
      "Modelled the warehouse in Snowflake with dbt, layered semantic models on top with DAX and Power Query, and shipped executive dashboards in Power BI and Sigma Computing.",
    outcome:
      "One governed path from raw source to dashboard, serving Planning, Sales Ops, Finance, Marketing, and Executive teams with numbers that stayed current.",
    stack: ["Snowflake", "dbt", "Power BI", "Sigma", "SQL Server", "REST APIs"],
  },
  {
    title: "Automated KPI Delivery with Row-Level Security",
    context: "QNB AL-AHLI · Regulated enterprise",
    problem:
      "KPI reporting relied on somebody manually refreshing it every morning, which delayed Marketing, Executive, and POS teams inside an environment where access boundaries are not negotiable.",
    solution:
      "Replaced the manual step with scheduled distribution in Power Automate, secured with row level security so each team sees exactly its own data and nothing else.",
    outcome:
      "Daily KPIs that arrive on their own, with access rules enforced and reporting integrity intact.",
    stack: ["Power BI", "Power Automate", "RLS", "SQL Server", "Oracle", "PL/SQL"],
  },
  {
    title: "Pipeline Monitoring & Anomaly Alerting",
    context: "Groupe Dynamite · Reporting operations",
    problem:
      "Anomalies were reaching published reports before anyone spotted them, so every refresh needed a slow manual sanity check.",
    solution:
      "Built monitoring and alerting flows in Power Automate that inspect the data before publication and flag anything odd to the team straight away.",
    outcome:
      "Problems get caught before stakeholders ever see them, and the manual checking mostly went away.",
    stack: ["Power Automate", "Power BI", "SQL"],
  },
  {
    title: "Analytics Modernization Roadmap",
    context: "Dukan · Finance leadership",
    problem:
      "Reporting had grown organically over years. It worked, but it was hitting scalability limits and the same measure meant different things in different models.",
    solution:
      "Audited the workflows with Finance leadership, standardized the semantic models and measures, tightened deployment and version control with Tabular Editor, and wrote a roadmap covering architecture, governance, and efficiency.",
    outcome:
      "A prioritized path to reporting that scales, plus consistent version controlled models from day one.",
    stack: ["Power BI", "Report Builder", "Tabular Editor", "Governance"],
  },
];

export const techStack: { group: string; items: string[] }[] = [
  { group: "Data & Warehousing", items: ["Snowflake", "dbt", "SQL", "SQL Server", "Oracle", "PL/SQL"] },
  { group: "Modeling & Transformation", items: ["Star schema", "Semantic models", "DAX", "Power Query (M)"] },
  { group: "BI & Visualization", items: ["Power BI", "Paginated Reports", "Sigma Computing"] },
  { group: "Automation & Integration", items: ["Power Automate", "REST APIs", "Microsoft Fabric", "Tabular Editor"] },
  { group: "Workflow", items: ["Git", "Agile / Scrum"] },
];

export interface Education {
  qualification: string;
  institution: string;
  period: string;
  location: string;
}

export const education: Education[] = [
  {
    qualification: "Intensive Training Program, Data Visualization Track",
    institution: "Information Technology Institute (ITI)",
    period: "2020 – 2021",
    location: "Cairo, Egypt",
  },
  {
    qualification: "BSc. of Business Administration, English Section",
    institution: "Helwan University",
    period: "2016 – 2020",
    location: "Cairo, Egypt",
  },
];
