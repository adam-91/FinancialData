import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test-utils";
import { MemoryRouter } from "react-router-dom";
import { HealthcheckPage } from "../../pages/HealthcheckPage";
import i18n from "../../i18n";

vi.mock("../../hooks/useDataHealth", () => ({
  useDataHealthSummary: () => ({
    data: {
      total_indices: 10,
      indices_with_data: 8,
      indices_percent: 80,
      total_companies: 100,
      companies_with_data: 90,
      companies_percent: 90,
    },
    isLoading: false,
  }),
  useAllIndicesHealth: () => ({ data: [], isLoading: false }),
  useAllCompaniesHealth: () => ({ data: [], isLoading: false }),
  useSchedulerInfo: () => ({
    data: {
      timezone: "Europe/Warsaw",
      entries: [
        {
          id: "sync_noon_tables_A_B",
          trigger: "cron",
          day_of_week: "mon-fri",
          hour: 12,
          minute: 15,
          next_run: null,
        },
        {
          id: "sync_morning_table_C",
          trigger: "cron",
          day_of_week: "mon-fri",
          hour: 8,
          minute: 15,
          next_run: "2026-08-31T08:15:00+02:00",
        },
        {
          id: "historical_feed_background",
          trigger: "interval",
          day_of_week: null,
          hour: null,
          minute: null,
          interval_minutes: 60,
          next_run: null,
        },
        {
          id: "sync_all_tables",
          trigger: "startup",
          day_of_week: null,
          hour: null,
          minute: null,
          next_run: null,
        },
        {
          id: "historical_feed",
          trigger: "startup_manual",
          day_of_week: null,
          hour: null,
          minute: null,
          next_run: null,
        },
      ],
    },
    isLoading: false,
  }),
}));

describe("HealthcheckPage scheduler section", () => {
  it("renders all scheduled jobs with their names", () => {
    render(
      <MemoryRouter>
        <HealthcheckPage />
      </MemoryRouter>
    );

    expect(screen.getByText(i18n.t("scheduler.jobs.sync_noon_tables_A_B"))).toBeTruthy();
    expect(screen.getByText(i18n.t("scheduler.jobs.sync_morning_table_C"))).toBeTruthy();
    expect(screen.getByText(i18n.t("scheduler.jobs.sync_all_tables"))).toBeTruthy();
    expect(screen.getByText(i18n.t("scheduler.jobs.historical_feed"))).toBeTruthy();
    expect(screen.getByText(i18n.t("scheduler.jobs.historical_feed_background"))).toBeTruthy();
  });

  it("renders cron schedule times", () => {
    render(
      <MemoryRouter>
        <HealthcheckPage />
      </MemoryRouter>
    );

    const monFri = i18n.t("scheduler.monFri");
    expect(screen.getByText(`${monFri} 12:15`)).toBeTruthy();
    expect(screen.getByText(`${monFri} 08:15`)).toBeTruthy();
  });
});
