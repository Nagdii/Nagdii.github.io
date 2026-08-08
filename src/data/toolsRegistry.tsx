import type { ComponentType } from "react";
import DbtLineage from "../components/tools/DbtLineage";
import DateDimension from "../components/tools/DateDimension";
import SnowflakeCost from "../components/tools/SnowflakeCost";
import DaxPatterns from "../components/tools/DaxPatterns";
import WarehouseDesigner from "../components/tools/WarehouseDesigner";
import CsvToDdl from "../components/tools/CsvToDdl";
import SchemaYml from "../components/tools/SchemaYml";
import SqlToDbt from "../components/tools/SqlToDbt";
import NamingLinter from "../components/tools/NamingLinter";
import SqlFormatter from "../components/tools/SqlFormatter";
import PowerQuerySnippets from "../components/tools/PowerQuerySnippets";

export interface Tool {
  id: string;
  group: string;
  name: string;
  blurb: string;
  Component: ComponentType;
}

export const TOOLS: Tool[] = [
  { id: "warehouse", group: "Modeling", name: "Data Warehouse Designer", blurb: "Turn a flat extract into a star schema", Component: WarehouseDesigner },
  { id: "lineage", group: "Modeling", name: "dbt Lineage Visualizer", blurb: "Paste models, see the DAG", Component: DbtLineage },
  { id: "date", group: "Modeling", name: "Date Dimension Generator", blurb: "Calendar tables with fiscal periods", Component: DateDimension },

  { id: "csv", group: "dbt & SQL", name: "CSV to DDL & Seed", blurb: "Infer types, emit CREATE TABLE", Component: CsvToDdl },
  { id: "schema", group: "dbt & SQL", name: "schema.yml Generator", blurb: "Descriptions and tests, prefilled", Component: SchemaYml },
  { id: "sqldbt", group: "dbt & SQL", name: "SQL to dbt Model", blurb: "Add refs, config and incremental logic", Component: SqlToDbt },
  { id: "format", group: "dbt & SQL", name: "SQL Formatter", blurb: "Pretty printer that respects literals", Component: SqlFormatter },
  { id: "naming", group: "dbt & SQL", name: "Naming Linter", blurb: "Catch casing and prefix drift", Component: NamingLinter },

  { id: "dax", group: "Power BI", name: "DAX Time Intelligence", blurb: "Correct measures, no divide-by-zero", Component: DaxPatterns },
  { id: "pq", group: "Power BI", name: "Power Query Snippets", blurb: "Pagination, folding, fuzzy merge", Component: PowerQuerySnippets },

  { id: "cost", group: "Platform", name: "Snowflake Cost Estimator", blurb: "Model spend before the invoice lands", Component: SnowflakeCost },
];

export const TOOL_GROUPS = ["Modeling", "dbt & SQL", "Power BI", "Platform"];

export const toolsByGroup = (group: string) => TOOLS.filter((t) => t.group === group);

export const findTool = (id: string) => TOOLS.find((t) => t.id === id);
