// ─────────────────────────────────────────────────────────────
// All site content lives here. Edit this file to update the site
// without touching any component code.
// ─────────────────────────────────────────────────────────────

export const identity = {
  name: "Khaled El Nagdy",
  title: "Analytics Engineer & BI Developer",
  location: "Cairo, Egypt · Remote-friendly",
  tagline: "From raw data to decision-ready dashboards.",
  summary:
    "Analytics Engineer with 3+ years building end-to-end analytics solutions across Snowflake, dbt, and Power BI. Strong in scalable data modeling, SQL transformation, and executive reporting for international stakeholders. Comfortable owning the pipeline from raw source to decision-ready dashboard, and translating business requirements into reliable data architecture in Agile teams.",
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
  { value: "3+", label: "Years in Analytics & BI" },
  { value: "5", label: "Companies, enterprise to startup" },
  { value: "6+", label: "Business functions served" },
  { value: "E2E", label: "Warehouse → model → dashboard" },
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
    location: "Cairo",
    bullets: [
      "Employer of record for a two-year embedded consulting engagement, deployed to Groupe Dynamite (Montreal, remote) as their analytics consultant — delivery detailed below.",
      "Optimized SQL queries, stored procedures, and scheduled jobs, improving report refresh efficiency and processing consistency across client reporting workloads.",
    ],
  },
  {
    title: "Analytics Engineer Consultant",
    company: "Groupe Dynamite",
    period: "04/2024 – 08/2026",
    location: "Montreal, Canada · Remote · Contract",
    bullets: [
      "Engaged via FlairsTech as an embedded analytics consultant for Groupe Dynamite.",
      "Built end-to-end analytics solutions in Snowflake, dbt, and Power BI, converting raw source data into scalable, analytics-ready models powering business-critical reporting.",
      "Engineered semantic models with DAX and Power Query, improving refresh performance and accuracy across reporting layers.",
      "Built and maintained data pipelines integrating REST APIs and SQL Server, delivering consistently refreshed insights.",
      "Automated monitoring and alerting in Power Automate, reducing manual validation effort.",
      "Developed executive dashboards and paginated reports serving stakeholders across Planning, Sales Ops, Finance, Marketing, and Executive teams.",
    ],
  },
  {
    title: "Business Intelligence Developer",
    company: "Dukan",
    period: "02/2025 – 04/2025",
    location: "KSA · 3-month contract",
    bullets: [
      "Delivered executive dashboards and paginated reports in Power BI and Report Builder, supporting finance and strategic decision-making.",
      "Partnered with Finance leadership to audit reporting workflows and surface scalability and performance gaps.",
      "Proposed an analytics modernization roadmap covering data architecture, governance, and reporting efficiency.",
      "Standardized semantic models and measures and tightened deployment and version control using Tabular Editor.",
    ],
  },
  {
    title: "E-Business Reporting Executive",
    company: "QNB AL-AHLI",
    period: "07/2023 – 04/2024",
    location: "Cairo",
    bullets: [
      "Built and maintained enterprise Power BI dashboards and paginated reports tracking marketing campaigns, KPIs, and performance metrics across departments.",
      "Ran ETL with SQL and PL/SQL across SQL Server and Oracle within a highly regulated enterprise environment.",
      "Replaced a manual daily refresh with automated, scheduled report distribution and row-level security (RLS) KPI delivery to Marketing, Executive, and POS teams using Power Automate.",
      "Resolved data discrepancies to maintain integrity across regulated reporting.",
    ],
  },
  {
    title: "Frontend Developer",
    company: "IntraZero",
    period: "12/2022 – 06/2023",
    location: "Cairo",
    bullets: [
      "Built responsive web applications with React, HTML, CSS, and REST APIs in an Agile team, shipping production features with backend developers and designers.",
      "Optimized front-end performance and cross-browser compatibility; managed Git-based version control.",
    ],
  },
  {
    title: "System Analyst",
    company: "IntraZero",
    period: "06/2021 – 11/2022",
    location: "Cairo",
    bullets: [
      "Gathered and documented business and technical requirements for web and mobile systems.",
      "Produced UML diagrams, ERDs, and technical specifications across SDLC phases in Agile project teams.",
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
      "Decision-ready Power BI dashboards, paginated reports, and Sigma Computing workbooks built for executives — clear KPIs, fast refresh, and layouts stakeholders actually use.",
    icon: "dashboard",
  },
  {
    title: "Data Modeling & Semantic Layers",
    description:
      "Star schemas and semantic models engineered with DAX, Power Query (M), and Tabular Editor — accurate, maintainable, and fast across every reporting layer.",
    icon: "model",
  },
  {
    title: "Pipelines & Warehousing",
    description:
      "End-to-end pipelines on Snowflake and dbt integrating REST APIs, SQL Server, and external sources — raw data transformed into scalable, analytics-ready models.",
    icon: "pipeline",
  },
  {
    title: "Reporting Automation & Alerting",
    description:
      "Scheduled distribution, row-level security delivery, and anomaly monitoring with Power Automate — insights arrive on time, validated, without manual effort.",
    icon: "automation",
  },
  {
    title: "SQL Optimization",
    description:
      "Query, stored-procedure, and scheduled-job tuning across SQL Server and Oracle — faster refreshes and consistent processing for heavy reporting workloads.",
    icon: "sql",
  },
  {
    title: "BI Audits & Modernization",
    description:
      "Audits of existing reporting workflows with a concrete modernization roadmap — architecture, governance, versioning, and efficiency gaps turned into an action plan.",
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
}

export const projects: Project[] = [
  {
    title: "End-to-End Analytics Platform on Snowflake + dbt",
    context: "Groupe Dynamite · via FlairsTech",
    problem:
      "Raw data scattered across REST APIs, SQL Server, and external sources — no single analytics-ready layer to power business-critical reporting.",
    solution:
      "Modeled the warehouse in Snowflake with dbt transformations, layered semantic models with DAX and Power Query, and shipped executive dashboards in Power BI and Sigma Computing.",
    outcome:
      "One governed pipeline from raw source to dashboard, serving Planning, Sales Ops, Finance, Marketing, and Executive teams with consistently refreshed insights.",
    stack: ["Snowflake", "dbt", "Power BI", "Sigma", "SQL Server", "REST APIs"],
  },
  {
    title: "Automated KPI Delivery with Row-Level Security",
    context: "QNB AL-AHLI · Regulated enterprise",
    problem:
      "KPI reporting depended on a manual daily refresh, delaying delivery to Marketing, Executive, and POS teams inside a regulated environment.",
    solution:
      "Replaced the manual process with automated, scheduled report distribution in Power Automate, secured with row-level security so each team sees exactly its own data.",
    outcome:
      "Hands-off daily KPI delivery with enforced data-access boundaries and integrity maintained across regulated reporting.",
    stack: ["Power BI", "Power Automate", "RLS", "SQL Server", "Oracle", "PL/SQL"],
  },
  {
    title: "Pipeline Monitoring & Anomaly Alerting",
    context: "Groupe Dynamite · Reporting operations",
    problem:
      "Data anomalies were reaching published reports before anyone caught them, forcing time-consuming manual validation of every refresh.",
    solution:
      "Built automated monitoring and alerting flows in Power Automate that inspect data ahead of publication and flag anomalies to the team immediately.",
    outcome:
      "Anomalies surfaced before stakeholders ever see them, with manual validation effort significantly reduced.",
    stack: ["Power Automate", "Power BI", "SQL"],
  },
  {
    title: "Analytics Modernization Roadmap & Semantic Standardization",
    context: "Dukan · Finance leadership",
    problem:
      "Reporting workflows had grown organically — scalability limits, performance gaps, and inconsistent measures across models.",
    solution:
      "Audited workflows with Finance leadership, standardized semantic models and measures, tightened deployment and version control with Tabular Editor, and delivered a modernization roadmap covering architecture, governance, and efficiency.",
    outcome:
      "A concrete, prioritized path to scalable reporting — plus consistent, version-controlled semantic models from day one.",
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

export const education = {
  degree: "BSc. of Business Administration — English Section",
  school: "Helwan University",
  period: "2016 – 2020",
  extra:
    "Intensive Training Program (ITP), Data Visualization Track — Information Technology Institute (ITI), 2020–2021",
};
